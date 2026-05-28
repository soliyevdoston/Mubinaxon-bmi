export { createAuthConfig } from './config'
export type { Session } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image: string | null
      role: import('@edumind/types').Role
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: import('@edumind/types').Role
  }
}
