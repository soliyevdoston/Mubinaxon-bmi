'use server'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export async function adminLogin(email: string, password: string): Promise<{ error: string } | undefined> {
  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email yoki parol noto'g'ri" }
    }
    throw error
  }
  redirect('/admin/dashboard')
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
  redirect('/teacher/dashboard')
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
  redirect('/student/home')
}
