import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { BookOpen, Radio, Users, Clock } from 'lucide-react'
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
      take: 5,
    }),
    prisma.participation.count({
      where: {
        session: { hostId: teacherId },
        joinedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  const metrics = [
    { label: 'Darslar', value: lessonCount, icon: BookOpen, href: '/lessons' },
    { label: 'Sessiyalar', value: sessionCount, icon: Radio, href: '/sessions' },
    { label: 'Faol talabalar', value: activeStudentCount, icon: Users, href: '/students', sub: 'Oxirgi 30 kun' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bosh sahifa</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Xush kelibsiz, {session.user.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/lessons/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">
            Yangi dars
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <Link key={m.label} href={m.href} className="rounded-[6px] border border-[hsl(var(--border))] p-5 hover:shadow-sm transition-shadow block">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{m.label}</span>
                <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
              {m.sub && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{m.sub}</p>}
            </Link>
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          So'nggi sessiyalar
        </h2>
        {recentSessions.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-8 text-center">
            <Radio className="w-6 h-6 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiya o'tkazilmagan</p>
            <Link href="/lessons" className="text-sm text-[hsl(var(--primary))] hover:underline underline-offset-4 mt-1 inline-block">Dars tanlash</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="rounded-[6px] border border-[hsl(var(--border))] px-4 py-3 flex items-center gap-4 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'ACTIVE' ? 'bg-[hsl(var(--success))] animate-pulse' : s.status === 'FINISHED' ? 'bg-[hsl(var(--muted-foreground))]' : 'bg-[hsl(var(--warning))]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{format(s.createdAt, 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono">{s.code}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s._count.participations} talaba</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
