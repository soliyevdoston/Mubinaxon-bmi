'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

function generateSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createSession({ lessonId, timePerQuestion }: { lessonId: string; timePerQuestion: number }): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  let code = generateSessionCode()
  while (await prisma.quizSession.findUnique({ where: { code } })) {
    code = generateSessionCode()
  }

  const quizSession = await prisma.quizSession.create({
    data: {
      code,
      hostId: session.user.id,
      lessonId,
      timePerQuestionSec: timePerQuestion,
      status: 'WAITING',
    },
  })
  revalidatePath('/sessions')
  return quizSession.id
}
