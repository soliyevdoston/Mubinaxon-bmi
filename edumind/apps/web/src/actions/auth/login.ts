'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'

async function getProto() {
  const h = await headers()
  return h.get('x-forwarded-proto') ?? 'unknown'
}

export async function adminLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  const proto = await getProto()
  console.log('[LOGIN] adminLogin called, proto:', proto, 'email:', email)
  try {
    await signIn('credentials', { email, password, redirectTo: '/admin/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('[LOGIN] AuthError:', error.type, error.message)
      return { error: "Email yoki parol noto'g'ri" }
    }
    console.log('[LOGIN] redirect thrown (expected):', (error as any)?.digest?.slice(0, 40))
    throw error
  }
}

export async function teacherLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  const proto = await getProto()
  console.log('[LOGIN] teacherLogin called, proto:', proto, 'email:', email)
  try {
    await signIn('credentials', { email, password, redirectTo: '/teacher/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('[LOGIN] AuthError:', error.type, error.message)
      return { error: "Email yoki parol noto'g'ri" }
    }
    console.log('[LOGIN] redirect thrown (expected):', (error as any)?.digest?.slice(0, 40))
    throw error
  }
}

export async function studentLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  const proto = await getProto()
  console.log('[LOGIN] studentLogin called, proto:', proto, 'email:', email)
  try {
    await signIn('credentials', { email, password, redirectTo: '/student/home' })
  } catch (error) {
    if (error instanceof AuthError) {
      console.log('[LOGIN] AuthError:', error.type, error.message)
      return { error: "Email yoki parol noto'g'ri" }
    }
    console.log('[LOGIN] redirect thrown (expected):', (error as any)?.digest?.slice(0, 40))
    throw error
  }
}
