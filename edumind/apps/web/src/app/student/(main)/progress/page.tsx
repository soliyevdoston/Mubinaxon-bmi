import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { TrendingUp } from 'lucide-react'
import { KnowledgeBrain } from '@/components/student/knowledge-brain'

export default async function ProgressPage() {
  const session = await auth()
  if (!session) return null

  const knowledgePoints = await prisma.knowledgePoint.findMany({
    where: { userId: session.user.id },
    include: {
      topic: {
        include: { lesson: { select: { title: true, subject: { select: { name: true } } } } },
      },
    },
    orderBy: { masteryLevel: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Bilim miyasi</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Har bir nuqta — bir mavzu. Hajmi va yorqinligi bilim darajasini ko'rsatadi.
        </p>
      </div>

      {knowledgePoints.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <TrendingUp className="w-6 h-6 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Hali sessiyalarda qatnashmadingiz. Birinchi sessiyaga qo'shiling!
          </p>
        </div>
      ) : (
        <KnowledgeBrain points={knowledgePoints} />
      )}
    </div>
  )
}
