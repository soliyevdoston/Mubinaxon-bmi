import { auth } from '@/auth'
import { QuizPlay } from '@/components/quiz-play'

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session) return null
  const { code } = await params
  return <QuizPlay sessionCode={code} userId={session.user.id} />
}
