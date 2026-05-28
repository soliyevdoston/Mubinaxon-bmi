import { prisma } from '@edumind/database'
import { BookOpen, User } from 'lucide-react'
import { format } from 'date-fns'
import { DeleteLessonButton } from '@/components/delete-lesson-button'

interface SearchParams { status?: string }

export default async function LessonsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const where = params.status === 'published'
    ? { isPublished: true }
    : params.status === 'draft'
    ? { isPublished: false }
    : {}

  const lessons = await prisma.lesson.findMany({
    where,
    include: {
      author: { select: { fullName: true } },
      subject: { select: { name: true } },
      _count: { select: { questions: true, sessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Darslar moderatsiyasi</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{lessons.length} ta dars</p>
        </div>
        <div className="flex gap-1">
          {[{ value: '', label: 'Barchasi' }, { value: 'published', label: "E'lon qilingan" }, { value: 'draft', label: 'Qoralama' }].map((f) => (
            <a
              key={f.value}
              href={f.value ? `?status=${f.value}` : '/lessons'}
              className={`h-9 px-3 rounded-[6px] text-sm font-medium transition-colors border inline-flex items-center ${
                params.status === f.value || (!params.status && !f.value)
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-[6px] border border-[hsl(var(--border))] p-12 text-center">
          <BookOpen className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Darslar topilmadi</p>
        </div>
      ) : (
        <div className="rounded-[6px] border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Nomi</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Fan</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Muallif</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Savollar</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Sana</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{lesson.title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{lesson.subject.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <User className="w-3 h-3" />
                      {lesson.author.fullName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{lesson._count.questions}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-[4px] border ${
                      lesson.isPublished
                        ? 'bg-[hsl(var(--success))]/8 border-[hsl(var(--success))]/20 text-[hsl(var(--success))]'
                        : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      {lesson.isPublished ? "E'lon qilingan" : 'Qoralama'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{format(lesson.createdAt, 'dd.MM.yyyy')}</td>
                  <td className="px-4 py-3">
                    <DeleteLessonButton lessonId={lesson.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
