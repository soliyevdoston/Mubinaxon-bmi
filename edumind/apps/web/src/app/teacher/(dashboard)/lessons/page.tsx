import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import Link from 'next/link'
import { Plus, BookOpen, Search } from 'lucide-react'
import { format } from 'date-fns'

interface SearchParams { q?: string; status?: string; subject?: string }

export default async function LessonsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth()
  if (!session) return null
  const params = await searchParams
  const teacherId = session.user.id

  const [lessons, subjects] = await Promise.all([
    prisma.lesson.findMany({
      where: {
        authorId: teacherId,
        ...(params.q ? { title: { contains: params.q, mode: 'insensitive' } } : {}),
        ...(params.status === 'published' ? { isPublished: true } : params.status === 'draft' ? { isPublished: false } : {}),
        ...(params.subject ? { subjectId: params.subject } : {}),
      },
      include: {
        subject: { select: { name: true } },
        _count: { select: { questions: true, sessions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.subject.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Darslar</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{lessons.length} ta dars</p>
        </div>
        <Link href="/teacher/lessons/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">
          <Plus className="w-4 h-4" />
          Yangi dars
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <form>
            <input name="q" defaultValue={params.q} placeholder="Dars nomini qidirish..." className="pl-9 flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20" />
          </form>
        </div>
        <div className="flex gap-1">
          {[{ v: '', l: 'Barchasi' }, { v: 'published', l: "E'lon qilingan" }, { v: 'draft', l: 'Qoralama' }].map(f => (
            <a key={f.v} href={f.v ? `?status=${f.v}` : '/lessons'} className={`h-9 px-3 rounded-[6px] text-sm font-medium transition-colors border inline-flex items-center ${params.status === f.v || (!params.status && !f.v) ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>{f.l}</a>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-16 text-center">
          <BookOpen className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Hali dars yaratilmagan</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Birinchi darsni yarating va savollar generatsiya qiling</p>
          <Link href="/teacher/lessons/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">
            <Plus className="w-4 h-4" />
            Yangi dars
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/teacher/lessons/${lesson.id}`} className="rounded-[6px] border border-[hsl(var(--border))] p-5 hover:shadow-sm transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-[4px]">{lesson.subject.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-[4px] border ${lesson.isPublished ? 'bg-[hsl(var(--success))]/8 border-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>
                  {lesson.isPublished ? "E'lon qilingan" : 'Qoralama'}
                </span>
              </div>
              <h3 className="font-semibold text-sm mb-1 leading-snug">{lesson.title}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {lesson._count.questions} savol · {lesson._count.sessions} sessiya · {format(lesson.updatedAt, 'dd.MM.yyyy')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
