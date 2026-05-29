import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './db'
import { updateKnowledgePoint } from './knowledge'

const app = express()

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3003',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'db_unavailable', timestamp: new Date().toISOString() })
  }
})

// ── Platform stats (used by web landing brain) ───────────────────────────────
app.get('/api/stats', async (_req, res) => {
  try {
    const [totalUsers, totalSessions, activeSessions, activeStudents] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.quizSession.count(),
      prisma.quizSession.count({ where: { status: 'ACTIVE' } }),
      prisma.participation.count({ where: { session: { status: 'ACTIVE' }, leftAt: null } }),
    ])
    res.json({ totalUsers, totalSessions, activeSessions, activeStudents })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Session state (polling fallback for external clients) ─────────────────────
app.get('/api/sessions/:id/state', async (req, res) => {
  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: req.params.id },
      include: {
        lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } },
        participations: {
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
          orderBy: { totalScore: 'desc' },
        },
      },
    })
    if (!session) return res.status(404).json({ error: 'Not found' })

    const questions = session.lesson.questions
    const qIdx = session.currentQuestionId
      ? questions.findIndex(q => q.id === session.currentQuestionId)
      : 0
    const currentQuestion = qIdx >= 0 ? questions[qIdx] : null

    res.json({
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      currentQuestion,
      questionIndex: Math.max(0, qIdx),
      totalQuestions: questions.length,
      timePerQuestionSec: session.timePerQuestionSec,
      participants: session.participations.map(p => ({
        userId: p.userId,
        fullName: p.user.fullName,
        totalScore: p.totalScore,
      })),
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── Answer submit (for external clients) ─────────────────────────────────────
app.post('/api/sessions/:id/answer', async (req, res) => {
  try {
    const { userId, questionId, selectedIndex, responseTimeMs } = req.body as {
      userId: string; questionId: string; selectedIndex: number; responseTimeMs: number
    }
    if (!userId || !questionId) return res.status(400).json({ error: 'Missing fields' })

    const [question, session] = await Promise.all([
      prisma.question.findUnique({ where: { id: questionId } }),
      prisma.quizSession.findUnique({ where: { id: req.params.id } }),
    ])
    if (!question || !session) return res.status(404).json({ error: 'Not found' })

    const existing = await prisma.answer.findFirst({
      where: { userId, sessionId: req.params.id, questionId },
    })
    if (existing) {
      return res.json({ isCorrect: existing.isCorrect, pointsEarned: existing.pointsEarned, correctIndex: question.correctIndex })
    }

    const isCorrect = question.correctIndex === selectedIndex
    const timeBonus = Math.max(0, 1 - responseTimeMs / (session.timePerQuestionSec * 1000))
    const pointsEarned = isCorrect ? Math.round(1000 * (0.5 + 0.5 * timeBonus)) : 0

    await prisma.answer.create({
      data: { userId, questionId, sessionId: req.params.id, selectedIndex, isCorrect, responseTimeMs, pointsEarned },
    })

    if (isCorrect) {
      await prisma.participation.update({
        where: { userId_sessionId: { userId, sessionId: req.params.id } },
        data: { totalScore: { increment: pointsEarned } },
      })
    }

    await updateKnowledgePoint(userId, question.topicId, isCorrect)
    res.json({ isCorrect, pointsEarned, correctIndex: question.correctIndex })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => {
  console.log(`EduMind API running on port ${PORT}`)
  prisma.$queryRaw`SELECT 1`.catch(() => {})
})
