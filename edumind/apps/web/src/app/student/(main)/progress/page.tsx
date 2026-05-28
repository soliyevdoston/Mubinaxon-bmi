import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function ProgressPage() {
  const session = await auth()
  if (!session) return null

  const knowledgePoints = await prisma.knowledgePoint.findMany({
    where: { userId: session.user.id },
    include: { topic: { include: { lesson: { select: { title: true, subject: { select: { name: true } } } } } } },
    orderBy: { masteryLevel: 'asc' },
  })

  function getMasteryLabel(level: number): { label: string; color: string } {
    if (level >= 0.7) return { label: 'Yaxshi', color: 'bg-[hsl(var(--success))]' }
    if (level >= 0.4) return { label: "O'rtacha", color: 'bg-[hsl(var(--warning))]' }
    return { label: "Mashq kerak", color: 'bg-[hsl(var(--destructive))]' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bilim darajasi</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{knowledgePoints.length} ta mavzu bo'yicha</p>
      </div>

      {knowledgePoints.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <TrendingUp className="w-6 h-6 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiyalarda qatnashmadingiz</p>
        </div>
      ) : (
        <div className="space-y-3">
          {knowledgePoints.map((kp) => {
            const mastery = getMasteryLabel(kp.masteryLevel)
            const pct = Math.round(kp.masteryLevel * 100)
            return (
              <div key={kp.id} className="rounded-[6px] border border-[hsl(var(--border))] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{kp.topic.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{kp.topic.lesson.subject.name}</p>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-[4px] text-white', mastery.color)}>
                    {mastery.label}
                  </span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', mastery.color)} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{kp.attemptsCount} ta urinish</p>
                  <p className="text-xs font-medium">{pct}%</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
