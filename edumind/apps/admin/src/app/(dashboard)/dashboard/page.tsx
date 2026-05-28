import { prisma } from '@edumind/database'
import { Users, BookOpen, Radio, TrendingUp } from 'lucide-react'
import { DashboardChart } from '@/components/dashboard-chart'
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

  // Last 7 days activity
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

export default async function DashboardPage() {
  const data = await getDashboardData()

  const metrics = [
    { label: 'Jami foydalanuvchilar', value: data.totalUsers, sub: `${data.teacherCount} o'qituvchi, ${data.studentCount} talaba`, icon: Users },
    { label: 'Faol sessiyalar', value: data.activeSessions, sub: "Hozir o'tkazilmoqda", icon: Radio },
    { label: 'Jami darslar', value: data.totalLessons, sub: "Barcha fanlar bo'yicha", icon: BookOpen },
    { label: "Haftalik o'sish", value: `+${data.weeklyData.reduce((s, d) => s + d.sessions, 0)}`, sub: 'Oxirgi 7 kun', icon: TrendingUp },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bosh sahifa</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Tizim holati va ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-[6px] border border-[hsl(var(--border))] p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{m.label}</span>
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{m.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-[6px] border border-[hsl(var(--border))] p-6">
          <h2 className="text-sm font-semibold mb-4">Haftalik sessiyalar</h2>
          <DashboardChart data={data.weeklyData} />
        </div>

        <div className="rounded-[6px] border border-[hsl(var(--border))] p-6">
          <h2 className="text-sm font-semibold mb-4">Eng faol o'qituvchilar</h2>
          <div className="space-y-3">
            {data.topTeachers.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-5 text-xs text-[hsl(var(--muted-foreground))] font-mono">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {t.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.fullName}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{t._count.hostedSessions} sessiya</p>
                </div>
              </div>
            ))}
            {data.topTeachers.length === 0 && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiyalar yo'q</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
