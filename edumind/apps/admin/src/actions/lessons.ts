'use server'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function deleteLesson(lessonId: string) {
  await prisma.lesson.delete({ where: { id: lessonId } })
  revalidatePath('/lessons')
}
