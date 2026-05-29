import { prisma } from './db'

export async function updateKnowledgePoint(userId: string, topicId: string, isCorrect: boolean) {
  const existing = await prisma.knowledgePoint.findUnique({
    where: { userId_topicId: { userId, topicId } },
  })

  if (existing) {
    const newAttempts = existing.attemptsCount + 1
    const newCorrect = existing.correctCount + (isCorrect ? 1 : 0)
    await prisma.knowledgePoint.update({
      where: { userId_topicId: { userId, topicId } },
      data: {
        attemptsCount: newAttempts,
        correctCount: newCorrect,
        masteryLevel: newCorrect / newAttempts,
        lastPracticedAt: new Date(),
      },
    })
  } else {
    try {
      await prisma.knowledgePoint.create({
        data: {
          userId,
          topicId,
          attemptsCount: 1,
          correctCount: isCorrect ? 1 : 0,
          masteryLevel: isCorrect ? 1 : 0,
        },
      })
    } catch {
      // Race condition — update instead
      const kp = await prisma.knowledgePoint.findUnique({
        where: { userId_topicId: { userId, topicId } },
      })
      if (kp) {
        const newAttempts = kp.attemptsCount + 1
        const newCorrect = kp.correctCount + (isCorrect ? 1 : 0)
        await prisma.knowledgePoint.update({
          where: { userId_topicId: { userId, topicId } },
          data: {
            attemptsCount: newAttempts,
            correctCount: newCorrect,
            masteryLevel: newCorrect / newAttempts,
            lastPracticedAt: new Date(),
          },
        })
      }
    }
  }
}
