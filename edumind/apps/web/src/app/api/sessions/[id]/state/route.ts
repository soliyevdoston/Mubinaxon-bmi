import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } },
      participations: {
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { totalScore: 'desc' },
      },
    },
  })

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const questions = session.lesson.questions
  const questionIndex = session.currentQuestionId
    ? questions.findIndex(q => q.id === session.currentQuestionId)
    : 0
  const currentQuestion = questionIndex >= 0 ? questions[questionIndex] : null

  const correctAnswers = await prisma.answer.groupBy({
    by: ['userId'],
    where: { sessionId: id, isCorrect: true },
    _count: { id: true },
  })
  const correctMap = new Map(correctAnswers.map(a => [a.userId, a._count.id]))

  const leaderboard = session.participations.map((p, i) => ({
    userId: p.userId,
    fullName: p.user.fullName,
    avatarUrl: p.user.avatarUrl,
    totalScore: p.totalScore,
    rank: p.rank ?? i + 1,
    answersCorrect: correctMap.get(p.userId) ?? 0,
    answersTotal: questionIndex,
  }))

  return NextResponse.json({
    status: session.status,
    currentQuestionId: session.currentQuestionId,
    currentQuestion,
    questionIndex: Math.max(0, questionIndex),
    totalQuestions: questions.length,
    timePerQuestionSec: session.timePerQuestionSec,
    participants: session.participations.map(p => ({
      userId: p.userId,
      fullName: p.user.fullName,
      avatarUrl: p.user.avatarUrl,
      totalScore: p.totalScore,
    })),
    leaderboard,
  })
}
