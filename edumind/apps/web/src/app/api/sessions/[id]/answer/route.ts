import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'
import { getStreakBonus } from '@/lib/heroes'

async function updateKnowledgePoint(userId: string, topicId: string, isCorrect: boolean) {
  const kp = await prisma.knowledgePoint.findUnique({ where: { userId_topicId: { userId, topicId } } })
  const attempts = (kp?.attemptsCount ?? 0) + 1
  const correct = (kp?.correctCount ?? 0) + (isCorrect ? 1 : 0)
  await prisma.knowledgePoint.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { attemptsCount: attempts, correctCount: correct, masteryLevel: correct / attempts, lastPracticedAt: new Date() },
    create: { userId, topicId, attemptsCount: attempts, correctCount: correct, masteryLevel: correct / attempts },
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { questionId, selectedIndex, responseTimeMs, useSkill } = await req.json() as {
    questionId: string
    selectedIndex: number
    responseTimeMs: number
    useSkill?: boolean
  }

  const [question, quizSession, participation] = await Promise.all([
    prisma.question.findUnique({ where: { id: questionId } }),
    prisma.quizSession.findUnique({ where: { id } }),
    prisma.participation.findUnique({
      where: { userId_sessionId: { userId: userSession.user.id, sessionId: id } },
    }),
  ])

  if (!question || !quizSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.answer.findFirst({
    where: { userId: userSession.user.id, sessionId: id, questionId },
  })
  if (existing) {
    return NextResponse.json({
      isCorrect: existing.isCorrect,
      pointsEarned: existing.pointsEarned,
      correctIndex: question.correctIndex,
      streak: participation?.currentStreak ?? 0,
    })
  }

  const isCorrect = question.correctIndex === selectedIndex
  const timeBonus = Math.max(0, 1 - responseTimeMs / (quizSession.timePerQuestionSec * 1000))
  const basePoints = isCorrect ? Math.round(1000 * (0.5 + 0.5 * timeBonus)) : 0

  const currentStreak = participation?.currentStreak ?? 0
  const newStreak = isCorrect ? currentStreak + 1 : 0
  const streakBonus = isCorrect ? getStreakBonus(newStreak) : 0

  const canUseDoubleSkill = useSkill && isCorrect && participation && !participation.skillUsed
  const doubleMultiplier = canUseDoubleSkill ? 2 : 1

  const pointsEarned = Math.round(basePoints * (1 + streakBonus) * doubleMultiplier)

  await prisma.answer.create({
    data: { userId: userSession.user.id, questionId, sessionId: id, selectedIndex, isCorrect, responseTimeMs, pointsEarned },
  })

  const participationUpdate: Record<string, unknown> = {
    currentStreak: newStreak,
    ...(isCorrect && { totalScore: { increment: pointsEarned } }),
  }
  if (canUseDoubleSkill) participationUpdate.skillUsed = true

  if (participation) {
    await prisma.participation.update({
      where: { userId_sessionId: { userId: userSession.user.id, sessionId: id } },
      data: participationUpdate,
    })
  }

  await updateKnowledgePoint(userSession.user.id, question.topicId, isCorrect)

  return NextResponse.json({
    isCorrect,
    pointsEarned,
    correctIndex: question.correctIndex,
    streak: newStreak,
    streakBonus: Math.round(streakBonus * 100),
    doubleActivated: canUseDoubleSkill,
  })
}
