import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'
import { withRetry } from '@/lib/db-retry'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userSession = await auth()
    if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const session = await withRetry(() =>
      prisma.quizSession.findUnique({
        where: { id },
        include: { lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } } },
      })
    )

    if (!session || session.hostId !== userSession.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const questions = session.lesson.questions
    const currentIdx = questions.findIndex(q => q.id === session.currentQuestionId)
    const next = questions[currentIdx + 1]

    if (!next) {
      const [participants, correctAnswers] = await Promise.all([
        withRetry(() =>
          prisma.participation.findMany({
            where: { sessionId: id },
            orderBy: { totalScore: 'desc' },
          })
        ),
        withRetry(() =>
          prisma.answer.groupBy({ by: ['userId'], where: { sessionId: id, isCorrect: true }, _count: { id: true } })
        ),
      ])

      await Promise.all([
        withRetry(() =>
          prisma.quizSession.update({ where: { id }, data: { status: 'FINISHED', endedAt: new Date() } })
        ),
        ...participants.map((p, i) =>
          withRetry(() =>
            prisma.participation.update({
              where: { userId_sessionId: { userId: p.userId, sessionId: id } },
              data: { rank: i + 1 },
            })
          )
        ),
      ])
      return NextResponse.json({ finished: true })
    }

    await withRetry(() =>
      prisma.quizSession.update({
        where: { id },
        data: { currentQuestionId: next.id, questionChangedAt: new Date() },
      })
    )
    return NextResponse.json({ ok: true, timeBetweenQuestionsSec: session.timeBetweenQuestionsSec })
  } catch (err) {
    console.error('next question error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
