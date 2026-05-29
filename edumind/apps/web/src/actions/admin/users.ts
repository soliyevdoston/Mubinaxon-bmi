'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Ruxsat yo\'q')
}

export async function deleteUser(userId: string) {
  await requireAdmin()

  const [lessons, hostedSessions] = await Promise.all([
    prisma.lesson.findMany({ where: { authorId: userId }, select: { id: true } }),
    prisma.quizSession.findMany({ where: { hostId: userId }, select: { id: true } }),
  ])
  const lessonIds = lessons.map(l => l.id)
  const hostedSessionIds = hostedSessions.map(s => s.id)

  const [topicsInLessons, sessionsOnLessons] = await Promise.all([
    prisma.topic.findMany({ where: { lessonId: { in: lessonIds } }, select: { id: true } }),
    prisma.quizSession.findMany({ where: { lessonId: { in: lessonIds } }, select: { id: true } }),
  ])
  const topicIds = topicsInLessons.map(t => t.id)
  const allSessionIds = [...new Set([...hostedSessionIds, ...sessionsOnLessons.map(s => s.id)])]

  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { OR: [{ userId }, { sessionId: { in: allSessionIds } }] } }),
    prisma.knowledgePoint.deleteMany({ where: { OR: [{ userId }, { topicId: { in: topicIds } }] } }),
    prisma.participation.deleteMany({ where: { OR: [{ userId }, { sessionId: { in: allSessionIds } }] } }),
    prisma.quizSession.deleteMany({ where: { id: { in: allSessionIds } } }),
    prisma.lesson.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])
  revalidatePath('/admin/users')
}

export async function toggleUserBlock(userId: string) {
  await requireAdmin()
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isBlocked: true } })
  if (!user) return
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: !user.isBlocked } })
  revalidatePath('/admin/users')
}

export async function createUser(formData: FormData) {
  await requireAdmin()
  const bcrypt = await import('bcryptjs')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'ADMIN' | 'TEACHER' | 'STUDENT'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Bu email allaqachon ro'yxatdan o'tgan" }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, passwordHash, fullName, role } })
  revalidatePath('/admin/users')
}
