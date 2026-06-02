import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { encode } from '@auth/core/jwt'
import { prisma } from '@edumind/database'

const COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

const MAX_AGE = 7 * 24 * 60 * 60

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Barcha maydonlarni kiriting" }, { status: 400 })
    }

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch {
      return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
    }

    if (!user || user.role !== role) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 })
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })

    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? ''
    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.fullName,
        picture: user.avatarUrl ?? undefined,
        role: user.role,
      },
      secret,
      salt: COOKIE_NAME,
      maxAge: MAX_AGE,
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE,
    })
    return response
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
