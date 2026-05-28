'use server'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/users')
}

export async function toggleUserBlock(userId: string) {
  // In a real app you'd have an isBlocked field; here we just demonstrate
  revalidatePath('/users')
}

export async function createUser(formData: FormData) {
  const bcrypt = await import('bcryptjs')
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as 'ADMIN' | 'TEACHER' | 'STUDENT'

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({ data: { email, passwordHash, fullName, role } })
  revalidatePath('/users')
}
