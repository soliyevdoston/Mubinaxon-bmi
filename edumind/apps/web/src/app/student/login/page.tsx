'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Zap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function fillDemo() {
    setEmail('akmal.yusupov@edumind.uz')
    setPassword('student123')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError("Email yoki parol noto'g'ri")
      setPending(false)
    } else {
      router.push('/student/home')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 80%, hsl(170 60% 8%) 0%, hsl(236 52% 5%) 45%, hsl(250 55% 7%) 100%)' }}>

      {/* Orbs */}
      <div className="absolute bottom-[-5%] left-1/4 w-[600px] h-[600px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(170 60% 50% / 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-[-5%] right-[-5%] w-[550px] h-[550px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(250 80% 68% / 0.14) 0%, transparent 70%)', filter: 'blur(55px)', animationDelay: '2s' }} />

      {/* 3D shapes */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1200px' }}>
        <div className="absolute top-14 right-20 w-24 h-24 animate-spin-3d"
          style={{ border: '1px solid hsl(170 60% 50% / 0.25)', background: 'hsl(170 60% 50% / 0.04)' }} />
        <div className="absolute bottom-20 left-16 w-[72px] h-[72px] animate-spin-3d-alt"
          style={{ border: '1px solid hsl(250 80% 68% / 0.28)' }} />
        <div className="absolute top-32 left-28 w-10 h-10 animate-float-rotate"
          style={{ border: '1px solid hsl(170 60% 50% / 0.3)', transform: 'rotate(45deg)' }} />
        <div className="absolute top-1/3 right-8 w-40 h-40 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(170 60% 50% / 0.12)', borderTop: '2px solid hsl(170 60% 50% / 0.4)' }} />
        <div className="absolute bottom-1/3 left-6 w-24 h-24 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(250 80% 68% / 0.14)', borderRight: '2px solid hsl(250 80% 68% / 0.5)', animationDirection: 'reverse', animationDuration: '15s' }} />
        <div className="absolute top-2/3 right-1/3 w-8 h-8 animate-spin-3d"
          style={{ border: '1px solid hsl(170 60% 50% / 0.25)', animationDuration: '5s' }} />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, hsl(220 15% 90%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-5 animate-slide-up">
        <div className="glass-strong rounded-2xl p-8"
          style={{ boxShadow: '0 32px 80px hsl(170 60% 50% / 0.12), 0 0 0 1px hsl(170 60% 50% / 0.1), inset 0 1px 0 hsl(220 15% 92% / 0.06)' }}>

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

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Xush kelibsiz</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Hisobingizga kiring</p>
            </div>
            <button type="button" onClick={fillDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: 'hsl(170 60% 42% / 0.15)', color: 'hsl(170,60%,60%)', border: '1px solid hsl(170 60% 42% / 0.3)' }}>
              Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email manzil</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="email@edumind.uz"
                className="w-full h-11 rounded-xl px-4 text-sm transition-all outline-none
                  bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                  placeholder:text-[hsl(var(--muted-foreground))]
                  focus:ring-2 focus:ring-[hsl(var(--success)/0.2)] focus:border-[hsl(var(--success)/0.4)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
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
              {pending ? 'Kirish...' : 'Kirish'}
            </button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Hisob yo&apos;qmi?{' '}
              <Link href="/student/register" className="font-medium hover:underline underline-offset-4"
                style={{ color: 'hsl(170,60%,55%)' }}>
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </form>
        </div>
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          EduMind · Ta&apos;lim platformasi
        </p>
      </div>
    </div>
  )
}
