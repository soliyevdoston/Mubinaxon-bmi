import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import { WaitingRoom } from '@/components/student/waiting-room'

export default async function WaitingPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session) return null
  const { code } = await params

  const quizSession = await prisma.quizSession.findUnique({
    where: { code },
    include: { lesson: { select: { title: true, subject: { select: { name: true } } } } },
  })
  if (!quizSession) notFound()

  return (
    <WaitingRoom
      sessionId={quizSession.id}
      sessionCode={code}
      lessonTitle={quizSession.lesson.title}
      subjectName={quizSession.lesson.subject.name}
      userId={session.user.id}
      userName={session.user.name ?? ''}
    />
  )
}
