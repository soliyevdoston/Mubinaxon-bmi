import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { TrendingUp, Zap } from 'lucide-react'
import { KnowledgeBrain } from '@/components/student/knowledge-brain'
import { HEROES, levelProgress, type HeroClass } from '@/lib/heroes'
import Link from 'next/link'

export default async function ProgressPage() {
  const session = await auth()
  if (!session) return null

  const [knowledgePoints, stats, user] = await Promise.all([
    prisma.knowledgePoint.findMany({
      where: { userId: session.user.id },
      include: {
        topic: {
          include: { lesson: { select: { title: true, subject: { select: { name: true } } } } },
        },
      },
      orderBy: { masteryLevel: 'asc' },
    }),
    prisma.participation.aggregate({
      where: { userId: session.user.id },
      _sum: { totalScore: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { heroClass: true },
    }),
  ])

  const heroClass = (user?.heroClass ?? null) as HeroClass | null
  const heroConfig = heroClass ? HEROES[heroClass] : null
  const totalScore = stats._sum.totalScore ?? 0
  const { level, progress: lvlProgress, nextThreshold } = levelProgress(totalScore)

  const weakTopics = knowledgePoints.filter(k => k.masteryLevel < 0.4).slice(0, 3)
  const mastered = knowledgePoints.filter(p => p.masteryLevel >= 0.7).length
  const mid = knowledgePoints.filter(p => p.masteryLevel >= 0.4 && p.masteryLevel < 0.7).length
  const weak = knowledgePoints.filter(p => p.masteryLevel < 0.4).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Bilim miyasi</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Har bir nuqta — bir mavzu. Hajmi bilim darajasini ko&apos;rsatadi.
          </p>
        </div>
        {heroConfig && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: heroConfig.bgColor, border: `1px solid ${heroConfig.borderColor}` }}>
            <span className="text-lg">{heroConfig.emoji}</span>
            <div className="text-right">
              <p className="text-xs font-black" style={{ color: 'hsl(var(--foreground))' }}>Lv.{level}</p>
              <p className="text-[10px]" style={{ color: heroConfig.glowColor }}>{heroConfig.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* XP bar */}
      {heroConfig && (
        <div className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'hsl(236 48% 7%)', border: `1px solid ${heroConfig.borderColor}` }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 80% 50%, ${heroConfig.glowColor} 0%, transparent 60%)`, opacity: 0.4 }} />
          <div className="relative flex items-center gap-3">
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: heroConfig.glowColor }} />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold">XP: {totalScore.toLocaleString()}</span>
                <span className="text-[hsl(var(--muted-foreground))]">Keyingi: {nextThreshold.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 12%)' }}>
                <div className="h-full rounded-full relative overflow-hidden"
                  style={{ width: `${lvlProgress}%`, background: heroConfig.gradient, transition: 'width 1s ease' }}>
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'shimmer 2s linear infinite', backgroundSize: '200% 100%' }} />
                </div>
              </div>
            </div>
            <span className="text-xs font-black px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: heroConfig.gradient, color: 'white' }}>
              Lv.{level}
            </span>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {knowledgePoints.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Yaxshi', count: mastered, color: 'hsl(155,60%,55%)', bg: 'hsl(155 60% 42% / 0.08)', border: 'hsl(155 60% 42% / 0.2)', emoji: '✅' },
            { label: "O'rtacha", count: mid, color: 'hsl(37,90%,65%)', bg: 'hsl(37 90% 55% / 0.08)', border: 'hsl(37 90% 55% / 0.2)', emoji: '📈' },
            { label: 'Mashq', count: weak, color: 'hsl(0,72%,65%)', bg: 'hsl(0 72% 62% / 0.08)', border: 'hsl(0 72% 62% / 0.2)', emoji: '🎯' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center"
              style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
              <p className="text-xl mb-0.5">{s.emoji}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {knowledgePoints.length === 0 ? (
        <div className="rounded-3xl p-12 text-center animate-fade-in"
          style={{ background: 'hsl(236 48% 7%)', border: '1px dashed hsl(236 35% 16%)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
            style={{ background: 'hsl(250 85% 65% / 0.1)', border: '1px solid hsl(250 85% 65% / 0.2)' }}>
            <TrendingUp className="w-6 h-6" style={{ color: 'hsl(250,85%,70%)' }} />
          </div>
          <p className="text-sm font-bold mb-2">Hali bilim nuqtalari yo&apos;q</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
            Sessiyalarda qatnashib savollarga javob bering — bilimingiz miyada ko&apos;rinadi!
          </p>
          <Link href="/student/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,62%), hsl(280,75%,65%))', boxShadow: '0 4px 20px hsl(250 85% 62% / 0.35)' }}>
            O&apos;yinga kirish →
          </Link>
        </div>
      ) : (
        <>
          <KnowledgeBrain points={knowledgePoints} />

          {/* Weak topics — call to action */}
          {weakTopics.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'hsl(236 48% 7%)', border: '1.5px solid hsl(0 72% 62% / 0.2)' }}>
              <div className="px-4 py-3.5 border-b flex items-center gap-2"
                style={{ borderColor: 'hsl(0 72% 62% / 0.15)', background: 'hsl(0 72% 62% / 0.06)' }}>
                <span className="text-base">🎯</span>
                <span className="text-sm font-bold">Mashq qilish kerak</span>
                <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">Zaif mavzular</span>
              </div>
              <div className="p-3 space-y-2">
                {weakTopics.map(kp => {
                  const pct = Math.round(kp.masteryLevel * 100)
                  return (
                    <div key={kp.id} className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                      style={{ background: 'hsl(0 72% 62% / 0.05)', border: '1px solid hsl(0 72% 62% / 0.12)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'hsl(0 72% 62% / 0.12)', border: '1px solid hsl(0 72% 62% / 0.25)' }}>
                        <span className="text-xs font-black" style={{ color: 'hsl(0,72%,68%)' }}>{pct}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{kp.topic.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{kp.topic.lesson.subject.name}</p>
                      </div>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'hsl(236 42% 12%)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'hsl(0,72%,60%)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 border-t" style={{ borderColor: 'hsl(0 72% 62% / 0.15)' }}>
                <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                  Bu mavzulardagi sessiyalarga qatnashing → bilim darajasi oshadi
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
