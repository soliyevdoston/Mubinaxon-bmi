'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { updateLesson } from '@/actions/teacher/lessons'

interface Props {
  lesson: { id: string; title: string; description: string; subjectId: string; isPublished: boolean }
  subjects: { id: string; name: string }[]
}

export function EditLessonForm({ lesson, subjects }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(lesson.title)
  const [subjectId, setSubjectId] = useState(lesson.subjectId)
  const [description, setDescription] = useState(lesson.description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inputClass = "flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  async function handleSave() {
    if (!title.trim() || !subjectId) { setError("Sarlavha va fan majburiy"); return }
    setSaving(true)
    setError('')
    try {
      await updateLesson({ id: lesson.id, title, subjectId, description })
      router.push(`/lessons/${lesson.id}`)
    } catch {
      setError("Saqlashda xato yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/lessons/${lesson.id}`} className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Darsni tahrirlash</h1>
      </div>

      <div className="rounded-[6px] border border-[hsl(var(--border))] p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Dars sarlavhasi</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fan</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputClass}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tavsif <span className="text-[hsl(var(--muted-foreground))]">(ixtiyoriy)</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="flex w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 resize-none transition-colors"
          />
        </div>
        {error && (
          <p className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/5 border border-[hsl(var(--destructive))]/20 rounded-[6px] px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Saqlash
          </button>
          <Link href={`/lessons/${lesson.id}`} className="inline-flex items-center h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
            Bekor qilish
          </Link>
        </div>
      </div>
    </div>
  )
}
