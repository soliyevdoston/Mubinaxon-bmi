import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import { HostSessionView } from '@/components/host-session-view'

export default async function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return null
  const { id } = await params

  const quizSession = await prisma.quizSession.findFirst({
    where: { id, hostId: session.user.id },
    include: {
      lesson: {
        include: {
          questions: { orderBy: { createdAt: 'asc' } },
          topics: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
  })
  if (!quizSession) notFound()

  const questions = quizSession.lesson.questions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    correctIndex: q.correctIndex,
    difficulty: q.difficulty,
    explanation: q.explanation,
    topicId: q.topicId,
  }))

  return (
    <HostSessionView
      sessionId={quizSession.id}
      sessionCode={quizSession.code}
      lessonTitle={quizSession.lesson.title}
      questions={questions}
      timePerQuestion={quizSession.timePerQuestionSec}
      hostId={session.user.id}
    />
  )
}
