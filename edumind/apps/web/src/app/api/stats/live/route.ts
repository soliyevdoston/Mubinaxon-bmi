import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function GET() {
  const [activeSessions, activeStudents] = await Promise.all([
    prisma.quizSession.count({ where: { status: 'ACTIVE' } }),
    prisma.participation.count({
      where: { session: { status: 'ACTIVE' }, leftAt: null },
    }),
  ])
  return NextResponse.json({ activeSessions, activeStudents })
}
