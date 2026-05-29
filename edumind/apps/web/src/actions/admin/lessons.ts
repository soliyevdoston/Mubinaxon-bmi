'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function deleteLesson(lessonId: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Ruxsat yo\'q')

  const sessions = await prisma.quizSession.findMany({ where: { lessonId }, select: { id: true } })
  const sessionIds = sessions.map(s => s.id)

  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { sessionId: { in: sessionIds } } }),
    prisma.participation.deleteMany({ where: { sessionId: { in: sessionIds } } }),
    prisma.quizSession.deleteMany({ where: { id: { in: sessionIds } } }),
    prisma.lesson.delete({ where: { id: lessonId } }),
  ])
  revalidatePath('/admin/lessons')
}
