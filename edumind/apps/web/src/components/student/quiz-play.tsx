'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import type { QuizQuestion, LeaderboardEntry } from '@edumind/types'
import { Check, X, Trophy, Home, Zap } from 'lucide-react'

interface Props {
  sessionCode: string
  userId: string
}

type Phase = 'question' | 'answered' | 'finished'

const optionConfig = [
  { letter: 'A', gradient: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(270,80%,65%))', bg: 'hsl(250 85% 62% / 0.1)', border: 'hsl(250 85% 62% / 0.3)', glow: 'hsl(250 85% 62% / 0.25)' },
  { letter: 'B', gradient: 'linear-gradient(135deg, hsl(210,85%,58%), hsl(225,80%,62%))', bg: 'hsl(210 85% 58% / 0.1)', border: 'hsl(210 85% 58% / 0.3)', glow: 'hsl(210 85% 58% / 0.25)' },
  { letter: 'C', gradient: 'linear-gradient(135deg, hsl(175,65%,42%), hsl(195,70%,48%))', bg: 'hsl(175 65% 42% / 0.1)', border: 'hsl(175 65% 42% / 0.3)', glow: 'hsl(175 65% 42% / 0.25)' },
  { letter: 'D', gradient: 'linear-gradient(135deg, hsl(155,60%,42%), hsl(170,65%,46%))', bg: 'hsl(155 60% 42% / 0.1)', border: 'hsl(155 60% 42% / 0.3)', glow: 'hsl(155 60% 42% / 0.25)' },
]

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
    if (stored) {
      const data = JSON.parse(stored) as { question: QuizQuestion; deadline: number; questionIndex: number; sessionId: string; timePerQuestion?: number }
      setCurrentQuestion(data.question)
      setDeadline(data.deadline)
      setQuestionIndex(data.questionIndex)
      setSessionId(data.sessionId)
      if (data.timePerQuestion) {
        setTimeLeft(data.timePerQuestion)
        setTimePerQuestion(data.timePerQuestion)
      }
      answerStartRef.current = Date.now()
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000')
    socketRef.current = s
    s.emit('session:join', { code: sessionCode, userId })

    s.on('question:show', ({ question, deadline: dl, questionIndex: qi, timePerQuestion: tpq }: { question: QuizQuestion; deadline: number; questionIndex: number; timePerQuestion?: number }) => {
      setCurrentQuestion(question)
      setDeadline(dl)
      setQuestionIndex(qi)
      if (tpq) { setTimeLeft(tpq); setTimePerQuestion(tpq) }
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
      if (remaining === 0) { clearInterval(interval); setPhase('answered') }
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

  const progress = timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 0
  const isUrgent = timeLeft <= 5 && timeLeft > 0

  // ---- Finished screen ----
  if (phase === 'finished') {
    const myResult = finalResults.find(r => r.userId === userId)
    const rankEmoji = myResult?.rank === 1 ? '🥇' : myResult?.rank === 2 ? '🥈' : myResult?.rank === 3 ? '🥉' : '🎯'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 100%, hsl(37 90% 10%) 0%, hsl(236 52% 5%) 50%, hsl(250 55% 7%) 100%)' }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(37 90% 58% / 0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative z-10 w-full max-w-sm space-y-5 animate-slide-up">
          {/* Rank card */}
          <div className="glass-strong rounded-2xl p-7 text-center"
            style={{ boxShadow: '0 24px 60px hsl(37 90% 58% / 0.15)' }}>
            <div className="text-5xl mb-3">{rankEmoji}</div>
            <p className="text-4xl font-black tracking-tight mb-1">
              {myResult?.rank ? `${myResult.rank}-o'rin` : '—'}
            </p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">Yakuniy natija</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))', boxShadow: '0 4px 20px hsl(37 90% 55% / 0.4)' }}>
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-lg">{myResult?.totalScore ?? 0} ball</span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'hsl(236 35% 13%)' }}>
              <p className="text-sm font-semibold">Top natijalar</p>
            </div>
            {finalResults.slice(0, 5).map((r, i) => {
              const isMe = r.userId === userId
              const rankColors = ['hsl(37,90%,58%)', 'hsl(220 15% 70%)', 'hsl(20,80%,55%)']
              return (
                <div key={r.userId}
                  className="flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-colors"
                  style={{
                    borderColor: 'hsl(236 35% 13%)',
                    background: isMe ? 'hsl(37 90% 58% / 0.06)' : undefined,
                  }}>
                  <span className="w-6 text-sm font-bold text-center flex-shrink-0"
                    style={{ color: i < 3 ? rankColors[i] : 'hsl(var(--muted-foreground))' }}>
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: isMe ? 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))' : 'hsl(236 42% 14%)' }}>
                    {r.fullName?.charAt(0)}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{r.fullName}</span>
                  {isMe && <span className="text-xs px-2 py-0.5 rounded-lg mr-1"
                    style={{ background: 'hsl(37 90% 55% / 0.12)', color: 'hsl(37,90%,65%)' }}>Sen</span>}
                  <span className="text-sm font-bold" style={{ color: isMe ? 'hsl(37,90%,65%)' : 'hsl(var(--foreground))' }}>
                    {r.totalScore}
                  </span>
                </div>
              )
            })}
          </div>

          <button onClick={() => router.push('/home')}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(280,75%,65%))', boxShadow: '0 4px 20px hsl(250 85% 62% / 0.35)' }}>
            <Home className="w-4 h-4" />
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    )
  }

  // ---- Loading ----
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl mx-auto animate-spin-3d flex items-center justify-center"
            style={{ border: '2px solid hsl(var(--primary))', borderTop: '2px solid transparent' }} />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  // ---- Quiz screen ----
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'hsl(236 35% 13%)', background: 'hsl(236 48% 6%)' }}>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: 'hsl(250,85%,70%)' }} />
          <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Savol {questionIndex + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 12%)' }}>
            <div className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: isUrgent
                  ? 'linear-gradient(90deg, hsl(0,72%,62%), hsl(20,85%,60%))'
                  : 'linear-gradient(90deg, hsl(250,85%,65%), hsl(280,75%,65%))',
              }} />
          </div>
          {/* Timer */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm relative"
            style={{
              background: isUrgent ? 'hsl(0 72% 62% / 0.15)' : 'hsl(250 85% 65% / 0.1)',
              border: `1.5px solid ${isUrgent ? 'hsl(0 72% 62% / 0.4)' : 'hsl(250 85% 65% / 0.3)'}`,
              color: isUrgent ? 'hsl(0,72%,68%)' : 'hsl(250,85%,75%)',
              animation: isUrgent ? 'pulse 0.8s ease-in-out infinite' : undefined,
            }}>
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 py-5 max-w-lg mx-auto w-full space-y-5">
        <div className="rounded-2xl p-5 animate-slide-up"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
          <p className="text-base font-semibold leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt, idx) => {
            const cfg = optionConfig[idx] ?? optionConfig[0]!
            let state: 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' = 'default'
            if (phase === 'answered') {
              if (idx === currentQuestion.correctIndex) state = 'correct'
              else if (idx === selectedIndex) state = 'wrong'
              else state = 'dimmed'
            } else if (selectedIndex === idx) {
              state = 'selected'
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={phase !== 'question'}
                className="w-full text-left rounded-xl border transition-all duration-200 disabled:pointer-events-none active:scale-[0.99] animate-slide-up"
                style={{
                  animationDelay: `${idx * 0.06}s`,
                  padding: '14px 16px',
                  background: state === 'correct' ? 'hsl(155 60% 42% / 0.12)'
                    : state === 'wrong' ? 'hsl(0 72% 62% / 0.1)'
                    : state === 'selected' ? cfg.bg
                    : state === 'dimmed' ? 'hsl(236 48% 6%)'
                    : 'hsl(236 48% 8%)',
                  borderColor: state === 'correct' ? 'hsl(155 60% 42% / 0.5)'
                    : state === 'wrong' ? 'hsl(0 72% 62% / 0.4)'
                    : state === 'selected' ? cfg.border
                    : state === 'dimmed' ? 'hsl(236 35% 12%)'
                    : 'hsl(236 35% 14%)',
                  boxShadow: state === 'correct' ? '0 0 20px hsl(155 60% 42% / 0.2)'
                    : state === 'wrong' ? '0 0 20px hsl(0 72% 62% / 0.15)'
                    : state === 'selected' ? `0 0 20px ${cfg.glow}`
                    : undefined,
                  opacity: state === 'dimmed' ? 0.45 : 1,
                }}>
                <span className="flex items-center gap-3">
                  {/* Letter badge */}
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={{
                      background: state === 'correct' ? 'linear-gradient(135deg, hsl(155,60%,42%), hsl(170,65%,46%))'
                        : state === 'wrong' ? 'linear-gradient(135deg, hsl(0,72%,58%), hsl(15,80%,60%))'
                        : state === 'selected' ? cfg.gradient
                        : 'hsl(236 42% 13%)',
                      color: ['correct','wrong','selected'].includes(state) ? 'white' : 'hsl(var(--muted-foreground))',
                      boxShadow: state === 'selected' ? `0 2px 8px ${cfg.glow}` : undefined,
                    }}>
                    {cfg.letter}
                  </span>
                  <span className="text-sm font-medium flex-1">{opt}</span>
                  {state === 'correct' && <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(155,60%,55%)' }} />}
                  {state === 'wrong' && <X className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(0,72%,65%)' }} />}
                </span>
              </button>
            )
          })}
        </div>

        {/* Answered state - mini leaderboard */}
        {phase === 'answered' && (
          <div className="rounded-xl p-4 animate-slide-up"
            style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(250,85%,70%)' }} />
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Keyingi savol kutilmoqda...</p>
            </div>
            {leaderboard.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">Hozirgi reyting</p>
                {leaderboard.slice(0, 3).map((r, i) => {
                  const isMe = r.userId === userId
                  return (
                    <div key={r.userId}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${isMe ? 'font-semibold' : ''}`}
                      style={{ background: isMe ? 'hsl(250 85% 65% / 0.08)' : undefined }}>
                      <span className="text-xs font-mono w-4 text-center text-[hsl(var(--muted-foreground))]">{i + 1}</span>
                      <span className="flex-1 truncate">{r.fullName}</span>
                      {isMe && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'hsl(250 85% 65% / 0.15)', color: 'hsl(250,85%,75%)' }}>sen</span>}
                      <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{r.totalScore}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
