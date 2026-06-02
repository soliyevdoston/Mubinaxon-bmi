'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Trophy, Home, Zap, Flame } from 'lucide-react'
import { HEROES, type HeroClass } from '@/lib/heroes'

interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  difficulty: number
  explanation?: string
  topicId: string
}

interface LeaderboardEntry {
  userId: string
  fullName: string
  avatarUrl?: string
  heroClass?: HeroClass | null
  totalScore: number
  rank: number
  answersCorrect: number
  answersTotal: number
  currentStreak?: number
}

interface Props {
  sessionId: string
  sessionCode: string
  userId: string
  heroClass: HeroClass | null
}

type Phase = 'question' | 'answered' | 'finished' | 'countdown'

const optionConfig = [
  { letter: 'A', gradient: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(270,80%,65%))', bg: 'hsl(250 85% 62% / 0.12)', border: 'hsl(250 85% 62% / 0.35)', glow: 'hsl(250 85% 62% / 0.3)' },
  { letter: 'B', gradient: 'linear-gradient(135deg, hsl(210,85%,58%), hsl(225,80%,62%))', bg: 'hsl(210 85% 58% / 0.12)', border: 'hsl(210 85% 58% / 0.35)', glow: 'hsl(210 85% 58% / 0.3)' },
  { letter: 'C', gradient: 'linear-gradient(135deg, hsl(175,65%,42%), hsl(195,70%,48%))', bg: 'hsl(175 65% 42% / 0.12)', border: 'hsl(175 65% 42% / 0.35)', glow: 'hsl(175 65% 42% / 0.3)' },
  { letter: 'D', gradient: 'linear-gradient(135deg, hsl(155,60%,42%), hsl(170,65%,46%))', bg: 'hsl(155 60% 42% / 0.12)', border: 'hsl(155 60% 42% / 0.35)', glow: 'hsl(155 60% 42% / 0.3)' },
]

function HeroMini({ heroClass }: { heroClass?: HeroClass | null }) {
  if (!heroClass || !HEROES[heroClass]) return null
  const h = HEROES[heroClass]
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
      style={{ background: h.gradient, boxShadow: `0 2px 8px ${h.glowColor}` }}>
      {h.emoji}
    </div>
  )
}

// ── Neural background ──────────────────────────────────────────────────────
const NN_NODES = [
  { x: 50, y: 26, r: 2.4 },  // 0 core-top
  { x: 37, y: 37, r: 2.0 },  // 1 core-left
  { x: 63, y: 37, r: 2.0 },  // 2 core-right
  { x: 50, y: 47, r: 2.2 },  // 3 core-center
  { x: 22, y: 20, r: 1.5 },  // 4 outer-ul
  { x: 78, y: 20, r: 1.5 },  // 5 outer-ur
  { x: 12, y: 46, r: 1.3 },  // 6 outer-left
  { x: 88, y: 46, r: 1.3 },  // 7 outer-right
  { x: 27, y: 68, r: 1.6 },  // 8 lower-left
  { x: 73, y: 68, r: 1.6 },  // 9 lower-right
  { x: 50, y: 74, r: 1.5 },  // 10 bottom-center
  { x: 5,  y: 28, r: 1.0 },  // 11 far-left
  { x: 95, y: 28, r: 1.0 },  // 12 far-right
  { x: 40, y: 84, r: 1.2 },  // 13 bottom-left
  { x: 60, y: 84, r: 1.2 },  // 14 bottom-right
  { x: 50, y: 10, r: 1.0 },  // 15 very-top
]

const NN_EDGES = [
  [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],  // core
  [0,4],[0,5],[0,15],                    // top links
  [1,4],[1,6],[2,5],[2,7],              // outer links
  [3,8],[3,9],[3,10],                   // bottom links
  [4,6],[5,7],[6,11],[7,12],            // edges
  [8,13],[9,14],[10,13],[10,14],        // bottom
  [11,4],[12,5],[15,4],[15,5],          // very outer
]

// connections that light up as "signals" on correct answer
const SIGNAL_PATHS: [number, number][] = [[4,1],[5,2],[1,3],[2,3],[0,3],[8,3],[9,3]]

