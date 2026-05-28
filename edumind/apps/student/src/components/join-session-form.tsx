'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Hash } from 'lucide-react'

export function JoinSessionForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) { setError('6 raqamli kod kiriting'); return }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/check?code=${code}`)
    if (!res.ok) {
      setError('Sessiya topilmadi yoki tugagan')
      setLoading(false)
      return
    }
    router.push(`/session/${code}/waiting`)
  }

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(170 60% 42% / 0.1), hsl(200 75% 52% / 0.08))',
        border: '1px solid hsl(170 60% 42% / 0.25)',
        boxShadow: '0 8px 32px hsl(170 60% 42% / 0.1)',
      }}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none -translate-y-1/2 translate-x-1/2"
        style={{ background: 'radial-gradient(circle, hsl(170 60% 42% / 0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(170,60%,42%), hsl(200,75%,52%))' }}>
            <Hash className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-semibold">Sessiyaga kirish</h2>
        </div>

        <form onSubmit={handleJoin} className="space-y-3">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="_ _ _ _ _ _"
              inputMode="numeric"
              maxLength={6}
              className="flex-1 h-14 rounded-xl border text-2xl font-bold tracking-[0.5em] text-center outline-none transition-all"
              style={{
                background: 'hsl(236 48% 7%)',
                borderColor: code.length > 0 ? 'hsl(170 60% 42% / 0.5)' : 'hsl(236 35% 14%)',
                color: code.length > 0 ? 'hsl(170,60%,60%)' : 'hsl(var(--muted-foreground))',
                boxShadow: code.length === 6 ? '0 0 20px hsl(170 60% 42% / 0.2)' : undefined,
              }}
            />
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className="w-14 h-14 flex items-center justify-center rounded-xl text-white transition-all
                disabled:opacity-40 disabled:pointer-events-none hover:opacity-90 active:scale-[0.96]"
              style={{
                background: 'linear-gradient(135deg, hsl(170,60%,42%), hsl(200,75%,52%))',
                boxShadow: code.length === 6 ? '0 4px 16px hsl(170 60% 42% / 0.4)' : undefined,
              }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-[hsl(var(--destructive))] flex items-center gap-1.5 px-1">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--destructive))] flex-shrink-0" />
              {error}
            </p>
          )}
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            O&apos;qituvchingizdan 6 raqamli kod oling
          </p>
        </form>
      </div>
    </div>
  )
}
