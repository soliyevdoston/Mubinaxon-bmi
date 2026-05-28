import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

async function updateKnowledgePoint(userId: string, topicId: string, isCorrect: boolean) {
  const kp = await prisma.knowledgePoint.findUnique({ where: { userId_topicId: { userId, topicId } } })
  if (kp) {
    const attempts = kp.attemptsCount + 1
    const correct = kp.correctCount + (isCorrect ? 1 : 0)
    await prisma.knowledgePoint.update({
      where: { userId_topicId: { userId, topicId } },
      data: { attemptsCount: attempts, correctCount: correct, masteryLevel: correct / attempts, lastPracticedAt: new Date() },
    })
  } else {
    await prisma.knowledgePoint.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {},
      create: { userId, topicId, attemptsCount: 1, correctCount: isCorrect ? 1 : 0, masteryLevel: isCorrect ? 1 : 0 },
    })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { questionId, selectedIndex, responseTimeMs } = await req.json() as {
    questionId: string
    selectedIndex: number
    responseTimeMs: number
  }

  const [question, quizSession] = await Promise.all([
    prisma.question.findUnique({ where: { id: questionId } }),
    prisma.quizSession.findUnique({ where: { id } }),
  ])

  if (!question || !quizSession) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.answer.findFirst({
    where: { userId: userSession.user.id, sessionId: id, questionId },
  })
  if (existing) {
    return NextResponse.json({ isCorrect: existing.isCorrect, pointsEarned: existing.pointsEarned, correctIndex: question.correctIndex })
  }

  const isCorrect = question.correctIndex === selectedIndex
  const timeBonus = Math.max(0, 1 - responseTimeMs / (quizSession.timePerQuestionSec * 1000))
  const pointsEarned = isCorrect ? Math.round(1000 * (0.5 + 0.5 * timeBonus)) : 0

  await prisma.answer.create({
    data: { userId: userSession.user.id, questionId, sessionId: id, selectedIndex, isCorrect, responseTimeMs, pointsEarned },
  })

  if (isCorrect) {
    await prisma.participation.update({
      where: { userId_sessionId: { userId: userSession.user.id, sessionId: id } },
      data: { totalScore: { increment: pointsEarned } },
    })
  }

  await updateKnowledgePoint(userSession.user.id, question.topicId, isCorrect)

  return NextResponse.json({ isCorrect, pointsEarned, correctIndex: question.correctIndex })
}
