'use server'
import bcrypt from 'bcryptjs'
import { encode } from '@auth/core/jwt'
import { cookies } from 'next/headers'
import { prisma } from '@edumind/database'

// Must match useSecureCookies: false in auth.config.ts
const COOKIE_NAME = 'authjs.session-token'
const MAX_AGE = 7 * 24 * 60 * 60

async function createSession(
  email: string,
  password: string,
  requiredRole: string
): Promise<{ error: string } | undefined> {
  let user
  try {
    user = await prisma.user.findUnique({ where: { email } })
  } catch {
    return { error: 'Server xatosi' }
  }

  if (!user || user.role !== requiredRole) return { error: "Email yoki parol noto'g'ri" }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: "Email yoki parol noto'g'ri" }

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

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function adminLogin(email: string, password: string) {
  return createSession(email, password, 'ADMIN')
}

export async function teacherLogin(email: string, password: string) {
  return createSession(email, password, 'TEACHER')
}

export async function studentLogin(email: string, password: string) {
  return createSession(email, password, 'STUDENT')
}
