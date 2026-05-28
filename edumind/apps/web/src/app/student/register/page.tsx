'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Zap, Eye, EyeOff } from 'lucide-react'
import { registerStudent } from '@/actions/student/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    const result = await registerStudent(fd)
    if (result?.error) {
      setError(result.error)
      setPending(false)
    } else {
      router.push('/student/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 80%, hsl(170 60% 8%) 0%, hsl(236 52% 5%) 45%, hsl(250 55% 7%) 100%)' }}>

      <div className="absolute bottom-[-5%] left-1/4 w-[550px] h-[550px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(170 60% 50% / 0.14) 0%, transparent 70%)', filter: 'blur(55px)' }} />
      <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(250 80% 68% / 0.12) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '2s' }} />

      <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1200px' }}>
        <div className="absolute top-14 right-20 w-20 h-20 animate-spin-3d"
          style={{ border: '1px solid hsl(170 60% 50% / 0.22)' }} />
        <div className="absolute bottom-24 left-16 w-16 h-16 animate-spin-3d-alt"
          style={{ border: '1px solid hsl(250 80% 68% / 0.25)' }} />
        <div className="absolute top-1/3 right-8 w-36 h-36 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(170 60% 50% / 0.1)', borderTop: '2px solid hsl(170 60% 50% / 0.35)' }} />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, hsl(220 15% 90%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-5 animate-slide-up">
        <div className="glass-strong rounded-2xl p-8"
          style={{ boxShadow: '0 32px 80px hsl(170 60% 50% / 0.1), 0 0 0 1px hsl(170 60% 50% / 0.08)' }}>

          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(170,60%,45%), hsl(200,75%,55%))' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-medium">EduMind</p>
              <p className="text-sm font-semibold">Talaba portali</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">Hisob yaratish</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Talaba sifatida ro&apos;yxatdan o&apos;ting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {['fullName','email'].map((name) => (
              <div key={name} className="space-y-1.5">
                <label className="text-sm font-medium">
                  {name === 'fullName' ? "To'liq ism" : 'Email manzil'}
                </label>
                <input
                  name={name}
                  type={name === 'email' ? 'email' : 'text'}
                  required
                  placeholder={name === 'fullName' ? 'Akmal Yusupov' : 'email@edumind.uz'}
                  className="w-full h-11 rounded-xl px-4 text-sm transition-all outline-none
                    bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                    placeholder:text-[hsl(var(--muted-foreground))]
                    focus:ring-2 focus:ring-[hsl(var(--success)/0.2)] focus:border-[hsl(var(--success)/0.4)]"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parol</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Kamida 8 ta belgi"
                  className="w-full h-11 rounded-xl px-4 pr-11 text-sm transition-all outline-none
                    bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                    placeholder:text-[hsl(var(--muted-foreground))]
                    focus:ring-2 focus:ring-[hsl(var(--success)/0.2)] focus:border-[hsl(var(--success)/0.4)]"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={pending}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all
                disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 active:scale-[0.98]
                flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, hsl(170,60%,42%), hsl(200,75%,52%))',
                boxShadow: pending ? 'none' : '0 4px 24px hsl(170 60% 45% / 0.4)',
              }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pending ? 'Yaratilmoqda...' : 'Hisob yaratish'}
            </button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Hisob bor?{' '}
              <Link href="/student/login" className="font-medium hover:underline underline-offset-4"
                style={{ color: 'hsl(170,60%,55%)' }}>
                Kirish
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
