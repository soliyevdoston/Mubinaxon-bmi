'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { createLesson } from '@/actions/lessons'
import { QuestionEditor } from '@/components/question-editor'
import type { AIGenerationResult } from '@edumind/types'
import { useEffect } from 'react'

interface Subject { id: string; name: string }
interface GeneratedTopic { name: string; description: string }
interface GeneratedQuestion {
  text: string
  options: string[]
  correctIndex: number
  difficulty: number
  topicIndex: number
  explanation: string
}

export default function NewLessonPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([])
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/subjects').then(r => r.json()).then(setSubjects)
  }, [])

  async function generateQuestions() {
    if (!content.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data: AIGenerationResult = await res.json()
      setGeneratedTopics(data.topics)
      setGeneratedQuestions(data.questions)
      setStep(3)
    } catch {
      alert("Savollar generatsiyasida xato yuz berdi")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave(publish: boolean) {
    if (!title || !subjectId) return
    setSaving(true)
    try {
      const lessonId = await createLesson({ title, subjectId, description, content, topics: generatedTopics, questions: generatedQuestions, isPublished: publish })
      router.push(`/lessons/${lessonId}`)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "flex h-10 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Yangi dars yaratish</h1>
        <div className="flex items-center gap-3 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${step > s ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : step === s ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                {step > s ? <Check className="w-3 h-3" /> : s}
              </div>
              <span className={`text-sm ${step === s ? 'font-medium' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {s === 1 ? 'Asosiy' : s === 2 ? 'Material' : 'Savollar'}
              </span>
              {s < 3 && <ChevronRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-5 rounded-[6px] border border-[hsl(var(--border))] p-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Dars sarlavhasi</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Masalan: Algebra: Chiziqli tenglamalar" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fan</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputClass}>
              <option value="">Fan tanlang</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tavsif <span className="text-[hsl(var(--muted-foreground))]">(ixtiyoriy)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Dars haqida qisqacha..." className="flex w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 resize-none transition-colors" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)} disabled={!title || !subjectId} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
              Davom etish
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-[6px] border border-[hsl(var(--border))] p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Darslik matni</label>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Matnni kiriting — AI savollar yaratadi</p>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={12}
              placeholder="Darslik matnini shu yerga kiriting yoki joylashtiring..."
              className="flex w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 resize-none font-mono transition-colors"
            />
            {content && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{content.length} ta belgi</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Orqaga
            </button>
            <button
              onClick={generateQuestions}
              disabled={!content.trim() || generating}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Savollar yaratilmoqda...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI yordamida savollar yaratish
                </>
              )}
            </button>
          </div>
          {generating && (
            <div className="rounded-[6px] border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/4 p-4">
              <div className="h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--primary))] rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Matn tahlil qilinmoqda va savollar yaratilmoqda...</p>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-[6px] border border-[hsl(var(--border))] p-5">
            <p className="text-sm font-medium mb-1">AI natijasi</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{generatedTopics.length} ta mavzu, {generatedQuestions.length} ta savol yaratildi</p>
          </div>
          <QuestionEditor topics={generatedTopics} questions={generatedQuestions} onTopicsChange={setGeneratedTopics} onQuestionsChange={setGeneratedQuestions} />
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Orqaga
            </button>
            <div className="flex gap-2">
              <button onClick={() => handleSave(false)} disabled={saving} className="h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors">
                Qoralama sifatida saqlash
              </button>
              <button onClick={() => handleSave(true)} disabled={saving} className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                E'lon qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
