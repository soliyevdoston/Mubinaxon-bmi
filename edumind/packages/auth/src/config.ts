import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@edumind/database'
import type { Role } from '@edumind/types'

export function createAuthConfig(allowedRole?: Role): NextAuthConfig {
  return {
    providers: [
      Credentials({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Parol', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) return null
          if (allowedRole && user.role !== allowedRole) return null

          const passwordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )
          if (!passwordValid) return null

          await prisma.user.update({
            where: { id: user.id },
            data: { lastSeenAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.avatarUrl,
            role: user.role as Role,
          }
        },
      }),
    ],
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
    pages: {
      signIn: '/login',
      error: '/login',
    },
    session: { strategy: 'jwt' },
  }
}
