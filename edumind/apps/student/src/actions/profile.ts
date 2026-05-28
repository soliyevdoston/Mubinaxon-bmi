'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData): Promise<{ error?: string } | void> {
  const session = await auth()
  if (!session) return { error: 'Ruxsat yo\'q' }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string

  if (!fullName?.trim() || !email?.trim()) return { error: 'Ism va email majburiy' }

  const existing = await prisma.user.findFirst({ where: { email, NOT: { id: session.user.id } } })
  if (existing) return { error: 'Bu email allaqachon ishlatilmoqda' }

  await prisma.user.update({ where: { id: session.user.id }, data: { fullName, email } })
  revalidatePath('/profile')
}

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
  const session = await auth()
  if (!session) return { error: 'Ruxsat yo\'q' }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (!currentPassword || !newPassword) return { error: 'Barcha maydonlarni to\'ldiring' }
  if (newPassword.length < 8) return { error: 'Yangi parol kamida 8 ta belgi bo\'lishi kerak' }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return { error: 'Foydalanuvchi topilmadi' }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return { error: 'Joriy parol noto\'g\'ri' }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } })
}
