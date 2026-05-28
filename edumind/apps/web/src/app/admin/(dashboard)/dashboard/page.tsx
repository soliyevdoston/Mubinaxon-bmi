import { prisma } from '@edumind/database'
import { Users, BookOpen, Radio, TrendingUp } from 'lucide-react'
import { DashboardChart } from '@/components/admin/dashboard-chart'
import { format, subDays } from 'date-fns'

async function getDashboardData() {
  const [totalUsers, teacherCount, studentCount, totalLessons, activeSessions, topTeachers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.lesson.count(),
    prisma.quizSession.count({ where: { status: 'ACTIVE' } }),
    prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: { _count: { select: { hostedSessions: true } } },
      orderBy: { hostedSessions: { _count: 'desc' } },
      take: 5,
    }),
  ])

  const weeklyData = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      return prisma.quizSession
        .count({ where: { createdAt: { gte: start, lte: end } } })
        .then((count) => ({ date: format(start, 'dd/MM'), sessions: count }))
    })
  )

  return { totalUsers, teacherCount, studentCount, totalLessons, activeSessions, topTeachers, weeklyData }
}

const metricConfig = [
  {
    label: 'Jami foydalanuvchilar',
    icon: Users,
    gradient: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
    glow: 'hsl(250 85% 65% / 0.25)',
    bg: 'hsl(250 85% 65% / 0.08)',
  },
  {
    label: 'Faol sessiyalar',
    icon: Radio,
    gradient: 'linear-gradient(135deg, hsl(155,60%,45%), hsl(180,65%,45%))',
    glow: 'hsl(155 60% 45% / 0.25)',
    bg: 'hsl(155 60% 45% / 0.08)',
  },
  {
    label: 'Jami darslar',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, hsl(220,80%,60%), hsl(240,80%,65%))',
    glow: 'hsl(220 80% 60% / 0.25)',
    bg: 'hsl(220 80% 60% / 0.08)',
  },
  {
    label: "Haftalik sessiyalar",
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, hsl(37,90%,58%), hsl(20,90%,60%))',
    glow: 'hsl(37 90% 58% / 0.25)',
    bg: 'hsl(37 90% 58% / 0.08)',
  },
]

export default async function DashboardPage() {
  const data = await getDashboardData()
  const weeklyTotal = data.weeklyData.reduce((s, d) => s + d.sessions, 0)

  const metrics = [
    { ...metricConfig[0], value: data.totalUsers,   sub: `${data.teacherCount} o'qituvchi · ${data.studentCount} talaba` },
    { ...metricConfig[1], value: data.activeSessions, sub: "Hozir o'tkazilmoqda" },
    { ...metricConfig[2], value: data.totalLessons,  sub: "Barcha fanlar bo'yicha" },
    { ...metricConfig[3], value: `+${weeklyTotal}`,  sub: 'Oxirgi 7 kun' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Boshqaruv paneli</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Tizim holati va asosiy ko&apos;rsatkichlar</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Yangilanish: hozir</p>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
            <span className="text-xs text-[hsl(var(--success))] font-medium">Tizim ishlayapti</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon!
          return (
            <div key={m.label} className="rounded-2xl p-5 card-hover relative overflow-hidden"
              style={{
                background: 'hsl(236 48% 7%)',
                border: '1px solid hsl(236 35% 13%)',
                animationDelay: `${i * 0.08}s`,
              }}>
              {/* Subtle bg glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
                style={{ background: m.bg, filter: 'blur(24px)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wide">{m.label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: m.gradient, boxShadow: `0 4px 12px ${m.glow}` }}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: `${i * 0.1 + 0.2}s` }}>
                  {m.value}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">{m.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts + Top teachers */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 rounded-2xl p-6"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold">Haftalik sessiyalar</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Oxirgi 7 kunlik faollik</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'hsl(250 85% 65% / 0.12)', color: 'hsl(250 85% 75%)', border: '1px solid hsl(250 85% 65% / 0.2)' }}>
              {weeklyTotal} sessiya
            </div>
          </div>
          <DashboardChart data={data.weeklyData} />
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: 'hsl(236 48% 7%)', border: '1px solid hsl(236 35% 13%)' }}>
          <h2 className="text-sm font-semibold mb-4">Eng faol o&apos;qituvchilar</h2>
          <div className="space-y-3">
            {data.topTeachers.map((t, i) => {
              const rankColors = [
                'hsl(37,90%,58%)',
                'hsl(220 15% 70%)',
                'hsl(20,80%,55%)',
              ]
              return (
                <div key={t.id} className="flex items-center gap-3 group">
                  <span className="w-5 text-xs font-bold text-center flex-shrink-0"
                    style={{ color: i < 3 ? rankColors[i] : 'hsl(var(--muted-foreground))' }}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, hsl(${250 - i * 20},80%,65%), hsl(${280 - i * 20},70%,65%))` }}>
                    {t.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.fullName}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{t._count.hostedSessions} sessiya</p>
                  </div>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'hsl(236 42% 12%)' }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (t._count.hostedSessions / (data.topTeachers[0]?._count?.hostedSessions || 1)) * 100)}%`,
                        background: 'linear-gradient(90deg, hsl(250,85%,65%), hsl(280,75%,65%))',
                      }} />
                  </div>
                </div>
              )
            })}
            {data.topTeachers.length === 0 && (
              <div className="text-center py-6">
                <Radio className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-2 opacity-40" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiyalar yo&apos;q</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
