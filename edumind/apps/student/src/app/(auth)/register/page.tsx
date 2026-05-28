'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { registerStudent } from '@/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    const result = await registerStudent(fd)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push('/login')
    }
  }

  const inputClass = "flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-8 h-8 rounded-[6px] bg-[hsl(var(--primary))] mb-6" />
          <h1 className="text-xl font-semibold tracking-tight">Ro'yxatdan o'tish</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Talaba hisobi yaratish</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">To'liq ism</label>
            <input name="fullName" required placeholder="Akmal Yusupov" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required placeholder="email@edumind.uz" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Parol</label>
            <input name="password" type="password" required placeholder="Kamida 8 ta belgi" className={inputClass} />
          </div>
          {error && <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{error}</p>}
          <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Hisob yaratish
          </button>
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Hisob bor?{' '}
            <Link href="/login" className="text-[hsl(var(--primary))] hover:underline underline-offset-4">Kirish</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
