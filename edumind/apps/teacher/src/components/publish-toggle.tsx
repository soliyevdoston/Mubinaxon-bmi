'use client'
import { updateLessonPublishStatus } from '@/actions/lessons'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function PublishToggle({ lessonId, isPublished }: { lessonId: string; isPublished: boolean }) {
  const [published, setPublished] = useState(isPublished)
  return (
    <form action={async () => {
      await updateLessonPublishStatus(lessonId, !published)
      setPublished(!published)
    }}>
      <button type="submit" className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
        {published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {published ? 'Qoralamaga o\'tkazish' : "E'lon qilish"}
      </button>
    </form>
  )
}
