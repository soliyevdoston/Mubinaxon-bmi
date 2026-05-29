import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const path = nextUrl.pathname
  const isLoggedIn = !!session?.user
  const role = session?.user?.role

  // Landing is always public
  if (path === '/') return NextResponse.next()

  // Helper: where each role goes when already logged in
  function roleHome(r: string | undefined) {
    if (r === 'ADMIN')   return '/admin/dashboard'
    if (r === 'TEACHER') return '/teacher/dashboard'
    return '/student/home'
  }

  // --- Admin section ---
  if (path.startsWith('/admin')) {
    const isPublic = path === '/admin/login'
    if (!isLoggedIn && !isPublic) return NextResponse.redirect(new URL('/admin/login', nextUrl))
    if (isLoggedIn && role !== 'ADMIN') return NextResponse.redirect(new URL(roleHome(role), nextUrl))
    if (isLoggedIn && isPublic) return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    return NextResponse.next()
  }

  // --- Teacher section ---
  if (path.startsWith('/teacher')) {
    const isPublic = path === '/teacher/login' || path === '/teacher/register'
    if (!isLoggedIn && !isPublic) return NextResponse.redirect(new URL('/teacher/login', nextUrl))
    if (isLoggedIn && role !== 'TEACHER') return NextResponse.redirect(new URL(roleHome(role), nextUrl))
    if (isLoggedIn && isPublic) return NextResponse.redirect(new URL('/teacher/dashboard', nextUrl))
    return NextResponse.next()
  }

  // --- Student section ---
  if (path.startsWith('/student')) {
    const isPublic = path === '/student/login' || path === '/student/register'
    if (!isLoggedIn && !isPublic) return NextResponse.redirect(new URL('/student/login', nextUrl))
    if (isLoggedIn && role !== 'STUDENT') return NextResponse.redirect(new URL(roleHome(role), nextUrl))
    if (isLoggedIn && isPublic) return NextResponse.redirect(new URL('/student/home', nextUrl))
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
