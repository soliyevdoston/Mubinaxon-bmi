'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(6, 'Kamida 6 ta belgi'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setPending(true)
    setError('')
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (res?.error) {
      setError("Email yoki parol noto'g'ri")
      setPending(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-8 h-8 rounded-[6px] bg-[hsl(var(--primary))] mb-6" />
          <h1 className="text-xl font-semibold tracking-tight">Boshqaruv paneli</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Administrator kirishi</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@edumind.uz"
              className="flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 focus-visible:border-[hsl(var(--primary))]/40 transition-colors"
            />
            {errors.email && <p className="text-xs text-[hsl(var(--destructive))]">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Parol</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 focus-visible:border-[hsl(var(--primary))]/40 transition-colors"
            />
            {errors.password && <p className="text-xs text-[hsl(var(--destructive))]">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium transition-colors hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirish
          </button>
        </form>
      </div>
    </div>
  )
}
