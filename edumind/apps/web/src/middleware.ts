import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { decode } from '@auth/core/jwt'

const COOKIE_NAME = 'authjs.session-token'
// Fallback matches .env.production — same value either way
const SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'edumind-secret-32chars-production-ok'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsTeacher = pathname.startsWith('/teacher') && !pathname.endsWith('/login') && !pathname.endsWith('/register')
  const needsStudent = pathname.startsWith('/student') && !pathname.endsWith('/login') && !pathname.endsWith('/register')
  const needsAdmin   = pathname.startsWith('/admin')   && !pathname.endsWith('/login')

  if (!needsTeacher && !needsStudent && !needsAdmin) return NextResponse.next()

  let role: string | undefined
  let hasCookie = false

  try {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    hasCookie = !!cookieValue
    if (cookieValue) {
      const token = await decode({ token: cookieValue, secret: SECRET, salt: COOKIE_NAME }) as Record<string, unknown> | null
      role = token?.role as string | undefined
    }
  } catch (e) {
    console.error('[MW] decode error:', String(e))
  }

  console.log('[MW]', pathname, 'cookie:', hasCookie, 'role:', role ?? 'none', 'secretLen:', SECRET.length)

  function denied(loginPath: string) {
    const res = NextResponse.redirect(new URL(loginPath, req.url))
    res.headers.set('x-dbg-cookie', hasCookie ? '1' : '0')
    res.headers.set('x-dbg-role', role ?? 'none')
    res.headers.set('x-dbg-secret', String(SECRET.length))
    return res
  }

  if (needsTeacher && role !== 'TEACHER') return denied('/teacher/login')
  if (needsStudent && role !== 'STUDENT') return denied('/student/login')
  if (needsAdmin   && role !== 'ADMIN')   return denied('/admin/login')

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
