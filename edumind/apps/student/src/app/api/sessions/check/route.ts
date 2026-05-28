import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@edumind/database'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const session = await prisma.quizSession.findUnique({
    where: { code },
    select: { id: true, status: true },
  })

  if (!session || session.status === 'FINISHED') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ id: session.id, status: session.status })
}
