'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Play, ChevronRight, StopCircle, Users } from 'lucide-react'
import type { QuizQuestion, SessionParticipant, LeaderboardEntry } from '@edumind/types'

interface Props {
  sessionId: string
  sessionCode: string
  lessonTitle: string
  questions: QuizQuestion[]
  timePerQuestion: number
  hostId: string
}

export function HostSessionView({ sessionId, sessionCode, lessonTitle, questions, timePerQuestion, hostId }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting')
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [answeredCount, setAnsweredCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000')
    setSocket(s)
    s.emit('session:join', { code: sessionCode, userId: hostId })

    s.on('session:participantJoined', ({ user }: { user: SessionParticipant }) => {
      setParticipants(prev => [...prev.filter(p => p.userId !== user.userId), user])
    })
    s.on('session:participantLeft', ({ userId }: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== userId))
    })
    s.on('leaderboard:update', ({ rankings }: { rankings: LeaderboardEntry[] }) => {
      setLeaderboard(rankings)
      setAnsweredCount(prev => prev + 1)
    })
    s.on('session:ended', () => setStatus('finished'))
    return () => { s.disconnect() }
  }, [sessionCode, hostId])

  useEffect(() => {
    if (status !== 'active') return
    setTimeLeft(timePerQuestion)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, currentQIdx, timePerQuestion])

  function startSession() {
    socket?.emit('host:start', { sessionId })
    setStatus('active')
  }

  function nextQuestion() {
    socket?.emit('host:nextQuestion', { sessionId })
    setCurrentQIdx(prev => prev + 1)
    setAnsweredCount(0)
  }

  function endSession() {
    socket?.emit('host:end', { sessionId })
    setStatus('finished')
  }

  const currentQuestion = questions[currentQIdx]
  const progress = timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 0

  if (status === 'finished') {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-semibold tracking-tight">Sessiya yakunlandi</h1>
        <div className="rounded-[6px] border border-[hsl(var(--border))]">
          <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <span className="text-sm font-medium">Yakuniy reyting</span>
          </div>
          {leaderboard.slice(0, 10).map((entry, idx) => (
            <div key={entry.userId} className="flex items-center gap-4 px-4 py-3 border-b border-[hsl(var(--border))] last:border-0">
              <span className="w-6 text-sm font-mono text-[hsl(var(--muted-foreground))]">{idx + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{entry.fullName}</p>
              </div>
              <p className="text-sm font-semibold">{entry.totalScore} ball</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{lessonTitle}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Sessiya kodi: <span className="font-mono font-semibold text-[hsl(var(--foreground))]">{sessionCode}</span></p>
        </div>
        {status === 'active' && (
          <button onClick={endSession} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--destructive))]/30 text-[hsl(var(--destructive))] text-sm hover:bg-[hsl(var(--destructive))]/5 transition-colors">
            <StopCircle className="w-4 h-4" />
            Tugatish
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {status === 'waiting' ? (
            <div className="rounded-[6px] border border-[hsl(var(--border))] p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-[6px] bg-[hsl(var(--muted))] flex items-center justify-center mx-auto">
                <p className="text-2xl font-mono font-bold">{sessionCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{participants.length} talaba qo'shildi</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{questions.length} ta savol tayyorlangan</p>
              </div>
              <button
                onClick={startSession}
                disabled={participants.length === 0}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <Play className="w-4 h-4" />
                Boshlash
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4">
              <div className="rounded-[6px] border border-[hsl(var(--border))] p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{currentQIdx + 1} / {questions.length}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div className="h-full bg-[hsl(var(--primary))] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm font-mono font-medium w-6">{timeLeft}</span>
                  </div>
                </div>
                <p className="text-base font-medium mb-4">{currentQuestion.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt, i) => (
                    <div key={i} className={`rounded-[6px] border px-3 py-2 text-sm ${i === currentQuestion.correctIndex ? 'border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 text-[hsl(var(--success))]' : 'border-[hsl(var(--border))]'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{answeredCount} / {participants.length} javob berdi</p>
                <button onClick={nextQuestion} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">
                  {currentQIdx < questions.length - 1 ? 'Keyingi savol' : 'Tugatish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Ishtirokchilar ({participants.length})</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {participants.map(p => (
              <div key={p.userId} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {p.fullName.charAt(0)}
                </div>
                <span className="truncate">{p.fullName}</span>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Hali hech kim qo'shilmagan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
