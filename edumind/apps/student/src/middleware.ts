import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isLoginPage = nextUrl.pathname === '/login'
  const isRegisterPage = nextUrl.pathname === '/register'
  const isPublicPage = isLoginPage || isRegisterPage

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn && session.user.role !== 'STUDENT') {
    const roleRoutes: Record<string, string> = {
      ADMIN: 'https://admin.edumind.uz',
      TEACHER: 'https://teacher.edumind.uz',
    }
    const redirectUrl = roleRoutes[session.user.role] ?? '/login'
    return NextResponse.redirect(new URL(redirectUrl))
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL('/home', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
