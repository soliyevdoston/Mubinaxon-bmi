'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function adminLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}

export async function teacherLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}

export async function studentLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}
