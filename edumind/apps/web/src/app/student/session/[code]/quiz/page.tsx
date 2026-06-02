import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import { QuizPlay } from '@/components/student/quiz-play'
import type { HeroClass } from '@/lib/heroes'

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session) return null
  const { code } = await params

  const [quizSession, user] = await Promise.all([
    prisma.quizSession.findUnique({ where: { code } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { heroClass: true } }),
  ])
  if (!quizSession) notFound()

  return (
    <QuizPlay
      sessionId={quizSession.id}
      sessionCode={code}
      userId={session.user.id}
      heroClass={(user?.heroClass ?? null) as HeroClass | null}
    />
  )
}
