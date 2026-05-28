import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { JoinSessionForm } from '@/components/join-session-form'
import { format } from 'date-fns'
import { Radio, Trophy, BookOpen } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Xush kelibsiz</p>
        <h1 className="text-xl font-semibold tracking-tight">{session.user.name}</h1>
      </div>

      <JoinSessionForm />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessiyalar', value: stats._count._all, icon: Radio },
          { label: 'Jami ball', value: stats._sum.totalScore ?? 0, icon: Trophy },
          { label: "O'rtacha", value: Math.round(stats._avg.totalScore ?? 0), icon: BookOpen },
        ].map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className="rounded-[6px] border border-[hsl(var(--border))] p-4 text-center">
              <Icon className="w-4 h-4 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
              <p className="text-xl font-semibold">{m.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{m.label}</p>
            </div>
          )
        })}
      </div>

      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">So'nggi sessiyalar</h2>
          <div className="space-y-2">
            {recentSessions.map((p) => (
              <div key={p.id} className="rounded-[6px] border border-[hsl(var(--border))] px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.session.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.session.lesson.subject.name} · {format(p.joinedAt, 'dd.MM.yyyy')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">{p.totalScore}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">ball</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
