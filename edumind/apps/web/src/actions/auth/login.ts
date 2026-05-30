'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function adminLogin(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: '/admin/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}

export async function teacherLogin(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: '/teacher/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}

export async function studentLogin(email: string, password: string) {
  try {
    await signIn('credentials', { email, password, redirectTo: '/student/home' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
}
