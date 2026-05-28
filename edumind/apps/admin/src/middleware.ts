import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isLoginPage = nextUrl.pathname === '/login'

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && session.user.role !== 'ADMIN') {
    const roleRoutes: Record<string, string> = {
      TEACHER: 'https://teacher.edumind.uz',
      STUDENT: 'https://student.edumind.uz',
    }
    const redirectUrl = roleRoutes[session.user.role] ?? '/login'
    return NextResponse.redirect(new URL(redirectUrl))
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
