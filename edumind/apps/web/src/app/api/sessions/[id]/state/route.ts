import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'
import { withRetry } from '@/lib/db-retry'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const session = await withRetry(() =>
      prisma.quizSession.findUnique({
        where: { id },
        include: {
          lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } },
          participations: {
            include: {
              user: { select: { id: true, fullName: true, avatarUrl: true, heroClass: true } },
            },
            orderBy: { totalScore: 'desc' },
          },
        },
      })
    )

    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const questions = session.lesson.questions
    const questionIndex = session.currentQuestionId
      ? questions.findIndex(q => q.id === session.currentQuestionId)
      : 0
    const currentQuestion = questionIndex >= 0 ? questions[questionIndex] : null

    const correctAnswers = await withRetry(() =>
      prisma.answer.groupBy({
        by: ['userId'],
        where: { sessionId: id, isCorrect: true },
        _count: { id: true },
      })
    )
    const correctMap = new Map(correctAnswers.map(a => [a.userId, a._count.id]))

    const leaderboard = session.participations.map((p, i) => ({
      userId: p.userId,
      fullName: p.user.fullName,
      avatarUrl: p.user.avatarUrl,
      heroClass: p.user.heroClass,
      totalScore: p.totalScore,
      rank: p.rank ?? i + 1,
      answersCorrect: correctMap.get(p.userId) ?? 0,
      answersTotal: questionIndex,
      currentStreak: p.currentStreak,
      skillUsed: p.skillUsed,
    }))

    const timeBetween = session.timeBetweenQuestionsSec ?? 0
    let secondsUntilQuestion = 0
    if (session.questionChangedAt && timeBetween > 0) {
      const elapsed = (Date.now() - session.questionChangedAt.getTime()) / 1000
      secondsUntilQuestion = Math.max(0, Math.ceil(timeBetween - elapsed))
    }

    return NextResponse.json({
      status: session.status,
      currentQuestionId: session.currentQuestionId,
      currentQuestion,
      questionIndex: Math.max(0, questionIndex),
      totalQuestions: questions.length,
      timePerQuestionSec: session.timePerQuestionSec,
      timeBetweenQuestionsSec: timeBetween,
      secondsUntilQuestion,
      participants: session.participations.map(p => ({
        userId: p.userId,
        fullName: p.user.fullName,
        avatarUrl: p.user.avatarUrl,
        heroClass: p.user.heroClass,
        totalScore: p.totalScore,
        currentStreak: p.currentStreak,
      })),
      leaderboard,
    })
  } catch (err) {
    console.error('state route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
