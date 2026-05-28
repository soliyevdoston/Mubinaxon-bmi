import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { format } from 'date-fns'
import Link from 'next/link'
import { Radio, Clock, ChevronRight } from 'lucide-react'

export default async function SessionsPage() {
  const session = await auth()
  if (!session) return null

  const [activeSessions, pastSessions] = await Promise.all([
    prisma.quizSession.findMany({
      where: { hostId: session.user.id, status: { in: ['WAITING', 'ACTIVE', 'PAUSED'] } },
      include: {
        lesson: { select: { title: true, subject: { select: { name: true } } } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quizSession.findMany({
      where: { hostId: session.user.id, status: 'FINISHED' },
      include: {
        lesson: { select: { title: true, subject: { select: { name: true } } } },
        _count: { select: { participations: true } },
      },
      orderBy: { endedAt: 'desc' },
      take: 30,
    }),
  ])

  const statusLabel: Record<string, string> = {
    WAITING: 'Kutilmoqda',
    ACTIVE: 'Faol',
    PAUSED: 'Pauza',
    FINISHED: 'Tugagan',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sessiyalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {activeSessions.length + pastSessions.length} ta sessiya
        </p>
      </div>

      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
            Hozir aktiv ({activeSessions.length})
          </h2>
          <div className="space-y-2">
            {activeSessions.map((s) => (
              <Link
                key={s.id}
                href={`/teacher/sessions/${s.id}/host`}
                className="rounded-[6px] border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/4 px-4 py-3 flex items-center gap-4 hover:bg-[hsl(var(--success))]/8 transition-colors block"
              >
                <Radio className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.lesson.subject.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-semibold">{s.code}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s._count.participations} talaba</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          O'tgan sessiyalar
        </h2>
        {pastSessions.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-10 text-center">
            <Clock className="w-6 h-6 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiya o'tkazilmagan</p>
          </div>
        ) : (
          <div className="rounded-[6px] border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Dars</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Kod</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Talabalar</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Tugatilgan</th>
                </tr>
              </thead>
              <tbody>
                {pastSessions.map((s) => (
                  <tr key={s.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.lesson.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.lesson.subject.name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">{s.code}</td>
                    <td className="px-4 py-3">{s._count.participations}</td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                      {s.endedAt ? format(s.endedAt, 'dd.MM.yyyy HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
