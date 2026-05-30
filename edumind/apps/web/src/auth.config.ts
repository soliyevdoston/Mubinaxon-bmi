import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@edumind/types'

// Edge-safe config — no bcryptjs, no Prisma, no Node.js APIs
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role: Role }).role
        token.id = user.id ?? ''
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
}
