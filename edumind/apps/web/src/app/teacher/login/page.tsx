'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function fillDemo() {
    setEmail('sardor.xasanov@edumind.uz')
    setPassword('teacher123')
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
      window.location.href = '/teacher/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 80% 20%, hsl(220 80% 10%) 0%, hsl(236 52% 5%) 45%, hsl(260 60% 7%) 100%)' }}>

      {/* Orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[650px] h-[650px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(220 85% 65% / 0.16) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(250 80% 68% / 0.13) 0%, transparent 70%)', filter: 'blur(55px)', animationDelay: '2s' }} />

      {/* 3D shapes */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1200px' }}>
        <div className="absolute top-12 left-20 w-24 h-24 animate-spin-3d"
          style={{ border: '1px solid hsl(220 85% 65% / 0.25)', background: 'hsl(220 85% 65% / 0.03)' }} />
        <div className="absolute bottom-24 right-24 w-20 h-20 animate-spin-3d-alt"
          style={{ border: '1px solid hsl(250 80% 68% / 0.28)', background: 'hsl(250 80% 68% / 0.04)' }} />
        <div className="absolute top-36 right-36 w-14 h-14 animate-float-rotate"
          style={{ border: '1px solid hsl(220 85% 65% / 0.22)', transform: 'rotate(45deg)' }} />
        <div className="absolute top-1/4 left-10 w-44 h-44 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(220 85% 65% / 0.12)', borderTop: '2px solid hsl(220 85% 65% / 0.4)' }} />
        <div className="absolute bottom-1/4 right-10 w-28 h-28 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(250 80% 68% / 0.15)', borderLeft: '2px solid hsl(250 80% 68% / 0.5)', animationDirection: 'reverse', animationDuration: '16s' }} />
        <div className="absolute top-1/2 left-1/4 w-10 h-10 animate-spin-3d"
          style={{ border: '1px solid hsl(220 85% 65% / 0.2)', animationDuration: '7s' }} />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, hsl(220 15% 90%) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-5 animate-slide-up">
        <div className="glass-strong rounded-2xl p-8"
          style={{ boxShadow: '0 32px 80px hsl(220 85% 65% / 0.15), 0 0 0 1px hsl(220 85% 65% / 0.1), inset 0 1px 0 hsl(220 15% 92% / 0.06)' }}>

          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-medium">EduMind</p>
              <p className="text-sm font-semibold">O'qituvchi paneli</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Xush kelibsiz</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Hisobingizga kiring</p>
            </div>
            <button type="button" onClick={fillDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: 'hsl(220 85% 60% / 0.15)', color: 'hsl(220,85%,75%)', border: '1px solid hsl(220 85% 60% / 0.3)' }}>
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
                  focus:border-[hsl(220,85%,60%,0.5)] focus:ring-2 focus:ring-[hsl(220,85%,60%,0.15)]"
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
                    focus:border-[hsl(220,85%,60%,0.5)] focus:ring-2 focus:ring-[hsl(220,85%,60%,0.15)]"
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
                background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))',
                boxShadow: pending ? 'none' : '0 4px 24px hsl(220 85% 65% / 0.4)',
              }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pending ? 'Kirish...' : 'Kirish'}
            </button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Hisob yo&apos;qmi?{' '}
              <Link href="/teacher/register" className="font-medium hover:underline underline-offset-4"
                style={{ color: 'hsl(220,85%,70%)' }}>
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
