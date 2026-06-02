import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = (req.auth?.user as { role?: string } | undefined)?.role
  const isLoggedIn = !!req.auth
  if (pathname.startsWith('/teacher') || pathname.startsWith('/student') || pathname.startsWith('/admin')) {
    console.log('[MIDDLEWARE]', pathname, '| loggedIn:', isLoggedIn, '| role:', role ?? 'none')
  }

  if (
    pathname.startsWith('/teacher') &&
    !pathname.endsWith('/login') &&
    !pathname.endsWith('/register')
  ) {
    if (!isLoggedIn || role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher/login', req.url))
    }
  }

  if (
    pathname.startsWith('/student') &&
    !pathname.endsWith('/login') &&
    !pathname.endsWith('/register')
  ) {
    if (!isLoggedIn || role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/student/login', req.url))
    }
  }

  if (pathname.startsWith('/admin') && !pathname.endsWith('/login')) {
    if (!isLoggedIn || role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
