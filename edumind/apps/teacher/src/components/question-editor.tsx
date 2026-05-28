'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

interface Topic { name: string; description: string }
interface Question { text: string; options: string[]; correctIndex: number; difficulty: number; topicIndex: number; explanation: string }

interface Props {
  topics: Topic[]
  questions: Question[]
  onTopicsChange: (t: Topic[]) => void
  onQuestionsChange: (q: Question[]) => void
}

export function QuestionEditor({ topics, questions, onTopicsChange, onQuestionsChange }: Props) {
  const [openTopics, setOpenTopics] = useState<number[]>([0])

  function toggleTopic(idx: number) {
    setOpenTopics(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
  }

  function updateQuestion(qIdx: number, field: keyof Question, value: string | number | string[]) {
    const updated = questions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q)
    onQuestionsChange(updated)
  }

  function deleteQuestion(qIdx: number) {
    onQuestionsChange(questions.filter((_, i) => i !== qIdx))
  }

  function addQuestion(topicIndex: number) {
    onQuestionsChange([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 5, topicIndex, explanation: '' }])
  }

  const inputClass = "flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 transition-colors"

  return (
    <div className="space-y-3">
      {topics.map((topic, tIdx) => {
        const topicQuestions = questions.map((q, qIdx) => ({ q, qIdx })).filter(({ q }) => q.topicIndex === tIdx)
        const isOpen = openTopics.includes(tIdx)
        return (
          <div key={tIdx} className="rounded-[6px] border border-[hsl(var(--border))]">
            <button onClick={() => toggleTopic(tIdx)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[hsl(var(--muted))]/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{topic.name}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-[4px]">{topicQuestions.length} savol</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /> : <ChevronDown className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
            </button>
            {isOpen && (
              <div className="border-t border-[hsl(var(--border))] p-4 space-y-4">
                {topicQuestions.map(({ q, qIdx }) => (
                  <div key={qIdx} className="rounded-[6px] border border-[hsl(var(--border))] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Savol matni</label>
                        <textarea value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} rows={2} className="flex w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 resize-none transition-colors" />
                      </div>
                      <button onClick={() => deleteQuestion(qIdx)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--destructive))]/5 hover:text-[hsl(var(--destructive))] transition-colors mt-5 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${qIdx}`} checked={q.correctIndex === oIdx} onChange={() => updateQuestion(qIdx, 'correctIndex', oIdx)} className="accent-[hsl(var(--primary))]" />
                          <input value={opt} onChange={e => { const opts = [...q.options]; opts[oIdx] = e.target.value; updateQuestion(qIdx, 'options', opts) }} placeholder={`Variant ${oIdx + 1}`} className={inputClass} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Qiyinlik:</label>
                        <input type="range" min={1} max={10} value={q.difficulty} onChange={e => updateQuestion(qIdx, 'difficulty', parseInt(e.target.value))} className="w-24 accent-[hsl(var(--primary))]" />
                        <span className="text-xs font-mono w-4">{q.difficulty}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Tushuntirish</label>
                      <input value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                ))}
                <button onClick={() => addQuestion(tIdx)} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                  <Plus className="w-4 h-4" />
                  Savol qo'shish
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
