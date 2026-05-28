'use server'
import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

interface CreateLessonInput {
  title: string
  subjectId: string
  description: string
  content: string
  topics: { name: string; description: string }[]
  questions: { text: string; options: string[]; correctIndex: number; difficulty: number; topicIndex: number; explanation: string }[]
  isPublished: boolean
}

export async function createLesson(input: CreateLessonInput): Promise<string> {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const lesson = await prisma.lesson.create({
    data: {
      title: input.title,
      subjectId: input.subjectId,
      description: input.description || null,
      rawContent: input.content || null,
      authorId: session.user.id,
      isPublished: input.isPublished,
    },
  })

  const topicRecords = await Promise.all(
    input.topics.map((t, idx) =>
      prisma.topic.create({
        data: { name: t.name, description: t.description, lessonId: lesson.id, orderIndex: idx },
      })
    )
  )

  await prisma.question.createMany({
    data: input.questions.map((q) => ({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
      explanation: q.explanation,
      lessonId: lesson.id,
      topicId: topicRecords[q.topicIndex]?.id ?? topicRecords[0]!.id,
      generatedByAI: true,
    })),
  })

  revalidatePath('/teacher/lessons')
  return lesson.id
}

export async function updateLesson({ id, title, subjectId, description }: { id: string; title: string; subjectId: string; description: string }) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.lesson.update({
    where: { id, authorId: session.user.id },
    data: { title, subjectId, description: description || null },
  })
  revalidatePath('/teacher/lessons')
  revalidatePath(`/teacher/lessons/${id}`)
}

export async function updateLessonPublishStatus(lessonId: string, isPublished: boolean) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.lesson.update({ where: { id: lessonId, authorId: session.user.id }, data: { isPublished } })
  revalidatePath('/teacher/lessons')
  revalidatePath(`/teacher/lessons/${lessonId}`)
}

export async function deleteLesson(lessonId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  await prisma.lesson.delete({ where: { id: lessonId, authorId: session.user.id } })
  revalidatePath('/teacher/lessons')
}
