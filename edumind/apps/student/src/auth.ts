import NextAuth from 'next-auth'
import { createAuthConfig } from '@edumind/auth'

export const { handlers, signIn, signOut, auth } = NextAuth(createAuthConfig('STUDENT'))
