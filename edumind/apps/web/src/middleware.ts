import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { decode } from '@auth/core/jwt'

const COOKIE_NAME = 'authjs.session-token'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const needsTeacher = pathname.startsWith('/teacher') && !pathname.endsWith('/login') && !pathname.endsWith('/register')
  const needsStudent = pathname.startsWith('/student') && !pathname.endsWith('/login') && !pathname.endsWith('/register')
  const needsAdmin = pathname.startsWith('/admin') && !pathname.endsWith('/login')

  if (!needsTeacher && !needsStudent && !needsAdmin) return NextResponse.next()

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? ''
  let role: string | undefined

  try {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    console.log('[MW] cookie present:', !!cookieValue, 'path:', pathname)
    if (cookieValue && secret) {
      const token = await decode({ token: cookieValue, secret, salt: COOKIE_NAME }) as Record<string, unknown> | null
      role = token?.role as string | undefined
      console.log('[MW] decoded role:', role)
    } else {
      console.log('[MW] no cookie or no secret, secret len:', secret.length)
    }
  } catch (e) {
    console.error('[MW] decode error:', String(e))
  }

  if (needsTeacher && role !== 'TEACHER') return NextResponse.redirect(new URL('/teacher/login', req.url))
  if (needsStudent && role !== 'STUDENT') return NextResponse.redirect(new URL('/student/login', req.url))
  if (needsAdmin && role !== 'ADMIN') return NextResponse.redirect(new URL('/admin/login', req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
