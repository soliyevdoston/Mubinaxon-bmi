'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') throw new Error('Ruxsat yo\'q')
}

export async function createSubject(formData: FormData) {
  await requireAdmin()
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = (formData.get('description') as string) || null
  if (!name?.trim() || !slug?.trim()) return { error: 'Nom va slug majburiy' }
  await prisma.subject.create({ data: { name, slug, description } })
  revalidatePath('/admin/subjects')
}

export async function updateSubject(formData: FormData) {
  await requireAdmin()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = (formData.get('description') as string) || null
  await prisma.subject.update({ where: { id }, data: { name, slug, description } })
  revalidatePath('/admin/subjects')
}

export async function deleteSubject(id: string) {
  await requireAdmin()
  const count = await prisma.lesson.count({ where: { subjectId: id } })
  if (count > 0) return { error: 'Fanni o\'chirishdan oldin unga bog\'liq darslarni o\'chiring' }
  await prisma.subject.delete({ where: { id } })
  revalidatePath('/admin/subjects')
}
