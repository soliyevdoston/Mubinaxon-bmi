'use server'
import { prisma } from '@edumind/database'
import bcrypt from 'bcryptjs'

export async function registerStudent(formData: FormData): Promise<{ error?: string } | void> {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !password) return { error: "Barcha maydonlarni to'ldiring" }
  if (password.length < 8) return { error: "Parol kamida 8 ta belgi bo'lishi kerak" }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Bu email allaqachon ro'yxatdan o'tgan" }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, passwordHash, fullName, role: 'STUDENT' } })
}
