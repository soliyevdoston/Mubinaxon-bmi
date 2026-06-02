import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 2000): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (i < retries && (code === 'P1001' || code === 'P1008' || code === 'P1017')) {
        await new Promise(r => setTimeout(r, delayMs))
        continue
      }
      throw err
    }
  }
  throw new Error('unreachable')
}

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

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    if (session.hostId !== userSession.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const firstQuestion = session.lesson.questions[0]
    if (!firstQuestion) return NextResponse.json({ error: 'No questions' }, { status: 400 })

    await withRetry(() =>
      prisma.quizSession.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
          currentQuestionId: firstQuestion.id,
          questionChangedAt: new Date(),
        },
      })
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('start session error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
