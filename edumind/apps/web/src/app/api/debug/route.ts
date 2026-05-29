import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: { email: true, role: true },
    })
    return NextResponse.json({ ok: true, userCount, users, dbUrl: process.env.DATABASE_URL ? 'set' : 'NOT SET' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), dbUrl: process.env.DATABASE_URL ? 'set' : 'NOT SET' })
  }
}
