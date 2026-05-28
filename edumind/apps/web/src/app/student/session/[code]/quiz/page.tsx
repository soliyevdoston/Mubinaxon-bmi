import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import { QuizPlay } from '@/components/student/quiz-play'

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session) return null
  const { code } = await params

  const quizSession = await prisma.quizSession.findUnique({ where: { code } })
  if (!quizSession) notFound()

  return <QuizPlay sessionId={quizSession.id} sessionCode={code} userId={session.user.id} />
}
