'use client'
import { Trash2 } from 'lucide-react'
import { deleteLesson } from '@/actions/admin/lessons'

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  return (
    <form action={deleteLesson.bind(null, lessonId)}>
      <button type="submit"
        onClick={(e) => { if (!confirm("Darsni o'chirishni tasdiqlaysizmi?")) e.preventDefault() }}
        className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--destructive))]/5 hover:text-[hsl(var(--destructive))] transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </form>
  )
}
