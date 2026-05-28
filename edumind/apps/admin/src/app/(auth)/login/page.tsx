'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(6, 'Kamida 6 ta belgi'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  function fillDemo() {
    setValue('email', 'admin@edumind.uz')
    setValue('password', 'admin123')
  }

  async function onSubmit(data: LoginForm) {
    setPending(true)
    setError('')
    const res = await signIn('credentials', { email: data.email, password: data.password, redirect: false })
    if (res?.error) {
      setError("Email yoki parol noto'g'ri")
      setPending(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 20% 20%, hsl(250 85% 10%) 0%, hsl(236 52% 5%) 45%, hsl(280 60% 7%) 100%)' }}>

      {/* Gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(250 85% 68% / 0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(280 75% 68% / 0.14) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '1.8s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(250 85% 68% / 0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* 3D floating shapes */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: '1200px' }}>
        {/* Large wireframe cube - top right */}
        <div className="absolute top-16 right-24 w-28 h-28 animate-spin-3d"
          style={{ transformStyle: 'preserve-3d', border: '1px solid hsl(250 85% 68% / 0.22)', background: 'hsl(250 85% 68% / 0.03)' }} />
        {/* Medium wireframe - bottom left */}
        <div className="absolute bottom-28 left-20 w-20 h-20 animate-spin-3d-alt"
          style={{ transformStyle: 'preserve-3d', border: '1px solid hsl(280 75% 68% / 0.28)', background: 'hsl(280 75% 68% / 0.04)' }} />
        {/* Small diamond - top left */}
        <div className="absolute top-40 left-40 w-12 h-12 animate-float-rotate"
          style={{ border: '1px solid hsl(250 85% 68% / 0.25)', transform: 'rotate(45deg)' }} />
        {/* Large ring - right center */}
        <div className="absolute top-1/3 right-12 w-48 h-48 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(280 75% 68% / 0.13)', borderTop: '2px solid hsl(280 75% 68% / 0.45)' }} />
        {/* Medium ring - left */}
        <div className="absolute bottom-1/3 left-8 w-32 h-32 rounded-full animate-spin-slow"
          style={{ border: '1px solid hsl(250 85% 68% / 0.15)', borderBottom: '2px solid hsl(250 85% 68% / 0.5)', animationDirection: 'reverse', animationDuration: '14s' }} />
        {/* Tiny cube - bottom center */}
        <div className="absolute bottom-20 left-1/3 w-8 h-8 animate-spin-3d"
          style={{ border: '1px solid hsl(280 75% 68% / 0.3)', animationDuration: '6s' }} />
        {/* Triangle-ish shape */}
        <div className="absolute top-1/4 right-1/3 w-16 h-16 animate-float"
          style={{ border: '1px solid hsl(250 85% 68% / 0.18)', transform: 'rotate(15deg)', animationDelay: '1s' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.055]"
          style={{ backgroundImage: 'radial-gradient(circle, hsl(220 15% 90%) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px] mx-5 animate-slide-up">
        <div className="glass-strong rounded-2xl p-8"
          style={{ boxShadow: '0 32px 80px hsl(250 85% 68% / 0.18), 0 0 0 1px hsl(250 85% 68% / 0.1), inset 0 1px 0 hsl(220 15% 92% / 0.06)' }}>

          {/* Logo header */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-medium">EduMind</p>
              <p className="text-sm font-semibold">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Xush kelibsiz</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Administrator hisobiga kiring</p>
            </div>
            <button type="button" onClick={fillDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ background: 'hsl(250 85% 68% / 0.15)', color: 'hsl(250,85%,75%)', border: '1px solid hsl(250 85% 68% / 0.3)' }}>
              Demo
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email manzil</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@edumind.uz"
                className="w-full h-11 rounded-xl px-4 text-sm transition-all outline-none
                  bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                  placeholder:text-[hsl(var(--muted-foreground))]
                  focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]
                  hover:border-[hsl(var(--border))]"
              />
              {errors.email && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parol</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl px-4 pr-11 text-sm transition-all outline-none
                    bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                    placeholder:text-[hsl(var(--muted-foreground))]
                    focus:border-[hsl(var(--primary)/0.5)] focus:ring-2 focus:ring-[hsl(var(--primary)/0.15)]"
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[hsl(var(--destructive))] mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all
                disabled:opacity-50 disabled:pointer-events-none
                hover:opacity-90 active:scale-[0.98]
                flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
                boxShadow: pending ? 'none' : '0 4px 24px hsl(250 85% 68% / 0.45)',
              }}>
              {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {pending ? 'Kirish...' : 'Kirish'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          EduMind Admin · Faqat ruxsat etilgan foydalanuvchilar
        </p>
      </div>
    </div>
  )
}
