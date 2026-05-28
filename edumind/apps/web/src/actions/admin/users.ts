'use server'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}

export async function toggleUserBlock(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isBlocked: true } })
  if (!user) return
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: !user.isBlocked } })
  revalidatePath('/admin/users')
}

export async function createUser(formData: FormData) {
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
