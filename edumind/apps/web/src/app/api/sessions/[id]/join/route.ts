import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userSession = await auth()
  if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await prisma.participation.upsert({
    where: { userId_sessionId: { userId: userSession.user.id, sessionId: id } },
    update: {},
    create: { userId: userSession.user.id, sessionId: id },
  })

  return NextResponse.json({ ok: true })
}
