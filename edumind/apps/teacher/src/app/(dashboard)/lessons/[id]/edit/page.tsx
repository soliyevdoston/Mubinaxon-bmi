import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import { EditLessonForm } from './edit-lesson-form'

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return null
  const { id } = await params

  const [lesson, subjects] = await Promise.all([
    prisma.lesson.findFirst({
      where: { id, authorId: session.user.id },
      include: { subject: true },
    }),
    prisma.subject.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!lesson) notFound()

  return (
    <EditLessonForm
      lesson={{ id: lesson.id, title: lesson.title, description: lesson.description ?? '', subjectId: lesson.subjectId, isPublished: lesson.isPublished }}
      subjects={subjects.map(s => ({ id: s.id, name: s.name }))}
    />
  )
}
