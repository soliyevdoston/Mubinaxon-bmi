import { prisma } from '@edumind/database'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? 'NOT SET'
  const authSecret = process.env.AUTH_SECRET ?? 'NOT SET'
  const nextauthSecret = process.env.NEXTAUTH_SECRET ?? 'NOT SET'

  try {
    const userCount = await prisma.user.count()

    const admin = await prisma.user.findUnique({
      where: { email: 'admin@edumind.uz' },
      select: { id: true, email: true, role: true, passwordHash: true },
    })

    let bcryptResult = 'admin not found'
    if (admin) {
      const ok = await bcrypt.compare('admin123', admin.passwordHash)
      bcryptResult = ok ? 'PASSWORD MATCH' : 'PASSWORD MISMATCH'
    }

    return NextResponse.json({
      ok: true,
      userCount,
      dbUrlPrefix: dbUrl.slice(0, 60) + '...',
      authSecret: authSecret !== 'NOT SET' ? 'SET' : 'NOT SET',
      nextauthSecret: nextauthSecret !== 'NOT SET' ? 'SET (wrong name!)' : 'NOT SET',
      adminExists: !!admin,
      adminRole: admin?.role ?? null,
      bcryptResult,
    })
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: String(e),
      dbUrlPrefix: dbUrl.slice(0, 60) + '...',
      authSecret: authSecret !== 'NOT SET' ? 'SET' : 'NOT SET',
    })
  }
}
