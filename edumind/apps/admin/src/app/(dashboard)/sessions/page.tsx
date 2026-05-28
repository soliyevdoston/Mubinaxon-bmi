import { prisma } from '@edumind/database'
import { format } from 'date-fns'
import { Radio, Clock } from 'lucide-react'

export default async function SessionsPage() {
  const [activeSessions, recentSessions] = await Promise.all([
    prisma.quizSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        host: { select: { fullName: true } },
        lesson: { select: { title: true, subject: { select: { name: true } } } },
        _count: { select: { participations: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.quizSession.findMany({
      where: { status: 'FINISHED' },
      include: {
        host: { select: { fullName: true } },
        lesson: { select: { title: true, subject: { select: { name: true } } } },
        _count: { select: { participations: true } },
      },
      orderBy: { endedAt: 'desc' },
      take: 20,
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sessiyalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Barcha sessiyalar nazorati</p>
      </div>

      {activeSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
            Hozir aktiv ({activeSessions.length})
          </h2>
          <div className="space-y-2">
            {activeSessions.map((s) => (
              <div key={s.id} className="rounded-[6px] border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/4 px-4 py-3 flex items-center gap-4">
                <Radio className="w-4 h-4 text-[hsl(var(--success))]" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.lesson.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.host.fullName} — {s.lesson.subject.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium">{s.code}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{s._count.participations} talaba</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          So'nggi sessiyalar
        </h2>
        {recentSessions.length === 0 ? (
          <div className="rounded-[6px] border border-[hsl(var(--border))] p-8 text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali sessiyalar o'tkazilmagan</p>
          </div>
        ) : (
          <div className="rounded-[6px] border border-[hsl(var(--border))] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Dars</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">O'qituvchi</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Talabalar</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Kod</th>
                  <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Tugatilgan</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.lesson.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.lesson.subject.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{s.host.fullName}</td>
                    <td className="px-4 py-3">{s._count.participations}</td>
                    <td className="px-4 py-3 font-mono text-sm">{s.code}</td>
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
