'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError("Email yoki parol noto'g'ri")
      setPending(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const inputClass = "flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 focus-visible:border-[hsl(var(--primary))]/40 transition-colors"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-8 h-8 rounded-[6px] bg-[hsl(var(--primary))] mb-6" />
          <h1 className="text-xl font-semibold tracking-tight">O'qituvchi paneli</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Hisobingizga kiring</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@edumind.uz" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Parol</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={inputClass} />
          </div>
          {error && <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{error}</p>}
          <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirish
          </button>
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Hisob yo'qmi?{' '}
            <Link href="/register" className="text-[hsl(var(--primary))] hover:underline underline-offset-4">Ro'yxatdan o'tish</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
