import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { BookOpen, Radio, Users, Plus, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null
  const teacherId = session.user.id

  const [lessonCount, sessionCount, recentSessions, activeStudentCount] = await Promise.all([
    prisma.lesson.count({ where: { authorId: teacherId } }),
    prisma.quizSession.count({ where: { hostId: teacherId } }),
    prisma.quizSession.findMany({
      where: { hostId: teacherId },
      include: {
        lesson: { select: { title: true } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.participation.count({
      where: {
        session: { hostId: teacherId },
        joinedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const metrics = [
    {
      label: 'Darslar',
      value: lessonCount,
      sub: 'Yaratilgan',
      icon: BookOpen,
      href: '/teacher/lessons',
      gradient: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))',
      glow: 'hsl(220 85% 60% / 0.3)',
      bg: 'hsl(220 85% 60% / 0.08)',
    },
    {
      label: 'Sessiyalar',
      value: sessionCount,
      sub: "Jami o'tkazilgan",
      icon: Radio,
      href: '/teacher/sessions',
      gradient: 'linear-gradient(135deg, hsl(280,75%,65%), hsl(250,85%,68%))',
      glow: 'hsl(280 75% 65% / 0.3)',
      bg: 'hsl(280 75% 65% / 0.08)',
    },
    {
      label: 'Faol talabalar',
      value: activeStudentCount,
      sub: 'Oxirgi 30 kun',
      icon: Users,
      href: '/teacher/students',
      gradient: 'linear-gradient(135deg, hsl(155,60%,45%), hsl(180,65%,48%))',
      glow: 'hsl(155 60% 45% / 0.3)',
      bg: 'hsl(155 60% 45% / 0.08)',
    },
  ]

  const statusConfig = {
    ACTIVE:   { label: 'Faol',      color: 'hsl(155,60%,48%)', bg: 'hsl(155 60% 48% / 0.12)', dot: 'hsl(155,60%,48%)' },
    WAITING:  { label: 'Kutish',    color: 'hsl(37,90%,58%)',  bg: 'hsl(37 90% 58% / 0.1)',  dot: 'hsl(37,90%,58%)' },
    PAUSED:   { label: 'Pauza',     color: 'hsl(37,90%,58%)',  bg: 'hsl(37 90% 58% / 0.1)',  dot: 'hsl(37,90%,58%)' },
    FINISHED: { label: 'Tugagan',   color: 'hsl(var(--muted-foreground))', bg: 'hsl(236 42% 12%)', dot: 'hsl(var(--muted-foreground))' },
  } as const

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" style={{ color: 'hsl(220,85%,65%)' }} />
            <h1 className="text-2xl font-bold tracking-tight">
              Xush kelibsiz, {session.user.name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Bugungi faoliyatingiz umumiy ko&apos;rinishi</p>
        </div>
        <Link href="/teacher/lessons/new"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))',
            boxShadow: '0 4px 20px hsl(220 85% 60% / 0.4)',
          }}>
          <Plus className="w-4 h-4" />
          Yangi dars
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon!
          return (
            <Link key={m.label} href={m.href}
              className="rounded-2xl p-5 card-hover relative overflow-hidden block"
              style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{ background: m.bg, filter: 'blur(20px)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wide">{m.label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: m.gradient, boxShadow: `0 4px 12px ${m.glow}` }}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight">{m.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">{m.sub}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <h2 className="text-sm font-semibold">So&apos;nggi sessiyalar</h2>
          </div>
          <Link href="/teacher/sessions" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Barchasini ko&apos;rish →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center"
            style={{ borderColor: 'hsl(236 35% 14%)', background: 'hsl(236 48% 6%)' }}>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'hsl(220 85% 60% / 0.1)' }}>
              <Radio className="w-6 h-6" style={{ color: 'hsl(220,85%,65%)' }} />
            </div>
            <p className="text-sm font-medium mb-1">Hali sessiya o&apos;tkazilmagan</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Birinchi quizingizni boshlang</p>
            <Link href="/teacher/lessons"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: 'hsl(220 85% 60% / 0.12)', color: 'hsl(220,85%,70%)', border: '1px solid hsl(220 85% 60% / 0.2)' }}>
              Dars tanlash
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => {
              const cfg = statusConfig[s.status as keyof typeof statusConfig] ?? statusConfig.FINISHED
              return (
                <div key={s.id}
                  className="rounded-xl px-4 py-3.5 flex items-center gap-4 transition-all hover:bg-[hsl(236_42%_9%)] cursor-pointer group"
                  style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cfg.dot, boxShadow: s.status === 'ACTIVE' ? `0 0 6px ${cfg.dot}` : undefined }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-[hsl(var(--foreground))] transition-colors">
                      {s.lesson.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{format(s.createdAt, 'dd.MM.yyyy HH:mm')}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium">{s.code}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{s._count.participations} talaba</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
