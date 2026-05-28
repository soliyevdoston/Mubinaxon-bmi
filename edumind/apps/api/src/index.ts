import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { prisma } from '@edumind/database'
import { updateKnowledgePoint } from './knowledge'

const app = express()
const httpServer = createServer(app)

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://admin.edumind.uz',
  'https://teacher.edumind.uz',
  'https://student.edumind.uz',
]

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'db_unavailable', timestamp: new Date().toISOString() })
  }
})

type SocketData = {
  userId?: string
  sessionId?: string
}

io.on('connection', (socket) => {
  const socketData: SocketData = {}

  socket.on('session:join', async ({ code, userId }: { code: string; userId: string }) => {
    try {
      const session = await prisma.quizSession.findUnique({
        where: { code },
      })

      if (!session) {
        socket.emit('error', { message: 'Sessiya topilmadi' })
        return
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, avatarUrl: true },
      })

      if (!user) {
        socket.emit('error', { message: 'Foydalanuvchi topilmadi' })
        return
      }

      await prisma.participation.upsert({
        where: { userId_sessionId: { userId, sessionId: session.id } },
        update: {},
        create: { userId, sessionId: session.id },
      })

      socket.join(session.id)
      socketData.userId = userId
      socketData.sessionId = session.id

      const participation = await prisma.participation.findUnique({
        where: { userId_sessionId: { userId, sessionId: session.id } },
        select: { totalScore: true, rank: true },
      })

      io.to(session.id).emit('session:participantJoined', {
        user: {
          userId: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          totalScore: participation?.totalScore ?? 0,
          rank: participation?.rank ?? null,
        },
      })
    } catch (err) {
      console.error('session:join error:', err)
      socket.emit('error', { message: 'Server xatosi yuz berdi' })
    }
  })

  socket.on('host:start', async ({ sessionId }: { sessionId: string }) => {
    try {
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: {
          lesson: {
            include: {
              questions: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      })

      if (!session || session.hostId !== socketData.userId) return
      if (session.status !== 'WAITING') return

      const firstQuestion = session.lesson.questions[0]
      if (!firstQuestion) return

      await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
          currentQuestionId: firstQuestion.id,
        },
      })

      const deadline = Date.now() + session.timePerQuestionSec * 1000

      io.to(sessionId).emit('session:started', {
        firstQuestion: {
          id: firstQuestion.id,
          text: firstQuestion.text,
          options: firstQuestion.options as string[],
          correctIndex: firstQuestion.correctIndex,
          difficulty: firstQuestion.difficulty,
          explanation: firstQuestion.explanation,
          topicId: firstQuestion.topicId,
        },
        deadline,
        timePerQuestion: session.timePerQuestionSec,
      })
    } catch (err) {
      console.error('host:start error:', err)
      socket.emit('error', { message: 'Server xatosi yuz berdi' })
    }
  })

  socket.on(
    'answer:submit',
    async ({
      sessionId,
      questionId,
      selectedIndex,
      responseTimeMs,
    }: {
      sessionId: string
      questionId: string
      selectedIndex: number
      responseTimeMs: number
    }) => {
      try {
        const { userId } = socketData
        if (!userId) return

        const question = await prisma.question.findUnique({ where: { id: questionId } })
        if (!question) return

        const isCorrect = question.correctIndex === selectedIndex
        const maxPoints = 1000
        const session = await prisma.quizSession.findUnique({ where: { id: sessionId } })
        const timeBonus = session
          ? Math.max(0, 1 - responseTimeMs / (session.timePerQuestionSec * 1000))
          : 0
        const pointsEarned = isCorrect ? Math.round(maxPoints * (0.5 + 0.5 * timeBonus)) : 0

        await prisma.answer.create({
          data: {
            userId,
            questionId,
            sessionId,
            selectedIndex,
            isCorrect,
            responseTimeMs,
            pointsEarned,
          },
        })

        if (isCorrect) {
          await prisma.participation.update({
            where: { userId_sessionId: { userId, sessionId } },
            data: { totalScore: { increment: pointsEarned } },
          })
        }

        await updateKnowledgePoint(userId, question.topicId, isCorrect)

        const [participants, correctAnswers] = await Promise.all([
          prisma.participation.findMany({
            where: { sessionId },
            include: { user: { select: { fullName: true, avatarUrl: true } } },
            orderBy: { totalScore: 'desc' },
          }),
          prisma.answer.groupBy({
            by: ['userId'],
            where: { sessionId, isCorrect: true },
            _count: { id: true },
          }),
        ])

        const correctMap = new Map(correctAnswers.map(a => [a.userId, a._count.id]))

        const rankings = participants.map((p, idx) => ({
          userId: p.userId,
          fullName: p.user.fullName,
          avatarUrl: p.user.avatarUrl,
          totalScore: p.totalScore,
          rank: idx + 1,
          answersCorrect: correctMap.get(p.userId) ?? 0,
          answersTotal: 0,
        }))

        io.to(sessionId).emit('leaderboard:update', { rankings })
      } catch (err) {
        console.error('answer:submit error:', err)
        socket.emit('error', { message: 'Javob yuborishda xato' })
      }
    }
  )

  socket.on('host:nextQuestion', async ({ sessionId }: { sessionId: string }) => {
    try {
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: {
          lesson: {
            include: {
              questions: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      })

      if (!session || session.hostId !== socketData.userId) return

      const questions = session.lesson.questions
      const currentIdx = questions.findIndex((q) => q.id === session.currentQuestionId)
      const nextQuestion = questions[currentIdx + 1]

      if (!nextQuestion) {
        await prisma.quizSession.update({
          where: { id: sessionId },
          data: { status: 'FINISHED', endedAt: new Date() },
        })

        const [participants, correctAnswers] = await Promise.all([
          prisma.participation.findMany({
            where: { sessionId },
            include: { user: { select: { fullName: true, avatarUrl: true } } },
            orderBy: { totalScore: 'desc' },
          }),
          prisma.answer.groupBy({
            by: ['userId'],
            where: { sessionId, isCorrect: true },
            _count: { id: true },
          }),
        ])

        const correctMap = new Map(correctAnswers.map(a => [a.userId, a._count.id]))

        const finalResults = participants.map((p, idx) => ({
          userId: p.userId,
          fullName: p.user.fullName,
          avatarUrl: p.user.avatarUrl,
          totalScore: p.totalScore,
          rank: idx + 1,
          answersCorrect: correctMap.get(p.userId) ?? 0,
          answersTotal: questions.length,
        }))

        await Promise.all(
          finalResults.map(r =>
            prisma.participation.update({
              where: { userId_sessionId: { userId: r.userId, sessionId } },
              data: { rank: r.rank },
            })
          )
        )

        io.to(sessionId).emit('session:ended', { finalResults })
        return
      }

      await prisma.quizSession.update({
        where: { id: sessionId },
        data: { currentQuestionId: nextQuestion.id },
      })

      const deadline = Date.now() + session.timePerQuestionSec * 1000

      io.to(sessionId).emit('question:show', {
        question: {
          id: nextQuestion.id,
          text: nextQuestion.text,
          options: nextQuestion.options as string[],
          correctIndex: nextQuestion.correctIndex,
          difficulty: nextQuestion.difficulty,
          explanation: nextQuestion.explanation,
          topicId: nextQuestion.topicId,
        },
        deadline,
        questionIndex: currentIdx + 1,
        timePerQuestion: session.timePerQuestionSec,
      })
    } catch (err) {
      console.error('host:nextQuestion error:', err)
      socket.emit('error', { message: 'Server xatosi yuz berdi' })
    }
  })

  socket.on('host:pause', async ({ sessionId }: { sessionId: string }) => {
    try {
      const session = await prisma.quizSession.findUnique({ where: { id: sessionId } })
      if (!session || session.hostId !== socketData.userId) return

      await prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: 'PAUSED' },
      })

      io.to(sessionId).emit('session:paused')
    } catch (err) {
      console.error('host:pause error:', err)
      socket.emit('error', { message: 'Server xatosi yuz berdi' })
    }
  })

  socket.on('host:end', async ({ sessionId }: { sessionId: string }) => {
    try {
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: { lesson: { include: { questions: true } } },
      })
      if (!session || session.hostId !== socketData.userId) return

      await prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: 'FINISHED', endedAt: new Date() },
      })

      const [participants, correctAnswers] = await Promise.all([
        prisma.participation.findMany({
          where: { sessionId },
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { totalScore: 'desc' },
        }),
        prisma.answer.groupBy({
          by: ['userId'],
          where: { sessionId, isCorrect: true },
          _count: { id: true },
        }),
      ])

      const correctMap = new Map(correctAnswers.map(a => [a.userId, a._count.id]))

      const finalResults = participants.map((p, idx) => ({
        userId: p.userId,
        fullName: p.user.fullName,
        avatarUrl: p.user.avatarUrl,
        totalScore: p.totalScore,
        rank: idx + 1,
        answersCorrect: correctMap.get(p.userId) ?? 0,
        answersTotal: session.lesson.questions.length,
      }))

      await Promise.all(
        finalResults.map(r =>
          prisma.participation.update({
            where: { userId_sessionId: { userId: r.userId, sessionId } },
            data: { rank: r.rank },
          })
        )
      )

      io.to(sessionId).emit('session:ended', { finalResults })
    } catch (err) {
      console.error('host:end error:', err)
      socket.emit('error', { message: 'Server xatosi yuz berdi' })
    }
  })

  socket.on('disconnect', async () => {
    try {
      const { userId, sessionId } = socketData
      if (userId && sessionId) {
        await prisma.participation.updateMany({
          where: { userId, sessionId },
          data: { leftAt: new Date() },
        })
        io.to(sessionId).emit('session:participantLeft', { userId })
      }
    } catch (err) {
      console.error('disconnect error:', err)
    }
  })
})

const PORT = process.env.PORT ?? 4000

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
  prisma.$queryRaw`SELECT 1`.catch(() => {})
})
