import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { BarChart3 } from 'lucide-react'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) return null

  const sessions = await prisma.quizSession.findMany({
    where: { hostId: session.user.id, status: 'FINISHED' },
    include: {
      lesson: { select: { title: true } },
      participations: { select: { totalScore: true } },
    },
    orderBy: { endedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analitika</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sessiyalar bo'yicha tahlil</p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <BarChart3 className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Tahlil uchun sessiya ma'lumotlari yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => {
            const avg = s.participations.length > 0
              ? Math.round(s.participations.reduce((sum, p) => sum + p.totalScore, 0) / s.participations.length)
              : 0
            return (
              <div key={s.id} className="rounded-[6px] border border-[hsl(var(--border))] px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.participations.length} talaba</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{avg}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">o'rtacha ball</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
