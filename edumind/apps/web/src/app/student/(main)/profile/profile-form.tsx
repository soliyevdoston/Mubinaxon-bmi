'use client'
import { useState } from 'react'
import { User, Lock, Loader2, Check } from 'lucide-react'
import { updateProfile, updatePassword } from '@/actions/student/profile'

interface Props { name: string; email: string }

export function ProfileForm({ name, email }: Props) {
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profilePending, setProfilePending] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordPending, setPasswordPending] = useState(false)

  const inputClass = "flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfilePending(true); setProfileMsg(''); setProfileError('')
    const result = await updateProfile(new FormData(e.currentTarget))
    if (result?.error) setProfileError(result.error)
    else setProfileMsg('Profil saqlandi')
    setProfilePending(false)
  }

  async function handlePasswordSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordPending(true); setPasswordMsg(''); setPasswordError('')
    const result = await updatePassword(new FormData(e.currentTarget))
    if (result?.error) setPasswordError(result.error)
    else { setPasswordMsg('Parol yangilandi'); (e.target as HTMLFormElement).reset() }
    setPasswordPending(false)
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-xl font-semibold tracking-tight">Profil</h1>

      <div className="flex items-center gap-4 p-4 rounded-[6px] border border-[hsl(var(--border))]">
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{email}</p>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="rounded-[6px] border border-[hsl(var(--border))] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Profilni tahrirlash</h2>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">To'liq ism</label>
          <input name="fullName" defaultValue={name} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input name="email" type="email" defaultValue={email} className={inputClass} />
        </div>
        {profileError && <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{profileError}</p>}
        {profileMsg && <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))]"><Check className="w-4 h-4" />{profileMsg}</div>}
        <button type="submit" disabled={profilePending} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors">
          {profilePending && <Loader2 className="w-4 h-4 animate-spin" />}
          Saqlash
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="rounded-[6px] border border-[hsl(var(--border))] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <h2 className="text-sm font-semibold">Parolni almashtirish</h2>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Joriy parol</label>
          <input name="currentPassword" type="password" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Yangi parol</label>
          <input name="newPassword" type="password" placeholder="Kamida 8 ta belgi" className={inputClass} />
        </div>
        {passwordError && <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{passwordError}</p>}
        {passwordMsg && <div className="flex items-center gap-2 text-sm text-[hsl(var(--success))]"><Check className="w-4 h-4" />{passwordMsg}</div>}
        <button type="submit" disabled={passwordPending} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors">
          {passwordPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Yangilash
        </button>
      </form>
    </div>
  )
}
