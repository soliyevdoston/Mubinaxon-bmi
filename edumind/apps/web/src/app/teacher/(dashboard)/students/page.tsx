import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { GraduationCap } from 'lucide-react'

export default async function StudentsPage() {
  const session = await auth()
  if (!session) return null

  const rawStats = await prisma.participation.groupBy({
    by: ['userId'],
    where: { session: { hostId: session.user.id } },
    _count: { _all: true },
    _avg: { totalScore: true },
  })

  const userIds = rawStats.map(s => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true, email: true },
  })
  const userMap = new Map(users.map(u => [u.id, u]))

  const studentStats = rawStats.map(s => ({
    ...userMap.get(s.userId)!,
    sessions: s._count._all,
    avgScore: Math.round(s._avg.totalScore ?? 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Talabalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Sessiyalarimga qatnashgan talabalar</p>
      </div>

      {studentStats.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <GraduationCap className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Hali talabalar yo'q</p>
        </div>
      ) : (
        <div className="rounded-[6px] border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Talaba</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Sessiyalar</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">O'rtacha ball</th>
              </tr>
            </thead>
            <tbody>
              {studentStats.map((s) => (
                <tr key={s.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-medium">
                        {s.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{s.fullName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{s.sessions}</td>
                  <td className="px-4 py-3 font-medium">{s.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
