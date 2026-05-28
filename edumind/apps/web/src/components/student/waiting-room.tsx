'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Users, Loader2 } from 'lucide-react'
import type { SessionParticipant, QuizQuestion } from '@edumind/types'

interface Props {
  sessionId: string
  sessionCode: string
  lessonTitle: string
  subjectName: string
  userId: string
  userName: string
}

export function WaitingRoom({ sessionId, sessionCode, lessonTitle, subjectName, userId, userName }: Props) {
  const router = useRouter()
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000')
    setSocket(s)
    s.emit('session:join', { code: sessionCode, userId })

    s.on('session:participantJoined', ({ user }: { user: SessionParticipant }) => {
      setParticipants(prev => [...prev.filter(p => p.userId !== user.userId), user])
    })
    s.on('session:participantLeft', ({ userId: uid }: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== uid))
    })
    s.on('session:started', ({ firstQuestion, deadline, timePerQuestion }: { firstQuestion: QuizQuestion; deadline: number; timePerQuestion: number }) => {
      const state = { question: firstQuestion, deadline, questionIndex: 0, sessionId, userId, timePerQuestion }
      sessionStorage.setItem(`quiz-${sessionCode}`, JSON.stringify(state))
      router.push(`/session/${sessionCode}/quiz`)
    })
    return () => { s.disconnect() }
  }, [sessionCode, userId, sessionId, router])

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
          <span>O'qituvchi boshlaguniga kuting...</span>
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{participants.length} talaba</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map(p => (
              <span key={p.userId} className={`text-xs px-2 py-1 rounded-[4px] border ${p.userId === userId ? 'border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]'}`}>
                {p.fullName}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
