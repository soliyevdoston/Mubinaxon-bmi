'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Play, ChevronRight, StopCircle, Users, Trophy, Flame } from 'lucide-react'
import { HEROES, type HeroClass } from '@/lib/heroes'
import { startQuizSession, nextQuizQuestion, endQuizSession } from '@/actions/teacher/sessions'

interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  difficulty: number
}

interface Participant {
  userId: string
  fullName: string
  totalScore: number
  heroClass?: HeroClass | null
}

interface LeaderboardEntry {
  userId: string
  fullName: string
  totalScore: number
  rank: number
  answersTotal: number
  heroClass?: HeroClass | null
  currentStreak?: number
}

interface Props {
  sessionId: string
  sessionCode: string
  lessonTitle: string
  questions: QuizQuestion[]
  timePerQuestion: number
}

export function HostSessionView({ sessionId, sessionCode, lessonTitle, questions, timePerQuestion }: Props) {
  const [status, setStatus] = useState<'waiting' | 'active' | 'finished'>('waiting')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [answeredCount, setAnsweredCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timePerQuestion)
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null)
  const [startError, setStartError] = useState('')
  const [nextError, setNextError] = useState('')
  const [starting, setStarting] = useState(false)
  const [nexting, setNexting] = useState(false)
  const [timeBetween, setTimeBetween] = useState(5)
  const [savingSettings, setSavingSettings] = useState(false)
  const savingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeBetweenInitialized = useRef(false)

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/state`)
      if (!res.ok) return
      const data = await res.json()

      setParticipants(data.participants ?? [])
      setLeaderboard(data.leaderboard ?? [])
      if (data.timeBetweenQuestionsSec !== undefined) {
        if (!timeBetweenInitialized.current) {
          // First poll: sync once from DB so UI shows correct saved value
          setTimeBetween(data.timeBetweenQuestionsSec)
          timeBetweenInitialized.current = true
        } else if (!savingRef.current && data.status === 'ACTIVE') {
          // Active session only: sync so teacher sees live value
          setTimeBetween(data.timeBetweenQuestionsSec)
        }
        // Waiting state after init: keep user's local selection, don't overwrite
      }

      if (data.status === 'FINISHED') { setStatus('finished'); return }
      if (data.status === 'ACTIVE') {
        setStatus('active')
        if (data.currentQuestion) {
          if (data.currentQuestion.id !== lastQuestionId) {
            setCurrentQuestion(data.currentQuestion)
            setQuestionIndex(data.questionIndex)
            setTimeLeft(data.timePerQuestionSec)
            setAnsweredCount(0)
            setLastQuestionId(data.currentQuestion.id)
          }
        }
        const answeredInSession = data.leaderboard?.filter(
          (e: LeaderboardEntry) => e.answersTotal > questionIndex
        ).length ?? 0
        setAnsweredCount(answeredInSession)
      }
    } catch {}
  }, [sessionId, lastQuestionId, questionIndex])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [poll])

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
  }, [status, lastQuestionId, timePerQuestion])

  function updateTimeBetween(val: number) {
    const clamped = Math.max(0, Math.min(30, val))
    setTimeBetween(clamped)
    // Waiting state: only update local UI, save happens when session starts
    // Active state: save to DB with debounce so next question uses new value
    if (status === 'active') {
      savingRef.current = true
      setSavingSettings(true)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        await fetch(`/api/sessions/${sessionId}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeBetweenQuestionsSec: clamped }),
        })
        savingRef.current = false
        setSavingSettings(false)
      }, 600)
    }
  }

  async function startSession() {
    if (questions.length === 0) { setStartError("Bu darsda savollar yo'q."); return }
    setStarting(true)
    setStartError('')
    try {
      const result = await startQuizSession(sessionId, timeBetween)
      if (result.ok) {
        setStatus('active')
      } else {
        if (result.error === 'No questions') setStartError("Darsda savollar yo'q.")
        else if (result.error === 'Forbidden') setStartError("Siz bu sessiyaning egasi emassiz.")
        else if (result.error === 'Unauthorized') setStartError("Tizimga qayta kiring.")
        else setStartError(`Xato: ${result.error ?? 'Noma\'lum — konsolni tekshiring'}`)
      }
    } catch {
      setStartError("Xato yuz berdi. Sahifani yangilab qayta urinib ko'ring.")
    }
    setStarting(false)
  }

  async function nextQuestion() {
    if (nexting) return
    setNexting(true)
    setNextError('')
    try {
      const result = await nextQuizQuestion(sessionId)
      if (!result.ok && !result.finished) {
        setNextError(`Xato: ${result.error ?? 'noma\'lum'}`)
      } else if (result.finished) {
        setStatus('finished')
      } else {
        setQuestionIndex(prev => prev + 1)
        setAnsweredCount(0)
      }
    } catch (e) {
      setNextError(`Xato yuz berdi: ${String(e)}`)
    }
    setNexting(false)
  }

  async function endSession() {
    try {
      await endQuizSession(sessionId)
    } catch {}
    setStatus('finished')
  }

  const progress = timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 0
  const isUrgent = timeLeft <= 5 && timeLeft > 0
  const answeredPct = participants.length > 0 ? (answeredCount / participants.length) * 100 : 0
  const isLastQuestion = questionIndex >= questions.length - 1

  const optionColors = [
    { bg: 'hsl(250 85% 62% / 0.08)', border: 'hsl(250 85% 62% / 0.25)', label: 'hsl(250,85%,72%)', letterBg: 'hsl(250 85% 62% / 0.15)' },
    { bg: 'hsl(210 85% 58% / 0.08)', border: 'hsl(210 85% 58% / 0.25)', label: 'hsl(210,85%,72%)', letterBg: 'hsl(210 85% 58% / 0.15)' },
    { bg: 'hsl(175 65% 42% / 0.08)', border: 'hsl(175 65% 42% / 0.25)', label: 'hsl(175,65%,60%)', letterBg: 'hsl(175 65% 42% / 0.15)' },
    { bg: 'hsl(37 90% 58% / 0.08)',  border: 'hsl(37 90% 58% / 0.25)',  label: 'hsl(37,90%,68%)',  letterBg: 'hsl(37 90% 58% / 0.15)'  },
  ]
  const letters = ['A', 'B', 'C', 'D']

  // ── FINISHED ──────────────────────────────────────────────────────────────
  if (status === 'finished') {
    return (
      <div className="max-w-xl space-y-5 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'hsl(37 90% 55% / 0.15)', border: '1px solid hsl(37 90% 55% / 0.3)' }}>
            🏆
          </div>
          <div>
            <h1 className="text-xl font-black">Sessiya yakunlandi</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{lessonTitle}</p>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: 'hsl(236 35% 13%)', background: 'hsl(236 48% 8%)' }}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: 'hsl(37,90%,62%)' }} />
              <span className="text-sm font-bold">Yakuniy reyting</span>
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{leaderboard.length} ishtirokchi</span>
          </div>
          {leaderboard.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Hech kim ishtirok etmadi</div>
          ) : leaderboard.slice(0, 10).map((entry, idx) => {
            const h = entry.heroClass ? HEROES[entry.heroClass] : null
            const rankColors = ['hsl(37,90%,62%)', 'hsl(220,15%,72%)', 'hsl(20,80%,60%)']
            const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
            return (
              <div key={entry.userId}
                className="flex items-center gap-3.5 px-5 py-3.5 border-b last:border-0"
                style={{ borderColor: 'hsl(236 35% 12%)', background: idx === 0 ? 'hsl(37 90% 55% / 0.05)' : undefined }}>
                <span className="w-7 text-sm font-black text-center flex-shrink-0"
                  style={{ color: idx < 3 ? rankColors[idx] : 'hsl(var(--muted-foreground))' }}>
                  {medalEmoji ?? idx + 1}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold"
                  style={h ? { background: h.gradient, boxShadow: `0 2px 8px ${h.glowColor}` } : { background: 'hsl(236 42% 14%)' }}>
                  {h ? h.emoji : entry.fullName.charAt(0)}
                </div>
                <p className="flex-1 text-sm font-semibold truncate">{entry.fullName}</p>
                {(entry.currentStreak ?? 0) >= 3 && (
                  <span className="text-xs font-bold" style={{ color: 'hsl(37,90%,65%)' }}>
                    🔥{entry.currentStreak}
                  </span>
                )}
                <p className="text-sm font-black tabular-nums" style={{ color: 'hsl(37,90%,65%)' }}>
                  {entry.totalScore}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── WAITING ───────────────────────────────────────────────────────────────
  if (status === 'waiting') {
    return (
      <div className="max-w-xl space-y-4 animate-fade-in">
        {/* Title */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-1">Yangi sessiya</p>
          <h1 className="text-2xl font-black tracking-tight">{lessonTitle}</h1>
        </div>

        {/* Session code — big card */}
        <div className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: 'hsl(236 48% 7%)', border: '1.5px solid hsl(250 85% 65% / 0.2)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, hsl(250 85% 65% / 0.07) 0%, transparent 70%)' }} />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))] mb-5">
            Talabalar shu kodni kiriting
          </p>
          <div className="inline-block px-10 py-5 rounded-2xl mb-6"
            style={{ background: 'hsl(236 48% 10%)', border: '1.5px solid hsl(250 85% 65% / 0.25)' }}>
            <p className="text-6xl font-mono font-black tracking-[0.15em]"
              style={{
                background: 'linear-gradient(135deg, hsl(250,85%,76%), hsl(280,75%,72%))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
              {sessionCode}
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-3xl font-black" style={{ color: 'hsl(250,85%,72%)' }}>{participants.length}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">qo&apos;shildi</p>
            </div>
            <div className="w-px h-10" style={{ background: 'hsl(236 35% 16%)' }} />
            <div className="text-center">
              <p className="text-3xl font-black">{questions.length}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">savol</p>
            </div>
          </div>
        </div>

        {/* Timer between questions */}
        <div className="rounded-2xl p-5"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 14%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">⏱ Savollar orasidagi kutish</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                Keyingi savol chiqishidan oldingi countdown
              </p>
            </div>
            {savingSettings && <span className="text-xs text-[hsl(var(--muted-foreground))] animate-pulse">Saqlanyapti...</span>}
          </div>
          {/* Quick presets */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[0, 3, 5, 10].map(v => (
              <button key={v} onClick={() => updateTimeBetween(v)}
                className="h-10 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: timeBetween === v ? 'hsl(250 85% 62% / 0.2)' : 'hsl(236 42% 11%)',
                  border: `1.5px solid ${timeBetween === v ? 'hsl(250 85% 62% / 0.45)' : 'hsl(236 35% 16%)'}`,
                  color: timeBetween === v ? 'hsl(250,85%,75%)' : 'hsl(var(--muted-foreground))',
                  boxShadow: timeBetween === v ? '0 2px 12px hsl(250 85% 62% / 0.2)' : undefined,
                }}>
                {v === 0 ? "Yo'q" : `${v}s`}
              </button>
            ))}
          </div>
          {/* Manual +/- */}
          <div className="flex items-center gap-3">
            <button onClick={() => updateTimeBetween(timeBetween - 1)} disabled={timeBetween <= 0}
              className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-25"
              style={{ background: 'hsl(236 42% 13%)', border: '1px solid hsl(236 35% 18%)' }}>
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-black tabular-nums"
                style={{ color: timeBetween > 0 ? 'hsl(250,85%,72%)' : 'hsl(var(--muted-foreground))' }}>
                {timeBetween}
              </span>
              <span className="text-sm text-[hsl(var(--muted-foreground))] ml-1.5">soniya</span>
            </div>
            <button onClick={() => updateTimeBetween(timeBetween + 1)} disabled={timeBetween >= 30}
              className="w-10 h-10 rounded-xl font-bold text-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-25"
              style={{ background: 'hsl(236 42% 13%)', border: '1px solid hsl(236 35% 18%)' }}>
              +
            </button>
          </div>
        </div>

        {/* Participants preview */}
        {participants.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor: 'hsl(236 35% 13%)' }}>
              <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="text-sm font-bold">Qo&apos;shilganlar</span>
              <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: 'hsl(250 85% 65% / 0.12)', color: 'hsl(250,85%,72%)' }}>
                {participants.length}
              </span>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {participants.map(p => {
                const h = p.heroClass ? HEROES[p.heroClass] : null
                return (
                  <div key={p.userId} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                    style={{ background: 'hsl(236 48% 9%)', border: '1px solid hsl(236 35% 12%)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold"
                      style={h ? { background: h.gradient, boxShadow: `0 1px 6px ${h.glowColor}` } : { background: 'hsl(236 42% 14%)' }}>
                      {h ? h.emoji : p.fullName.charAt(0)}
                    </div>
                    <span className="text-xs font-medium truncate">{p.fullName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {startError && (
          <div className="text-sm rounded-xl px-4 py-3"
            style={{ color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.08)', border: '1px solid hsl(var(--destructive) / 0.2)' }}>
            {startError}
          </div>
        )}

        {/* Start button */}
        {questions.length === 0 ? (
          <div className="rounded-xl px-4 py-3 text-sm text-center"
            style={{ color: 'hsl(var(--muted-foreground))', background: 'hsl(236 42% 10%)', border: '1px dashed hsl(236 35% 18%)' }}>
            Bu darsda hali savollar yo&apos;q. Darsni tahrirlang va savol qo&apos;shing.
          </div>
        ) : (
          <button onClick={startSession} disabled={starting}
            className="w-full h-14 rounded-2xl text-base font-black text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(280,75%,65%))', boxShadow: '0 6px 28px hsl(250 85% 62% / 0.45)' }}>
            {starting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {starting ? 'Boshlanmoqda...' : 'Sessiyani boshlash'}
          </button>
        )}
      </div>
    )
  }

  // ── ACTIVE ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Top status bar ── */}
      <div className="flex items-center justify-between gap-4 rounded-2xl px-5 py-3"
        style={{ background: 'hsl(236 48% 7%)', border: `1px solid ${isUrgent ? 'hsl(0 72% 62% / 0.35)' : 'hsl(236 35% 13%)'}` }}>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: 'hsl(155 60% 42% / 0.12)', color: 'hsl(155,60%,60%)', border: '1px solid hsl(155 60% 42% / 0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Jonli
          </span>
          <span className="text-sm font-bold text-[hsl(var(--muted-foreground))]">
            {questionIndex + 1} / {questions.length} savol
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Answered progress */}
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 14%)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${answeredPct}%`, background: 'linear-gradient(90deg, hsl(155,60%,45%), hsl(175,65%,50%))' }} />
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: 'hsl(155,60%,62%)' }}>
              {answeredCount}<span className="text-[hsl(var(--muted-foreground))] font-normal">/{participants.length}</span>
            </span>
          </div>
          {/* Timer */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all"
              style={{
                background: isUrgent ? 'hsl(0 72% 62% / 0.15)' : 'hsl(250 85% 65% / 0.1)',
                border: `2px solid ${isUrgent ? 'hsl(0 72% 62% / 0.5)' : 'hsl(250 85% 65% / 0.3)'}`,
                color: isUrgent ? 'hsl(0,72%,72%)' : 'hsl(250,85%,78%)',
                animation: isUrgent ? 'pulse-scale 0.5s ease-in-out infinite' : undefined,
              }}>
              {timeLeft}
            </div>
          </div>
          {/* End session */}
          <button onClick={endSession}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold transition-colors hover:bg-[hsl(var(--destructive))]/10"
            style={{ border: '1px solid hsl(var(--destructive) / 0.35)', color: 'hsl(var(--destructive))' }}>
            <StopCircle className="w-3.5 h-3.5" />
            Tugatish
          </button>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 12%)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%`, background: isUrgent ? 'linear-gradient(90deg, hsl(0,72%,62%), hsl(20,85%,60%))' : 'linear-gradient(90deg, hsl(250,85%,65%), hsl(280,75%,65%))' }} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Main: question + options */}
        <div className="col-span-3 space-y-3">
          {/* Question */}
          {currentQuestion ? (
            <>
              <div className="rounded-2xl p-6"
                style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">
                  Savol {questionIndex + 1}
                </p>
                <p className="text-xl font-bold leading-relaxed">{currentQuestion.text}</p>
              </div>

              {/* Options — teacher sees correct answer highlighted */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, i) => {
                  const c = optionColors[i] ?? optionColors[0]!
                  const isCorrect = i === currentQuestion.correctIndex
                  return (
                    <div key={i} className="rounded-xl px-4 py-3.5 flex items-center gap-3"
                      style={{
                        background: isCorrect ? 'hsl(155 60% 42% / 0.1)' : c.bg,
                        border: `1.5px solid ${isCorrect ? 'hsl(155 60% 42% / 0.5)' : c.border}`,
                      }}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                        style={{
                          background: isCorrect ? 'linear-gradient(135deg, hsl(155,60%,42%), hsl(170,65%,46%))' : c.letterBg,
                          color: isCorrect ? 'white' : c.label,
                        }}>
                        {letters[i]}
                      </span>
                      <span className="text-sm font-medium flex-1"
                        style={{ color: isCorrect ? 'hsl(155,60%,70%)' : undefined }}>
                        {opt}
                      </span>
                      {isCorrect && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'hsl(155 60% 42% / 0.15)', color: 'hsl(155,60%,65%)' }}>
                          To&apos;g&apos;ri
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl p-10 flex items-center justify-center"
              style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)', minHeight: 200 }}>
              <div className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center"
                  style={{ border: '2px solid hsl(250 85% 65% / 0.3)', borderTopColor: 'hsl(250,85%,65%)', animation: 'spin 0.9s linear infinite' }} />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Savol yuklanmoqda...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: live leaderboard */}
        <div className="col-span-2 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2"
            style={{ borderColor: 'hsl(236 35% 13%)', background: 'hsl(236 48% 8%)' }}>
            <Trophy className="w-4 h-4" style={{ color: 'hsl(37,90%,62%)' }} />
            <span className="text-sm font-bold">Jonli reyting</span>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
            {(leaderboard.length > 0
              ? leaderboard
              : participants.map((p, i): LeaderboardEntry => ({ ...p, rank: i + 1, answersTotal: 0 }))
            ).slice(0, 8).map((entry, idx) => {
              const h = entry.heroClass ? HEROES[entry.heroClass] : null
              const rankColors = ['hsl(37,90%,62%)', 'hsl(220,15%,72%)', 'hsl(20,80%,60%)']
              const streak = entry.currentStreak ?? 0
              return (
                <div key={entry.userId} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                  style={{ background: idx === 0 ? 'hsl(37 90% 55% / 0.07)' : 'hsl(236 48% 9%)', border: `1px solid ${idx === 0 ? 'hsl(37 90% 55% / 0.2)' : 'hsl(236 35% 12%)'}` }}>
                  <span className="w-5 text-xs font-black text-center flex-shrink-0"
                    style={{ color: idx < 3 ? rankColors[idx] : 'hsl(var(--muted-foreground))' }}>
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
                    style={h ? { background: h.gradient, boxShadow: `0 1px 6px ${h.glowColor}` } : { background: 'hsl(236 42% 14%)' }}>
                    {h ? h.emoji : entry.fullName.charAt(0)}
                  </div>
                  <span className="flex-1 text-xs font-medium truncate">{entry.fullName}</span>
                  {streak >= 3 && (
                    <Flame className="w-3 h-3 flex-shrink-0" style={{ color: 'hsl(37,90%,65%)' }} />
                  )}
                  <span className="text-xs font-black tabular-nums" style={{ color: 'hsl(250,85%,72%)' }}>
                    {entry.totalScore}
                  </span>
                </div>
              )
            })}
            {participants.length === 0 && leaderboard.length === 0 && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-6">
                Hech kim qo&apos;shilmagan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── NEXT QUESTION BUTTON — always visible when active ── */}
      <div className="pt-2 space-y-2">
        {nextError && (
          <div className="text-sm rounded-xl px-4 py-2.5"
            style={{ color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.08)', border: '1px solid hsl(var(--destructive) / 0.2)' }}>
            {nextError}
          </div>
        )}
        <button
          onClick={nextQuestion}
          disabled={nexting}
          className="w-full h-16 rounded-2xl text-base font-black text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          style={{
            background: isLastQuestion
              ? 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))'
              : 'linear-gradient(135deg, hsl(250,85%,62%), hsl(280,75%,65%))',
            boxShadow: isLastQuestion
              ? '0 6px 28px hsl(37 90% 55% / 0.45)'
              : '0 6px 28px hsl(250 85% 62% / 0.45)',
          }}>
          {nexting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isLastQuestion ? (
            <>🏁 Sessiyani yakunlash</>
          ) : (
            <>
              Keyingi savol
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
