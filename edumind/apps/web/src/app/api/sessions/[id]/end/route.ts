import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const session = await prisma.quizSession.findUnique({ where: { id } })

  if (!session || session.hostId !== userSession.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const participants = await prisma.participation.findMany({
    where: { sessionId: id },
    orderBy: { totalScore: 'desc' },
  })

  await Promise.all([
    prisma.quizSession.update({ where: { id }, data: { status: 'FINISHED', endedAt: new Date() } }),
    ...participants.map((p, i) =>
      prisma.participation.update({ where: { userId_sessionId: { userId: p.userId, sessionId: id } }, data: { rank: i + 1 } })
    ),
  ])

  return NextResponse.json({ ok: true })
}