function NeuralBackground({ answerResult, streak, flashKey }: {
  answerResult: 'correct' | 'wrong' | null
  streak: number
  flashKey: number
}) {
  const isCorrect = answerResult === 'correct'
  const isWrong   = answerResult === 'wrong'

  const nodeColor = isCorrect ? '#34d399' : isWrong ? '#f87171'
    : streak >= 7 ? '#fbbf24' : streak >= 3 ? '#a78bfa' : '#818cf8'

  const edgeOpacity = isCorrect ? 0.55 : isWrong ? 0.35 : 0.22
  const bgOpacity   = isCorrect ? 0.18 : isWrong ? 0.10 : streak >= 5 ? 0.09 : 0.05

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, opacity: bgOpacity, transition: 'opacity 0.5s ease' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        className="w-full h-full" style={{ filter: isCorrect ? 'drop-shadow(0 0 6px #34d39966)' : isWrong ? 'drop-shadow(0 0 4px #f8717166)' : undefined, transition: 'filter 0.4s ease' }}>

        {/* Edges */}
        {NN_EDGES.map((edge, i) => {
          const a = edge[0]!, b = edge[1]!
          const na = NN_NODES[a]!, nb = NN_NODES[b]!
          return (
            <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={nodeColor} strokeWidth={0.28} opacity={edgeOpacity}
              style={{ transition: 'stroke 0.4s ease, opacity 0.4s ease' }} />
          )
        })}

        {/* Nodes with SVG-native pulse */}
        {NN_NODES.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r}
            fill={nodeColor}
            style={{ transition: 'fill 0.4s ease' }}>
            <animate attributeName="opacity"
              values={isCorrect ? '0.7;1;0.7' : isWrong ? '0.5;0.9;0.5' : '0.45;0.85;0.45'}
              dur={`${1.4 + i * 0.22}s`}
              repeatCount="indefinite" />
          </circle>
        ))}

        {/* Traveling signals on correct answer */}
        {isCorrect && SIGNAL_PATHS.map(([a, b], i) => {
          const na = NN_NODES[a]!, nb = NN_NODES[b]!
          return (
            <circle key={`${flashKey}-sig-${i}`} r={1.2} fill="#ffffff" opacity={0.9}>
              <animateMotion
                dur={`${0.45 + i * 0.08}s`}
                begin={`${i * 0.1}s`}
                path={`M${na.x},${na.y} L${nb.x},${nb.y}`}
                fill="freeze" />
              <animate attributeName="opacity" values="0;1;0"
                dur={`${0.45 + i * 0.08}s`}
                begin={`${i * 0.1}s`}
                fill="freeze" />
            </circle>
          )
        })}
      </svg>
    </div>
  )
}

