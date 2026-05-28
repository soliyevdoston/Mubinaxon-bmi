import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { JoinSessionForm } from '@/components/join-session-form'
import { format } from 'date-fns'
import { Radio, Trophy, BookOpen, Sparkles } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()
  if (!session) return null

  const [recentSessions, stats] = await Promise.all([
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
  ])

  const metrics = [
    {
      label: 'Sessiyalar',
      value: stats._count._all,
      icon: Radio,
      gradient: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
      glow: 'hsl(250 85% 65% / 0.3)',
      bg: 'hsl(250 85% 65% / 0.1)',
    },
    {
      label: 'Jami ball',
      value: stats._sum.totalScore ?? 0,
      icon: Trophy,
      gradient: 'linear-gradient(135deg, hsl(37,90%,55%), hsl(20,85%,58%))',
      glow: 'hsl(37 90% 55% / 0.3)',
      bg: 'hsl(37 90% 55% / 0.1)',
    },
    {
      label: "O'rtacha",
      value: Math.round(stats._avg.totalScore ?? 0),
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, hsl(170,60%,42%), hsl(200,75%,50%))',
      glow: 'hsl(170 60% 42% / 0.3)',
      bg: 'hsl(170 60% 42% / 0.1)',
    },
  ]

  const firstName = session.user.name?.split(' ')[0] ?? session.user.name

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Welcome */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="w-4 h-4" style={{ color: 'hsl(170,60%,55%)' }} />
          <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">Xush kelibsiz</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span style={{
            background: 'linear-gradient(135deg, hsl(170,60%,55%), hsl(200,75%,60%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {firstName}
          </span>
          !
        </h1>
      </div>

      {/* Join form */}
      <JoinSessionForm />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-2xl p-4 text-center relative overflow-hidden card-hover"
              style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: m.bg, opacity: 0.5 }} />
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: m.gradient, boxShadow: `0 4px 12px ${m.glow}` }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{m.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-[hsl(var(--muted-foreground))] uppercase tracking-wide">So&apos;nggi sessiyalar</h2>
          <div className="space-y-2">
            {recentSessions.map((p) => (
              <div key={p.id}
                className="rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all"
                style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(170 60% 42% / 0.12)', border: '1px solid hsl(170 60% 42% / 0.2)' }}>
                  <BookOpen className="w-4 h-4" style={{ color: 'hsl(170,60%,55%)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.session.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {p.session.lesson.subject.name} · {format(p.joinedAt, 'dd.MM.yyyy')}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: 'hsl(170,60%,55%)' }}>{p.totalScore}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">ball</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'hsl(236 48% 7%)', border: '1px dashed hsl(236 35% 15%)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'hsl(170 60% 42% / 0.1)' }}>
            <Radio className="w-6 h-6" style={{ color: 'hsl(170,60%,55%)' }} />
          </div>
          <p className="text-sm font-medium mb-1">Hali sessiyalar yo&apos;q</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">O&apos;qituvchingizdan sessiya kodi oling</p>
        </div>
      )}
    </div>
  )
}
