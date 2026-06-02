'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const RETRYABLE = new Set(['P1001', 'P1008', 'P1017', 'P2024'])

async function dbRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (i < retries && code && RETRYABLE.has(code)) {
        await new Promise(r => setTimeout(r, 2500))
        continue
      }
      throw err
    }
  }
  throw new Error('unreachable')
}

export async function createSession({ lessonId, timePerQuestion }: { lessonId: string; timePerQuestion: number }): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  let code = generateSessionCode()
  while (await dbRetry(() => prisma.quizSession.findUnique({ where: { code } }))) {
    code = generateSessionCode()
  }

  const quizSession = await dbRetry(() =>
    prisma.quizSession.create({
      data: {
        code,
        hostId: session.user.id,
        lessonId,
        timePerQuestionSec: timePerQuestion,
        status: 'WAITING',
      },
    })
  )
  revalidatePath('/teacher/sessions')
  return quizSession.id
}

export async function startQuizSession(
  sessionId: string,
  timeBetweenSecs: number
): Promise<{ ok: boolean; error?: string }> {
  console.log('[startQuizSession] called', { sessionId, timeBetweenSecs })
  try {
    const userSession = await auth()
    console.log('[startQuizSession] auth result:', userSession?.user?.id ?? 'null')
    if (!userSession?.user?.id) return { ok: false, error: 'Unauthorized' }

    const quizSession = await dbRetry(() =>
      prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: { lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } } },
      })
    )

    if (!quizSession) return { ok: false, error: 'Session not found' }
    if (quizSession.hostId !== userSession.user.id) return { ok: false, error: 'Forbidden' }

    const firstQuestion = quizSession.lesson.questions[0]
    if (!firstQuestion) return { ok: false, error: 'No questions' }

    await dbRetry(() =>
      prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
          currentQuestionId: firstQuestion.id,
          questionChangedAt: new Date(),
          timeBetweenQuestionsSec: Math.max(0, Math.min(30, timeBetweenSecs)),
        },
      })
    )

    return { ok: true }
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string; meta?: unknown }
    console.error('startQuizSession error | code:', e?.code, '| message:', e?.message, '| meta:', e?.meta)
    return { ok: false, error: `${e?.code ?? 'unknown'}: ${e?.message ?? String(err)}` }
  }
}

export async function nextQuizQuestion(
  sessionId: string
): Promise<{ ok: boolean; finished?: boolean; error?: string }> {
  try {
    const userSession = await auth()
    if (!userSession?.user?.id) return { ok: false, error: 'Unauthorized' }

    const quizSession = await dbRetry(() =>
      prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: { lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } } },
      })
    )

    if (!quizSession || quizSession.hostId !== userSession.user.id)
      return { ok: false, error: 'Forbidden' }

    const questions = quizSession.lesson.questions
    const currentIdx = questions.findIndex(q => q.id === quizSession.currentQuestionId)
    const next = questions[currentIdx + 1]

    if (!next) {
      const participants = await dbRetry(() =>
        prisma.participation.findMany({ where: { sessionId }, orderBy: { totalScore: 'desc' } })
      )
      await Promise.all([
        dbRetry(() =>
          prisma.quizSession.update({ where: { id: sessionId }, data: { status: 'FINISHED', endedAt: new Date() } })
        ),
        ...participants.map((p, i) =>
          dbRetry(() =>
            prisma.participation.update({
              where: { userId_sessionId: { userId: p.userId, sessionId } },
              data: { rank: i + 1 },
            })
          )
        ),
      ])
      return { ok: true, finished: true }
    }

    await dbRetry(() =>
      prisma.quizSession.update({
        where: { id: sessionId },
        data: { currentQuestionId: next.id, questionChangedAt: new Date() },
      })
    )
    return { ok: true, finished: false }
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    console.error('nextQuizQuestion error | code:', e?.code, '| msg:', e?.message)
    return { ok: false, error: `${e?.code ?? 'unknown'}: ${e?.message ?? String(err)}` }
  }
}

export async function endQuizSession(sessionId: string): Promise<{ ok: boolean }> {
  try {
    const userSession = await auth()
    if (!userSession?.user?.id) return { ok: false }

    const quizSession = await dbRetry(() =>
      prisma.quizSession.findUnique({ where: { id: sessionId } })
    )
    if (!quizSession || quizSession.hostId !== userSession.user.id) return { ok: false }

    const participants = await dbRetry(() =>
      prisma.participation.findMany({ where: { sessionId }, orderBy: { totalScore: 'desc' } })
    )
    await Promise.all([
      dbRetry(() =>
        prisma.quizSession.update({ where: { id: sessionId }, data: { status: 'FINISHED', endedAt: new Date() } })
      ),
      ...participants.map((p, i) =>
        dbRetry(() =>
          prisma.participation.update({
            where: { userId_sessionId: { userId: p.userId, sessionId } },
            data: { rank: i + 1 },
          })
        )
      ),
    ])
    return { ok: true }
  } catch (err) {
    console.error('endQuizSession error:', err)
    return { ok: false }
  }
}
