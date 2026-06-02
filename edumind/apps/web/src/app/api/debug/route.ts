import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    let dbCheck: Record<string, unknown> = {}
    if (sessionId) {
      const quizSession = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        select: { id: true, hostId: true, status: true, timeBetweenQuestionsSec: true },
      })
      dbCheck = {
        quizSession,
        hostIdMatch: quizSession ? quizSession.hostId === session?.user?.id : null,
      }
    }

    return NextResponse.json({
      authenticated: !!session,
      userId: session?.user?.id ?? null,
      userEmail: session?.user?.email ?? null,
      userRole: (session?.user as { role?: string } | undefined)?.role ?? null,
      ...dbCheck,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
