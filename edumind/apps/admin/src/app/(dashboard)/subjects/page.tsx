import { prisma } from '@edumind/database'
import { SubjectsManager } from '@/components/subjects-manager'

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: { select: { lessons: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Fanlar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{subjects.length} ta fan</p>
      </div>
      <SubjectsManager subjects={subjects} />
    </div>
  )
}
