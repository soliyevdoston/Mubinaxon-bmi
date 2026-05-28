import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { format } from 'date-fns'
import { History } from 'lucide-react'

export default async function HistoryPage() {
  const session = await auth()
  if (!session) return null

  const participations = await prisma.participation.findMany({
    where: { userId: session.user.id },
    include: {
      session: {
        include: { lesson: { select: { title: true, subject: { select: { name: true } } } } },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Sessiyalar tarixi</h1>

      {participations.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <History className="w-6 h-6 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiyalarda qatnashmadingiz</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participations.map((p) => (
            <div key={p.id} className="rounded-[6px] border border-[hsl(var(--border))] px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.session.lesson.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {p.session.lesson.subject.name} · {format(p.joinedAt, 'dd.MM.yyyy HH:mm')}
                </p>
              </div>
              <div className="text-right flex-shrink-0 space-y-0.5">
                <p className="text-sm font-semibold">{p.totalScore} ball</p>
                {p.rank && <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.rank}-o'rin</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
