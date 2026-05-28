import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: { lesson: { include: { questions: { orderBy: { createdAt: 'asc' } } } } },
  })

  if (!session || session.hostId !== userSession.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const firstQuestion = session.lesson.questions[0]
  if (!firstQuestion) return NextResponse.json({ error: 'No questions' }, { status: 400 })

  await prisma.quizSession.update({
    where: { id },
    data: { status: 'ACTIVE', startedAt: new Date(), currentQuestionId: firstQuestion.id },
  })

  return NextResponse.json({ ok: true })
}
