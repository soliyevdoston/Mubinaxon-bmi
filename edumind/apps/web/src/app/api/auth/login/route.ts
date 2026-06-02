import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { encode } from '@auth/core/jwt'
import { prisma } from '@edumind/database'

// Must match salt used in middleware decode
const COOKIE_NAME = 'authjs.session-token'
const MAX_AGE = 7 * 24 * 60 * 60

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Barcha maydonlarni kiriting' }, { status: 400 })
    }

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch (e) {
      console.error('[LOGIN] db error:', e)
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
    console.log('[LOGIN] secret len:', secret.length, 'cookie:', COOKIE_NAME)

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

    const isHttps = req.url.startsWith('https')
    console.log('[LOGIN] isHttps:', isHttps, 'tokenLen:', token.length)

    const response = NextResponse.json({ ok: true, _debug: { secretLen: secret.length, tokenLen: token.length, isHttps, cookieName: COOKIE_NAME } })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: MAX_AGE,
    })
    return response
  } catch (err) {
    console.error('[LOGIN]', err)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
