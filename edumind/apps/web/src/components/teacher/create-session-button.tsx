'use client'
import { useState } from 'react'
import { Radio, Loader2, X } from 'lucide-react'
import { createSession } from '@/actions/teacher/sessions'
import { useRouter } from 'next/navigation'

export function CreateSessionButton({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [showModal, setShowModal] = useState(false)
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    setCreating(true)
    const sessionId = await createSession({ lessonId, timePerQuestion })
    router.push(`/teacher/sessions/${sessionId}/host`)
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">
        <Radio className="w-4 h-4" />
        Sessiya boshlash
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-[hsl(var(--background))] rounded-[6px] border border-[hsl(var(--border))] shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Sessiya sozlamalari</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--muted))] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">{lessonTitle}</p>
            <div className="space-y-3 mb-5">
              <label className="text-sm font-medium">Har savol uchun vaqt</label>
              <div className="flex gap-2">
                {[15, 30, 60].map(t => (
                  <button key={t} type="button" onClick={() => setTimePerQuestion(t)} className={`flex-1 h-9 rounded-[6px] text-sm font-medium border transition-colors ${timePerQuestion === t ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'}`}>
                    {t}s
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 h-9 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Boshlash
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