export function QuizPlay({ sessionId, userId, heroClass }: Props) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [timeLeft, setTimeLeft] = useState(30)
  const [phase, setPhase] = useState<Phase>('question')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [correctIndex, setCorrectIndex] = useState<number | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [finalResults, setFinalResults] = useState<LeaderboardEntry[]>([])
  const [streak, setStreak] = useState(0)
  const [lastPoints, setLastPoints] = useState<number | null>(null)
  const [pointsKey, setPointsKey] = useState(0)
  const [skillUsed, setSkillUsed] = useState(false)
  const [skillActive, setSkillActive] = useState(false)
  const [eliminatedIndices, setEliminatedIndices] = useState<Set<number>>(new Set())
  const [timerFrozen, setTimerFrozen] = useState(false)
  const [doubleReady, setDoubleReady] = useState(false)
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null)
  const [countdownLeft, setCountdownLeft] = useState(0)

  const lastQuestionIdRef = useRef<string | null>(null)
  const answerStartRef = useRef(Date.now())
  const answeredRef = useRef<Set<string>>(new Set())
  const timerFrozenRef = useRef(false)

  const heroConfig = heroClass ? HEROES[heroClass] : null

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/state`)
      if (!res.ok) return
      const data = await res.json()

      if (data.status === 'FINISHED') {
        setFinalResults(data.leaderboard ?? [])
        setPhase('finished')
        return
      }

      if (data.currentQuestion && data.currentQuestion.id !== lastQuestionIdRef.current) {
        lastQuestionIdRef.current = data.currentQuestion.id
        setCurrentQuestion(data.currentQuestion)
        setQuestionIndex(data.questionIndex)
        setTimePerQuestion(data.timePerQuestionSec)
        setSelectedIndex(null)
        setCorrectIndex(null)
        setLastPoints(null)
        setEliminatedIndices(new Set())
        setTimerFrozen(false)
        setAnswerResult(null)
        timerFrozenRef.current = false

        if (!answeredRef.current.has(data.currentQuestion.id)) {
          const betweenSecs = data.timeBetweenQuestionsSec ?? 0
          if (betweenSecs > 0) {
            setCountdownLeft(betweenSecs)
            setPhase('countdown')
          } else {
            setTimeLeft(data.timePerQuestionSec)
            answerStartRef.current = Date.now()
            setPhase('question')
          }
        }
      }

      const me = data.leaderboard?.find((e: LeaderboardEntry) => e.userId === userId)
      if (me?.currentStreak !== undefined) setStreak(me.currentStreak)
      if (me?.skillUsed !== undefined && me.skillUsed) setSkillUsed(true)

      setLeaderboard(data.leaderboard ?? [])
    } catch {}
  }, [sessionId, userId])

  useEffect(() => {
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [poll])

  // Countdown tick — decrements every second while in countdown phase
  useEffect(() => {
    if (phase !== 'countdown' || countdownLeft <= 0) return
    const t = setTimeout(() => setCountdownLeft(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdownLeft])

  // Transition to question when countdown reaches 0
  useEffect(() => {
    if (phase !== 'countdown' || countdownLeft > 0) return
    setTimeLeft(timePerQuestion)
    answerStartRef.current = Date.now()
    setPhase('question')
  }, [phase, countdownLeft, timePerQuestion])

  // Question timer
  useEffect(() => {
    if (phase !== 'question') return
    const interval = setInterval(() => {
      if (timerFrozenRef.current) return
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); setPhase('answered'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, currentQuestion?.id])

  function activateSkill() {
    if (skillUsed || skillActive || phase !== 'question' || !currentQuestion || !heroConfig) return
    setSkillActive(true)
    setSkillUsed(true)

    if (heroConfig.skillType === 'freeze') {
      timerFrozenRef.current = true
      setTimerFrozen(true)
      setTimeout(() => {
        timerFrozenRef.current = false
        setTimerFrozen(false)
        setSkillActive(false)
      }, 20000)
    } else if (heroConfig.skillType === 'eliminate') {
      const wrongIndices = currentQuestion.options.map((_, i) => i).filter(i => i !== currentQuestion.correctIndex)
      setEliminatedIndices(new Set(wrongIndices.slice(0, 2)))
      setSkillActive(false)
    } else if (heroConfig.skillType === 'double') {
      setDoubleReady(true)
      setSkillActive(false)
    }
  }

  async function handleAnswer(idx: number) {
    if (phase !== 'question' || !currentQuestion || answeredRef.current.has(currentQuestion.id)) return
    if (eliminatedIndices.has(idx)) return
    answeredRef.current.add(currentQuestion.id)
    setSelectedIndex(idx)
    setPhase('answered')

    const useSkill = doubleReady
    if (doubleReady) setDoubleReady(false)

    const responseTimeMs = Date.now() - answerStartRef.current
    const res = await fetch(`/api/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: currentQuestion.id, selectedIndex: idx, responseTimeMs, useSkill }),
    })
    if (res.ok) {
      const data = await res.json()
      setCorrectIndex(data.correctIndex)
      setStreak(data.streak ?? 0)
      const isCorrect = idx === data.correctIndex
      setAnswerResult(isCorrect ? 'correct' : 'wrong')
      if (data.pointsEarned > 0) {
        setLastPoints(data.pointsEarned)
        setPointsKey(k => k + 1)
      }
    }
  }

  const progress = timePerQuestion > 0 ? (timeLeft / timePerQuestion) * 100 : 0
  const isUrgent = timeLeft <= 5 && timeLeft > 0 && !timerFrozen

  if (phase === 'finished') {
    const myResult = finalResults.find(r => r.userId === userId)
    const rankEmoji = myResult?.rank === 1 ? '🥇' : myResult?.rank === 2 ? '🥈' : myResult?.rank === 3 ? '🥉' : '🎯'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 100%, hsl(37 90% 10%) 0%, hsl(236 52% 5%) 50%, hsl(250 55% 7%) 100%)' }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(37 90% 58% / 0.14) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="relative z-10 w-full max-w-sm space-y-5">
          <div className="glass-strong rounded-3xl p-8 text-center animate-bounce-pop"
            style={{ boxShadow: '0 24px 80px hsl(37 90% 58% / 0.2)' }}>
            <div className="text-6xl mb-4 animate-float">{rankEmoji}</div>
            <p className="text-5xl font-black tracking-tight mb-1">
              {myResult?.rank ? `${myResult.rank}-o'rin` : '—'}
            </p>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-5">Yakuniy natija</p>
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))', boxShadow: '0 4px 28px hsl(37 90% 55% / 0.5)' }}>
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white font-black text-2xl">{myResult?.totalScore ?? 0}</span>
              <span className="text-white/80 font-medium">ball</span>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden animate-slide-in-bottom" style={{ animationDelay: '0.2s', background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="px-4 py-3.5 border-b flex items-center gap-2" style={{ borderColor: 'hsl(236 35% 13%)' }}>
              <Trophy className="w-4 h-4" style={{ color: 'hsl(37,90%,60%)' }} />
              <p className="text-sm font-bold">Top natijalar</p>
            </div>
            {finalResults.slice(0, 5).map((r, i) => {
              const isMe = r.userId === userId
              const rankColors = ['hsl(37,90%,60%)', 'hsl(220,15%,72%)', 'hsl(20,80%,58%)']
              const rHero = r.heroClass ? HEROES[r.heroClass] : null
              return (
                <div key={r.userId} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-0"
                  style={{ borderColor: 'hsl(236 35% 13%)', background: isMe ? 'hsl(37 90% 58% / 0.07)' : undefined }}>
                  <span className="w-7 text-sm font-black text-center flex-shrink-0"
                    style={{ color: i < 3 ? rankColors[i] : 'hsl(var(--muted-foreground))' }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold"
                    style={rHero ? { background: rHero.gradient, boxShadow: `0 2px 10px ${rHero.glowColor}` } : { background: 'hsl(236 42% 14%)' }}>
                    {rHero ? rHero.emoji : r.fullName?.charAt(0)}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{r.fullName}</span>
                  {isMe && <span className="text-xs px-2 py-0.5 rounded-lg mr-1"
                    style={{ background: 'hsl(37 90% 55% / 0.15)', color: 'hsl(37,90%,68%)' }}>Sen</span>}
                  <span className="text-sm font-bold" style={{ color: isMe ? 'hsl(37,90%,68%)' : undefined }}>{r.totalScore}</span>
                </div>
              )
            })}
          </div>
          <button onClick={() => router.push('/student/home')}
            className="w-full h-14 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.97] animate-slide-in-bottom"
            style={{ animationDelay: '0.35s', background: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(280,75%,65%))', boxShadow: '0 4px 24px hsl(250 85% 62% / 0.4)' }}>
            <Home className="w-5 h-5" />
            Bosh sahifaga qaytish
          </button>
          <button onClick={() => router.push('/student/progress')}
            className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] animate-slide-in-bottom"
            style={{ animationDelay: '0.45s', background: 'hsl(236 48% 9%)', border: '1.5px solid hsl(250 85% 65% / 0.25)', color: 'hsl(250,85%,72%)' }}>
            🧠 Bilim miyasiga qarang
          </button>
        </div>
      </div>
    )
  }

  // ── Countdown between questions ──────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 0%, hsl(250 85% 12%) 0%, hsl(236 52% 5%) 60%)' }}>
        <NeuralBackground answerResult={null} streak={streak} flashKey={0} />

        {/* Orbital brain visualization */}
        <div className="relative flex items-center justify-center mb-8" style={{ width: 260, height: 260, zIndex: 1 }}>
          {/* Orbit rings */}
          {[60, 95, 125].map((r, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: r * 2, height: r * 2,
                border: `1px ${i === 2 ? 'dashed' : 'solid'} hsl(250 85% 65% / ${0.2 - i * 0.04})`,
                animation: `spin ${[20, 32, 45][i]}s linear ${i % 2 ? 'reverse' : 'normal'} infinite`,
              }} />
          ))}
          {/* Orbiting dots */}
          {[0,1,2,3,4,5].map(i => {
            const orbit = i < 3 ? 60 : 95
            const angle = (i / (i < 3 ? 3 : 3)) * 2 * Math.PI
            return (
              <div key={i} className="absolute w-2.5 h-2.5 rounded-full"
                style={{
                  background: answerResult === 'correct' ? '#34d399' : i % 3 === 0 ? 'hsl(250,85%,72%)' : i % 3 === 1 ? 'hsl(280,75%,68%)' : 'hsl(37,90%,62%)',
                  boxShadow: `0 0 10px currentColor`,
                  animation: `spin ${[18,22,28,24,35,30][i]}s linear ${i % 2 ? 'reverse' : 'normal'} infinite`,
                  transformOrigin: `${-orbit}px 0`,
                  left: '50%',
                  top: '50%',
                  marginLeft: -5,
                  marginTop: -5,
                }} />
            )
          })}
          {/* Brain core */}
          <div className="relative z-10 animate-brain-float">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-brain-glow"
              style={{ background: 'radial-gradient(circle at 35% 35%, hsl(250,85%,74%), hsl(280,75%,56%))', boxShadow: '0 0 40px hsl(250 85% 65% / 0.5)' }}>
              🧠
            </div>
          </div>
        </div>

        {/* Countdown number */}
        <div className="relative z-10 text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            {questionIndex + 2}-savol boshlanmoqda
          </p>
          <div key={countdownLeft}
            className="text-[96px] font-black leading-none animate-bounce-pop"
            style={{
              background: 'linear-gradient(135deg, hsl(250,85%,78%), hsl(280,75%,72%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px hsl(250 85% 65% / 0.6))',
            }}>
            {countdownLeft}
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Miyangiz tayorlanmoqda...</p>
          {streak >= 3 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-streak-fire"
              style={{ background: 'hsl(37 90% 55% / 0.15)', border: '1.5px solid hsl(37 90% 55% / 0.35)', color: 'hsl(37,90%,70%)' }}>
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{streak}× streak davom etmoqda!</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
            style={{ border: '3px solid hsl(250 85% 65% / 0.3)', borderTopColor: 'hsl(250,85%,65%)', animation: 'spin 0.9s linear infinite' }} />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  const shownCorrectIndex = correctIndex ?? (phase === 'answered' ? currentQuestion.correctIndex : null)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}>

      {/* Neural network background */}
      <NeuralBackground answerResult={answerResult} streak={streak} flashKey={pointsKey} />

      {/* Full-screen answer flash */}
      {answerResult === 'correct' && (
        <div key={`flash-c-${pointsKey}`}
          className="fixed inset-0 pointer-events-none z-50 animate-correct-flash"
          style={{ background: 'radial-gradient(ellipse at center, hsl(155 60% 42% / 0.18) 0%, transparent 65%)' }} />
      )}
      {answerResult === 'wrong' && (
        <div key={`flash-w-${pointsKey}`}
          className="fixed inset-0 pointer-events-none z-50 animate-correct-flash"
          style={{ background: 'radial-gradient(ellipse at center, hsl(0 72% 62% / 0.14) 0%, transparent 65%)' }} />
      )}

      {/* Score fly */}
      {lastPoints !== null && lastPoints > 0 && (
        <div key={`score-${pointsKey}`}
          className="fixed inset-x-0 top-1/3 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-score-fly text-center">
            <span className="text-6xl font-black"
              style={{ color: 'hsl(155,65%,60%)', textShadow: '0 0 40px hsl(155 65% 55% / 0.8), 0 0 80px hsl(155 65% 55% / 0.4)' }}>
              +{lastPoints}
            </span>
            {streak >= 3 && (
              <div className="text-lg font-bold mt-1" style={{ color: 'hsl(37,90%,65%)' }}>🔥 streak!</div>
            )}
          </div>
        </div>
      )}

      {/* Progress bar — full width stripe at top */}
      <div className="w-full h-1 flex-shrink-0 relative z-10" style={{ background: 'hsl(236 42% 12%)' }}>
        <div className="h-full transition-all duration-1000 ease-linear"
          style={{
            width: `${progress}%`,
            background: isUrgent
              ? 'linear-gradient(90deg, hsl(0,72%,62%), hsl(20,85%,60%))'
              : 'linear-gradient(90deg, hsl(250,85%,65%), hsl(280,75%,65%))',
          }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 relative z-10"
        style={{ borderColor: 'hsl(236 35% 13%)', background: 'hsl(236 48% 6% / 0.92)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2.5">
          {heroConfig ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: heroConfig.gradient, boxShadow: `0 2px 10px ${heroConfig.glowColor}` }}>
              {heroConfig.emoji}
            </div>
          ) : (
            <Zap className="w-4 h-4" style={{ color: 'hsl(250,85%,70%)' }} />
          )}
          <span className="text-sm font-semibold">{questionIndex + 1}-savol</span>
          {streak >= 3 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black animate-streak-fire"
              style={{ background: 'hsl(37 90% 55% / 0.18)', color: 'hsl(37,90%,70%)', border: '1.5px solid hsl(37 90% 55% / 0.4)', boxShadow: '0 0 16px hsl(37 90% 55% / 0.25)' }}>
              <Flame className="w-3.5 h-3.5" />
              {streak}× streak
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {timerFrozen ? (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full animate-pulse"
              style={{ background: 'hsl(0 75% 52% / 0.18)', color: 'hsl(0,75%,70%)', border: '1.5px solid hsl(0 75% 52% / 0.4)' }}>
              ⏸ Muzlatilgan
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 14%)' }}>
                <div className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%`, background: isUrgent ? 'linear-gradient(90deg, hsl(0,72%,62%), hsl(20,85%,60%))' : 'linear-gradient(90deg, hsl(250,85%,65%), hsl(280,75%,65%))' }} />
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base transition-all"
                style={{
                  background: isUrgent ? 'hsl(0 72% 62% / 0.18)' : 'hsl(250 85% 65% / 0.1)',
                  border: `2px solid ${isUrgent ? 'hsl(0 72% 62% / 0.5)' : 'hsl(250 85% 65% / 0.3)'}`,
                  color: isUrgent ? 'hsl(0,72%,72%)' : 'hsl(250,85%,78%)',
                  boxShadow: isUrgent ? '0 0 16px hsl(0 72% 62% / 0.25)' : undefined,
                  animation: isUrgent ? 'pulse-scale 0.5s ease-in-out infinite' : undefined,
                }}>
                {timeLeft}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-5 max-w-lg mx-auto w-full gap-4 relative z-10">

        {/* Question */}
        <div className="rounded-2xl p-5 animate-fade-in"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 14%)', boxShadow: '0 4px 24px hsl(236 52% 3% / 0.6)' }}>
          <p className="text-lg font-bold leading-relaxed">{currentQuestion.text}</p>
        </div>

        {/* Skill button */}
        {heroConfig && !skillUsed && phase === 'question' && (
          <button onClick={activateSkill}
            className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] animate-bounce-pop"
            style={{
              background: heroConfig.bgColor,
              border: `2px solid ${heroConfig.borderColor}`,
              boxShadow: `0 4px 20px ${heroConfig.glowColor}, 0 0 0 0 ${heroConfig.glowColor}`,
            }}>
            <span className="text-lg">{heroConfig.emoji}</span>
            <span>⚡ {heroConfig.skill}</span>
            <span className="text-xs opacity-55">— {heroConfig.skillDesc}</span>
          </button>
        )}

        {doubleReady && (
          <div className="text-center py-2 px-4 rounded-xl text-sm font-bold animate-pulse"
            style={{ background: 'hsl(155 60% 42% / 0.1)', color: 'hsl(155,65%,65%)', border: '1px solid hsl(155 60% 42% / 0.3)' }}>
            🎯 2× Ball tayyor — to&apos;g&apos;ri javob bering!
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const cfg = optionConfig[idx] ?? optionConfig[0]!
            const isEliminated = eliminatedIndices.has(idx)
            let state: 'default' | 'selected' | 'correct' | 'wrong' | 'dimmed' | 'eliminated' = 'default'
            if (isEliminated) {
              state = 'eliminated'
            } else if (phase === 'answered' && shownCorrectIndex !== null) {
              if (idx === shownCorrectIndex) state = 'correct'
              else if (idx === selectedIndex) state = 'wrong'
              else state = 'dimmed'
            } else if (selectedIndex === idx) {
              state = 'selected'
            }

            return (
              <button key={idx} onClick={() => handleAnswer(idx)}
                disabled={phase !== 'question' || isEliminated}
                className="w-full text-left rounded-2xl border-2 transition-all duration-200 disabled:pointer-events-none active:scale-[0.985] animate-option-reveal"
                style={{
                  minHeight: 68,
                  padding: '14px 18px',
                  animationDelay: `${idx * 0.07}s`,
                  background: state === 'correct' ? 'hsl(155 60% 42% / 0.14)' : state === 'wrong' ? 'hsl(0 72% 62% / 0.12)' : state === 'selected' ? cfg.bg : state === 'eliminated' ? 'hsl(236 48% 5%)' : state === 'dimmed' ? 'hsl(236 48% 6%)' : 'hsl(236 48% 8.5%)',
                  borderColor: state === 'correct' ? 'hsl(155 60% 42% / 0.6)' : state === 'wrong' ? 'hsl(0 72% 62% / 0.5)' : state === 'selected' ? cfg.border : state === 'eliminated' ? 'hsl(236 35% 10%)' : state === 'dimmed' ? 'hsl(236 35% 11%)' : 'hsl(236 35% 15%)',
                  boxShadow: state === 'correct' ? '0 0 30px hsl(155 60% 42% / 0.25), inset 0 1px 0 hsl(155 60% 42% / 0.2)' : state === 'wrong' ? '0 0 30px hsl(0 72% 62% / 0.18)' : state === 'selected' ? `0 0 28px ${cfg.glow}, inset 0 1px 0 hsl(255 85% 65% / 0.1)` : undefined,
                  opacity: state === 'dimmed' ? 0.4 : state === 'eliminated' ? 0.18 : 1,
                  transform: state === 'correct' ? 'scale(1.01)' : state === 'wrong' ? undefined : undefined,
                }}>
                <span className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: state === 'correct' ? 'linear-gradient(135deg, hsl(155,60%,42%), hsl(170,65%,46%))' : state === 'wrong' ? 'linear-gradient(135deg, hsl(0,72%,58%), hsl(15,80%,60%))' : state === 'selected' ? cfg.gradient : 'hsl(236 42% 13%)',
                      color: ['correct', 'wrong', 'selected'].includes(state) ? 'white' : 'hsl(var(--muted-foreground))',
                      boxShadow: ['correct', 'wrong', 'selected'].includes(state) ? '0 2px 10px rgba(0,0,0,0.3)' : undefined,
                      textDecoration: state === 'eliminated' ? 'line-through' : undefined,
                    }}>
                    {cfg.letter}
                  </span>
                  <span className={`text-sm font-semibold flex-1 leading-snug ${state === 'eliminated' ? 'line-through opacity-25' : ''}`}>{opt}</span>
                  {state === 'correct' && <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(155,60%,60%)' }} />}
                  {state === 'wrong' && <X className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(0,72%,68%)' }} />}
                </span>
              </button>
            )
          })}
        </div>

        {/* After answered: mini leaderboard */}
        {phase === 'answered' && (
          <div className="rounded-2xl p-4 animate-slide-in-bottom" style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(250,85%,70%)' }} />
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Keyingi savol kutilmoqda...</p>
            </div>
            {leaderboard.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-2">Hozirgi reyting</p>
                {leaderboard.slice(0, 3).map((r, i) => {
                  const isMe = r.userId === userId
                  const rHero = r.heroClass ? HEROES[r.heroClass] : null
                  const rankColors = ['hsl(37,90%,62%)', 'hsl(220,15%,72%)', 'hsl(20,80%,60%)']
                  return (
                    <div key={r.userId} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${isMe ? 'font-semibold' : ''}`}
                      style={{ background: isMe ? 'hsl(250 85% 65% / 0.1)' : 'hsl(236 48% 9%)', border: `1px solid ${isMe ? 'hsl(250 85% 65% / 0.2)' : 'hsl(236 35% 12%)'}` }}>
                      <span className="text-xs font-black w-5 text-center flex-shrink-0" style={{ color: i < 3 ? rankColors[i] : 'hsl(var(--muted-foreground))' }}>{i + 1}</span>
                      <HeroMini heroClass={r.heroClass} />
                      <span className="flex-1 truncate">{r.fullName}</span>
                      {isMe && <span className="text-xs px-1.5 py-0.5 rounded-lg" style={{ background: 'hsl(250 85% 65% / 0.15)', color: 'hsl(250,85%,75%)' }}>sen</span>}
                      {(r.currentStreak ?? 0) >= 3 && (
                        <span className="text-xs font-bold animate-streak-fire" style={{ color: 'hsl(37,90%,68%)' }}>🔥{r.currentStreak}</span>
                      )}
                      <span className="font-black text-xs tabular-nums">{r.totalScore}</span>
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
