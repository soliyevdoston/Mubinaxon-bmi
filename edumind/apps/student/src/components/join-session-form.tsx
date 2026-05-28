'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

export function JoinSessionForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) { setError("6 raqamli kod kiriting"); return }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/check?code=${code}`)
    if (!res.ok) {
      setError("Sessiya topilmadi yoki tugagan")
      setLoading(false)
      return
    }
    router.push(`/session/${code}/waiting`)
  }

  return (
    <div className="rounded-[6px] border border-[hsl(var(--border))] p-6">
      <h2 className="text-sm font-semibold mb-4">Sessiyaga kirish</h2>
      <form onSubmit={handleJoin} className="space-y-3">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6 raqamli kod"
            inputMode="numeric"
            maxLength={6}
            className="flex-1 h-12 rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-4 text-lg font-mono tracking-widest placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors text-center"
          />
          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="h-12 w-12 flex items-center justify-center rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
      </form>
    </div>
  )
}
