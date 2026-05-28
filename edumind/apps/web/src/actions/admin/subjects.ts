'use server'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function createSubject(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = (formData.get('description') as string) || null
  await prisma.subject.create({ data: { name, slug, description } })
  revalidatePath('/admin/subjects')
}

export async function updateSubject(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = (formData.get('description') as string) || null
  await prisma.subject.update({ where: { id }, data: { name, slug, description } })
  revalidatePath('/admin/subjects')
}

export async function deleteSubject(id: string) {
  await prisma.subject.delete({ where: { id } })
  revalidatePath('/admin/subjects')
}
