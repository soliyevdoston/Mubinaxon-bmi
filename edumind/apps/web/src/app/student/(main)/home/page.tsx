import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { JoinSessionForm } from '@/components/student/join-session-form'
import { format } from 'date-fns'
import { Radio, Trophy, BookOpen, Sparkles, Swords, Flame } from 'lucide-react'
import Link from 'next/link'
import { HEROES, calcLevel, levelProgress, type HeroClass } from '@/lib/heroes'

export default async function HomePage() {
  const session = await auth()
  if (!session) return null

  const [recentSessions, stats, user] = await Promise.all([
    prisma.participation.findMany({
      where: { userId: session.user.id },
      include: {
        session: {
          include: { lesson: { select: { title: true, subject: { select: { name: true } } } } },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 5,
    }),
    prisma.participation.aggregate({
      where: { userId: session.user.id },
      _count: { _all: true },
      _sum: { totalScore: true },
      _avg: { totalScore: true },
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

  const metrics = [
    {
      label: 'Sessiyalar',
      value: stats._count._all,
      icon: Radio,
      gradient: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
      glow: 'hsl(250 85% 65% / 0.35)',
      bg: 'hsl(250 85% 65% / 0.08)',
    },
    {
      label: 'Jami ball',
      value: stats._sum.totalScore ?? 0,
      icon: Trophy,
      gradient: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))',
      glow: 'hsl(37 90% 55% / 0.35)',
      bg: 'hsl(37 90% 55% / 0.08)',
    },
    {
      label: "O'rtacha",
      value: Math.round(stats._avg.totalScore ?? 0),
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, hsl(170,60%,42%), hsl(200,75%,50%))',
      glow: 'hsl(170 60% 42% / 0.35)',
      bg: 'hsl(170 60% 42% / 0.08)',
    },
  ]

  const firstName = session.user.name?.split(' ')[0] ?? session.user.name

  return (
    <div className="relative">
      {/* Background ambient orbs */}
      <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(ellipse, hsl(250 85% 65% / 0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-[20px] right-[-80px] w-[280px] h-[280px] rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(ellipse, hsl(280 75% 65% / 0.05) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '1s' }} />
      </div>

      <div className="relative space-y-7 animate-fade-in" style={{ zIndex: 1 }}>

        {/* Welcome */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: 'hsl(170,60%,55%)' }} />
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Xush kelibsiz</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span style={{
              background: 'linear-gradient(135deg, hsl(250,85%,75%), hsl(280,75%,70%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {firstName}
            </span>
            <span className="ml-1" style={{ WebkitTextFillColor: 'initial' }}>!</span>
          </h1>
        </div>

        {/* Hero card */}
        {heroConfig ? (
          <Link href="/student/profile"
            className="block rounded-3xl p-5 relative overflow-hidden transition-all hover:scale-[1.015] active:scale-[0.985] animate-bounce-pop"
            style={{
              background: `linear-gradient(135deg, ${heroConfig.bgColor}, hsl(236 48% 7%))`,
              border: `1.5px solid ${heroConfig.borderColor}`,
              boxShadow: `0 8px 32px ${heroConfig.glowColor}, 0 0 0 1px ${heroConfig.borderColor}`,
            }}>
            {/* Glow orb behind hero */}
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: `radial-gradient(ellipse, ${heroConfig.glowColor} 0%, transparent 70%)`, filter: 'blur(24px)' }} />

            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-float"
                style={{ background: heroConfig.gradient, boxShadow: `0 8px 24px ${heroConfig.glowColor}` }}>
                {heroConfig.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-base font-black">{heroConfig.name}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-black"
                    style={{ background: heroConfig.gradient, color: 'white', boxShadow: `0 2px 10px ${heroConfig.glowColor}` }}>
                    Lv.{level}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'hsl(236 42% 12%)' }}>
                  <div className="h-full rounded-full transition-all relative overflow-hidden"
                    style={{ width: `${lvlProgress}%`, background: heroConfig.gradient }}>
                    <div className="absolute inset-0 animate-shimmer"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%' }} />
                  </div>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">{totalScore.toLocaleString()} / {nextThreshold.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="relative mt-3.5 pt-3.5 border-t flex items-center gap-2" style={{ borderColor: heroConfig.borderColor }}>
              <span className="text-sm font-bold px-2.5 py-1 rounded-lg"
                style={{ background: heroConfig.bgColor, border: `1px solid ${heroConfig.borderColor}` }}>
                ⚡ {heroConfig.skill}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{heroConfig.skillDesc}</span>
            </div>
          </Link>
        ) : (
          <Link href="/student/profile"
            className="block rounded-3xl p-5 border-2 border-dashed transition-all hover:border-[hsl(250_85%_65%_/_0.3)] hover:bg-[hsl(250_85%_65%_/_0.04)] group animate-fade-in"
            style={{ borderColor: 'hsl(236 35% 16%)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: 'hsl(236 42% 12%)', border: '1.5px solid hsl(236 35% 18%)' }}>
                <Swords className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-base font-bold">Qahramon tanlanmagan</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Profilga o&apos;ting va sinfingizni tanlang →</p>
              </div>
            </div>
          </Link>
        )}

        {/* Join form */}
        <JoinSessionForm />

        {/* Stats */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">Statistika</p>
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={m.label} className="rounded-2xl p-4 text-center relative overflow-hidden card-hover animate-slide-in-bottom"
                  style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)', animationDelay: `${i * 0.08}s` }}>
                  <div className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ background: m.bg }} />
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                      style={{ background: m.gradient, boxShadow: `0 4px 16px ${m.glow}` }}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-3xl font-black tracking-tight">{m.value}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 font-medium">{m.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">So&apos;nggi sessiyalar</p>
            <div className="space-y-2.5">
              {recentSessions.map((p, i) => (
                <div key={p.id}
                  className="rounded-2xl px-4 py-4 flex items-center gap-3.5 transition-all card-hover animate-slide-in-bottom"
                  style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)', animationDelay: `${i * 0.07}s` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(170 60% 42% / 0.1)', border: '1px solid hsl(170 60% 42% / 0.2)' }}>
                    <BookOpen className="w-4 h-4" style={{ color: 'hsl(170,60%,55%)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.session.lesson.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {p.session.lesson.subject.name} · {format(p.joinedAt, 'dd.MM.yyyy')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black" style={{ color: 'hsl(170,60%,55%)' }}>{p.totalScore}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">ball</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentSessions.length === 0 && (
          <div className="rounded-3xl p-10 text-center animate-fade-in"
            style={{ background: 'hsl(236 48% 7%)', border: '1px dashed hsl(236 35% 16%)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
              style={{ background: 'hsl(250 85% 65% / 0.1)', border: '1px solid hsl(250 85% 65% / 0.2)' }}>
              <Radio className="w-6 h-6" style={{ color: 'hsl(250,85%,70%)' }} />
            </div>
            <p className="text-sm font-bold mb-1.5">Hali sessiyalar yo&apos;q</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">O&apos;qituvchingizdan sessiya kodi oling va o&apos;yin boshlang!</p>
          </div>
        )}
      </div>
    </div>
  )
}
