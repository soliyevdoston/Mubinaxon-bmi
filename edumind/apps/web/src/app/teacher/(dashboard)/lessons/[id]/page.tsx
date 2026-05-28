import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, BookOpen } from 'lucide-react'
import { PublishToggle } from '@/components/teacher/publish-toggle'
import { CreateSessionButton } from '@/components/teacher/create-session-button'

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return null
  const { id } = await params

  const lesson = await prisma.lesson.findFirst({
    where: { id, authorId: session.user.id },
    include: {
      subject: true,
      topics: {
        include: { questions: { orderBy: { createdAt: 'asc' } } },
        orderBy: { orderIndex: 'asc' },
      },
      _count: { select: { sessions: true } },
    },
  })
  if (!lesson) notFound()

  const totalQuestions = lesson.topics.reduce((sum, t) => sum + t.questions.length, 0)

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/lessons" className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-[4px]">{lesson.subject.name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] border ${lesson.isPublished ? 'bg-[hsl(var(--success))]/8 border-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>
              {lesson.isPublished ? "E'lon qilingan" : 'Qoralama'}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight mt-1">{lesson.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CreateSessionButton lessonId={lesson.id} lessonTitle={lesson.title} />
        <PublishToggle lessonId={lesson.id} isPublished={lesson.isPublished} />
        <Link href={`/teacher/lessons/${lesson.id}/edit`} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
          <Edit className="w-4 h-4" />
          Tahrirlash
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mavzular', value: lesson.topics.length },
          { label: 'Savollar', value: totalQuestions },
          { label: 'Sessiyalar', value: lesson._count.sessions },
        ].map((m) => (
          <div key={m.label} className="rounded-[6px] border border-[hsl(var(--border))] p-4">
            <p className="text-2xl font-semibold">{m.value}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Mavzular va savollar
        </h2>
        {lesson.topics.map((topic) => (
          <div key={topic.id} className="rounded-[6px] border border-[hsl(var(--border))]">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 flex items-center justify-between">
              <span className="text-sm font-medium">{topic.name}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{topic.questions.length} savol</span>
            </div>
            <div className="divide-y divide-[hsl(var(--border))]">
              {topic.questions.map((q, idx) => (
                <div key={q.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] mt-0.5 flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{q.text}</p>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {(q.options as string[]).map((opt, oIdx) => (
                          <span key={oIdx} className={`text-xs px-2 py-1 rounded-[4px] ${oIdx === q.correctIndex ? 'bg-[hsl(var(--success))]/8 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] flex-shrink-0">D:{q.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
