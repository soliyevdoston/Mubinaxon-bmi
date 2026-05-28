'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import type { QuizQuestion, LeaderboardEntry } from '@edumind/types'
import { Check, X } from 'lucide-react'

interface Props {
  sessionCode: string
  userId: string
}

type Phase = 'question' | 'answered' | 'finished'

export function QuizPlay({ sessionCode, userId }: Props) {
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [deadline, setDeadline] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [finalResults, setFinalResults] = useState<LeaderboardEntry[]>([])
  const answerStartRef = useRef(Date.now())

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-${sessionCode}`)
    let storedSessionId = ''
    if (stored) {
      const data = JSON.parse(stored) as { question: QuizQuestion; deadline: number; questionIndex: number; sessionId: string; timePerQuestion?: number }
      setCurrentQuestion(data.question)
      setDeadline(data.deadline)
      setQuestionIndex(data.questionIndex)
      setSessionId(data.sessionId)
      storedSessionId = data.sessionId
      if (data.timePerQuestion) {
        setTimeLeft(data.timePerQuestion)
        setTimePerQuestion(data.timePerQuestion)
      }
      answerStartRef.current = Date.now()
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000')
    socketRef.current = s

    // Re-join the socket room so we receive events and can submit answers
    s.emit('session:join', { code: sessionCode, userId })

    s.on('question:show', ({ question, deadline: dl, questionIndex: qi, timePerQuestion: tpq }: { question: QuizQuestion; deadline: number; questionIndex: number; timePerQuestion?: number }) => {
      setCurrentQuestion(question)
      setDeadline(dl)
      setQuestionIndex(qi)
      if (tpq) setTimePerQuestion(tpq)
      setSelectedIndex(null)
      setPhase('question')
      answerStartRef.current = Date.now()
    })

    s.on('leaderboard:update', ({ rankings }: { rankings: LeaderboardEntry[] }) => {
      setLeaderboard(rankings)
    })

    s.on('session:ended', ({ finalResults: fr }: { finalResults: LeaderboardEntry[] }) => {
      setFinalResults(fr)
      setPhase('finished')
      sessionStorage.removeItem(`quiz-${sessionCode}`)
    })

    return () => { s.disconnect() }
  }, [sessionCode, userId])

  useEffect(() => {
    if (!deadline || phase !== 'question') return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        setPhase('answered')
      }
    }, 200)
    return () => clearInterval(interval)
  }, [deadline, phase])

  function handleAnswer(idx: number) {
    if (phase !== 'question' || selectedIndex !== null || !currentQuestion) return
    setSelectedIndex(idx)
    setPhase('answered')
    const responseTimeMs = Date.now() - answerStartRef.current
    socketRef.current?.emit('answer:submit', { sessionId, questionId: currentQuestion.id, selectedIndex: idx, responseTimeMs })
  }

  if (phase === 'finished') {
    const myResult = finalResults.find(r => r.userId === userId)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-1">{myResult?.rank ?? '—'}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">-o'rin</p>
            <p className="text-2xl font-semibold mt-2">{myResult?.totalScore ?? 0} ball</p>
          </div>
          <div className="rounded-[6px] border border-[hsl(var(--border))]">
            {finalResults.slice(0, 5).map((r, i) => (
              <div key={r.userId} className={`flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))] last:border-0 ${r.userId === userId ? 'bg-[hsl(var(--primary))]/4' : ''}`}>
                <span className="w-5 text-sm font-mono text-[hsl(var(--muted-foreground))]">{i + 1}</span>
                <span className="flex-1 text-sm font-medium truncate">{r.fullName}</span>
                <span className="text-sm font-semibold">{r.totalScore}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/home')} className="w-full h-10 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Yuklanmoqda...</p>
      </div>
    )
  }

  const progress = timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 0

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">Savol {questionIndex + 1}</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <span className={`text-sm font-mono font-medium w-5 ${timeLeft <= 5 ? 'text-[hsl(var(--destructive))]' : ''}`}>{timeLeft}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 space-y-6 max-w-lg mx-auto w-full">
        <p className="text-base font-medium leading-relaxed">{currentQuestion.text}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => {
            let variant = 'default'
            if (phase === 'answered' && selectedIndex !== null) {
              if (idx === currentQuestion.correctIndex) variant = 'correct'
              else if (idx === selectedIndex && idx !== currentQuestion.correctIndex) variant = 'wrong'
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={phase !== 'question'}
                className={`w-full text-left px-4 py-3 rounded-[6px] border text-sm transition-all ${
                  variant === 'correct'
                    ? 'border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/8 text-[hsl(var(--success))]'
                    : variant === 'wrong'
                    ? 'border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/8 text-[hsl(var(--destructive))]'
                    : selectedIndex === idx
                    ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/8'
                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50 active:scale-[0.99]'
                } disabled:pointer-events-none`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-mono flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                  {variant === 'correct' && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
                  {variant === 'wrong' && <X className="w-4 h-4 ml-auto flex-shrink-0" />}
                </span>
              </button>
            )
          })}
        </div>

        {phase === 'answered' && (
          <div className="rounded-[6px] border border-[hsl(var(--border))] p-4">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Keyingi savol kutilmoqda...</p>
            {leaderboard.length > 0 && (
              <div className="mt-2 space-y-1">
                {leaderboard.slice(0, 3).map((r, i) => (
                  <div key={r.userId} className={`flex items-center gap-2 text-sm ${r.userId === userId ? 'font-medium' : ''}`}>
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-4">{i + 1}</span>
                    <span className="flex-1 truncate">{r.fullName}</span>
                    <span className="font-mono text-xs">{r.totalScore}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
