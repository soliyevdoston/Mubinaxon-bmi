import NextAuth from 'next-auth'
import { createAuthConfig } from '@edumind/auth'

// No role restriction — middleware enforces role per path prefix
export const { handlers, signIn, signOut, auth } = NextAuth(createAuthConfig())
