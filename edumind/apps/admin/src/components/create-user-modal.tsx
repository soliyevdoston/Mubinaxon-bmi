'use client'
import { useState } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import { createUser } from '@/actions/users'

export function CreateUserModal() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const inputClass = "flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      await createUser(new FormData(e.currentTarget))
      setOpen(false)
    } catch {
      setError("Foydalanuvchi yaratishda xato yuz berdi")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Yangi foydalanuvchi
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-[hsl(var(--background))] rounded-[6px] border border-[hsl(var(--border))] shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Yangi foydalanuvchi</h3>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--muted))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">To'liq ism</label>
                <input name="fullName" required placeholder="Ism Familiya" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Email</label>
                <input name="email" type="email" required placeholder="email@edumind.uz" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Parol</label>
                <input name="password" type="password" required placeholder="Kamida 8 ta belgi" minLength={8} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Rol</label>
                <select name="role" className={inputClass}>
                  <option value="STUDENT">Talaba</option>
                  <option value="TEACHER">O'qituvchi</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 h-9 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" disabled={pending} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors">
                  {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
