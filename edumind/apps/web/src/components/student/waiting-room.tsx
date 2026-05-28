'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader2 } from 'lucide-react'

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
  totalScore: number
}

export function WaitingRoom({ sessionId, sessionCode, lessonTitle, subjectName, userId }: Props) {
  const router = useRouter()
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/join`, { method: 'POST' }).catch(() => {})

    const poll = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/state`)
        if (!res.ok) return
        const data = await res.json()
        setParticipants(data.participants ?? [])
        if (data.status === 'ACTIVE') {
          router.push(`/student/session/${sessionCode}/quiz`)
        }
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [sessionId, sessionCode, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">{subjectName}</p>
          <h1 className="text-lg font-semibold tracking-tight">{lessonTitle}</h1>
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-6">
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">Sessiya kodi</p>
          <p className="text-4xl font-mono font-bold tracking-widest">{sessionCode}</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>O&apos;qituvchi boshlaguniga kuting...</span>
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{participants.length} talaba</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map(p => (
              <span key={p.userId}
                className={`text-xs px-2 py-1 rounded-[4px] border ${p.userId === userId ? 'border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]'}`}>
                {p.fullName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
