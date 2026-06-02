import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'
import { withRetry } from '@/lib/db-retry'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userSession = await auth()
    if (!userSession?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const session = await withRetry(() =>
      prisma.quizSession.findUnique({ where: { id } })
    )

    if (!session || session.hostId !== userSession.user.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const data: { timeBetweenQuestionsSec?: number; timePerQuestionSec?: number } = {}

    if (typeof body.timeBetweenQuestionsSec === 'number') {
      data.timeBetweenQuestionsSec = Math.max(0, Math.min(30, body.timeBetweenQuestionsSec))
    }
    if (typeof body.timePerQuestionSec === 'number') {
      data.timePerQuestionSec = Math.max(5, Math.min(120, body.timePerQuestionSec))
    }

    const updated = await withRetry(() =>
      prisma.quizSession.update({ where: { id }, data })
    )

    return NextResponse.json({
      timeBetweenQuestionsSec: updated.timeBetweenQuestionsSec,
      timePerQuestionSec: updated.timePerQuestionSec,
    })
  } catch (err) {
    console.error('settings patch error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
