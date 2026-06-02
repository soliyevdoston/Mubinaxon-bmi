'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HEROES, type HeroClass } from '@/lib/heroes'

interface Props {
  sessionId: string
  sessionCode: string
  lessonTitle: string
  subjectName: string
  userId: string
  userName: string
}

interface Participant {
  userId: string
  fullName: string
  avatarUrl?: string
  heroClass?: HeroClass | null
  totalScore: number
}

function HeroAvatar({ heroClass, name }: { heroClass?: HeroClass | null; name: string }) {
  if (heroClass && HEROES[heroClass]) {
    const h = HEROES[heroClass]
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: h.gradient, boxShadow: `0 4px 16px ${h.glowColor}` }}>
        {h.emoji}
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ background: 'hsl(236 42% 14%)', border: '1px solid hsl(236 35% 18%)' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function WaitingRoom({ sessionId, sessionCode, lessonTitle, subjectName, userId }: Props) {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [dotCount, setDotCount] = useState(1)

  useEffect(() => {
    const iv = setInterval(() => setDotCount(d => d >= 3 ? 1 : d + 1), 450)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/join`, { method: 'POST' }).catch(() => {})
    const poll = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/state`)
        if (!res.ok) return
        const data = await res.json()
        setParticipants(data.participants ?? [])
        if (data.status === 'ACTIVE') router.push(`/student/session/${sessionCode}/quiz`)
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [sessionId, sessionCode, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: 'radial-gradient(ellipse 130% 80% at 50% -5%, hsl(250 85% 14%) 0%, hsl(236 52% 5%) 55%, hsl(280 60% 6%) 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, hsl(250 85% 65% / 0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-[-80px] w-[350px] h-[350px] pointer-events-none animate-pulse-glow"
        style={{ background: 'radial-gradient(ellipse, hsl(280 75% 65% / 0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-0 left-[-80px] w-[300px] h-[300px] pointer-events-none animate-pulse-glow"
        style={{ background: 'radial-gradient(ellipse, hsl(155 60% 42% / 0.05) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '1.2s' }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute pointer-events-none rounded-full animate-particle-float"
          style={{
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            left: `${10 + i * 15}%`,
            bottom: `${5 + (i % 3) * 10}%`,
            background: i % 2 === 0 ? 'hsl(250 85% 65% / 0.4)' : 'hsl(280 75% 65% / 0.35)',
            '--duration': `${3 + i * 0.7}s`,
            animationDelay: `${i * 0.5}s`,
          } as React.CSSProperties} />
      ))}

      <div className="w-full max-w-sm space-y-7 text-center relative z-10">

        {/* Lesson info */}
        <div className="animate-fade-in">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full"
            style={{ background: 'hsl(250 85% 65% / 0.12)', color: 'hsl(250,85%,72%)', border: '1px solid hsl(250 85% 65% / 0.2)' }}>
            {subjectName}
          </span>
          <h1 className="text-xl font-bold tracking-tight mt-3">{lessonTitle}</h1>
        </div>

        {/* Session code — hero element */}
        <div className="relative animate-bounce-pop" style={{ animationDelay: '0.15s' }}>
          {/* Pulsing rings behind code box */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-56 h-24 rounded-2xl animate-ring-expand"
              style={{ border: '1.5px solid hsl(250 85% 65% / 0.5)' }} />
            <div className="absolute w-56 h-24 rounded-2xl animate-ring-expand"
              style={{ border: '1px solid hsl(250 85% 65% / 0.3)', animationDelay: '0.7s' }} />
            <div className="absolute w-56 h-24 rounded-2xl animate-ring-expand"
              style={{ border: '1px solid hsl(250 85% 65% / 0.18)', animationDelay: '1.4s' }} />
          </div>

          <div className="relative rounded-3xl py-8 px-6"
            style={{
              background: 'hsl(236 48% 8%)',
              border: '1px solid hsl(250 85% 65% / 0.3)',
              boxShadow: '0 0 80px hsl(250 85% 65% / 0.1), 0 24px 60px hsl(236 52% 3% / 0.9), inset 0 1px 0 hsl(250 85% 65% / 0.12)',
            }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))] mb-4">Sessiya kodi</p>
            <p className="text-7xl font-mono font-black tracking-widest animate-pulse-scale"
              style={{
                background: 'linear-gradient(135deg, hsl(250,85%,78%) 0%, hsl(280,75%,74%) 50%, hsl(250,85%,72%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 28px hsl(250 85% 65% / 0.5))',
              }}>
              {sessionCode}
            </p>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full animate-dot-bounce"
                style={{
                  background: i < dotCount ? 'hsl(250,85%,70%)' : 'hsl(250 85% 65% / 0.25)',
                  animationDelay: `${i * 0.18}s`,
                  transition: 'background 0.2s',
                }} />
            ))}
          </div>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">O&apos;qituvchi boshlaguniga kuting</span>
        </div>

        {/* Participants list */}
        {participants.length > 0 ? (
          <div className="rounded-2xl overflow-hidden animate-slide-in-bottom" style={{ animationDelay: '0.45s', background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'hsl(236 35% 13%)' }}>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Ishtirokchilar</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'hsl(250 85% 65% / 0.12)', color: 'hsl(250,85%,72%)', border: '1px solid hsl(250 85% 65% / 0.25)' }}>
                {participants.length} kishi
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {participants.map((p, idx) => {
                const isMe = p.userId === userId
                const heroConfig = p.heroClass ? HEROES[p.heroClass] : null
                return (
                  <div key={p.userId}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all animate-option-reveal"
                    style={{
                      background: isMe ? 'hsl(250 85% 65% / 0.08)' : 'hsl(236 48% 9%)',
                      border: `1px solid ${isMe ? 'hsl(250 85% 65% / 0.3)' : 'hsl(236 35% 12%)'}`,
                      boxShadow: isMe ? '0 0 16px hsl(250 85% 65% / 0.06)' : undefined,
                      animationDelay: `${0.45 + idx * 0.06}s`,
                    }}>
                    <HeroAvatar heroClass={p.heroClass} name={p.fullName} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm truncate ${isMe ? 'font-bold' : 'font-medium'}`}>{p.fullName}</p>
                      {heroConfig && (
                        <p className="text-[11px] font-medium" style={{ color: heroConfig.glowColor }}>
                          {heroConfig.emoji} {heroConfig.name}
                        </p>
                      )}
                    </div>
                    {isMe && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'hsl(250 85% 65% / 0.15)', color: 'hsl(250,85%,75%)', border: '1px solid hsl(250 85% 65% / 0.3)' }}>
                        Sen
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))] animate-fade-in" style={{ animationDelay: '0.45s' }}>
            Hali hech kim qo&apos;shilmagan...
          </p>
        )}
      </div>
    </div>
  )
}
