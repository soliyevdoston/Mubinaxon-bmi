'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, BookMarked } from 'lucide-react'
import { createSubject, updateSubject, deleteSubject } from '@/actions/admin/subjects'

interface Subject {
  id: string; name: string; slug: string; description: string | null
  _count: { lessons: number }
}

export function SubjectsManager({ subjects }: { subjects: Subject[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id); setName(subject.name); setDescription(subject.description ?? ''); setShowForm(true)
  }

  function resetForm() {
    setShowForm(false); setEditingId(null); setName(''); setDescription('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-[6px] border border-[hsl(var(--border))] p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-[6px] bg-[hsl(var(--muted))] flex items-center justify-center">
                <BookMarked className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(subject)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--muted))] transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteSubject(subject.id)} className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--destructive))]/5 hover:text-[hsl(var(--destructive))] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="font-medium text-sm">{subject.name}</p>
            {subject.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{subject.description}</p>}
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">{subject._count.lessons} ta dars</p>
          </div>
        ))}
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="rounded-[6px] border border-dashed border-[hsl(var(--border))] p-4 flex flex-col items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors min-h-[120px]">
          <Plus className="w-5 h-5" />
          <span className="text-sm">Yangi fan</span>
        </button>
      </div>

      {showForm && (
        <div className="rounded-[6px] border border-[hsl(var(--border))] p-5">
          <h3 className="text-sm font-semibold mb-4">{editingId ? 'Fanni tahrirlash' : 'Yangi fan'}</h3>
          <form action={async (fd) => {
            if (editingId) { fd.append('id', editingId); await updateSubject(fd) } else { await createSubject(fd) }
            resetForm()
          }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Fan nomi</label>
                <input name="name" value={name} onChange={(e) => setName(e.target.value)} required
                  className="flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Slug</label>
                <input readOnly value={slugify(name)}
                  className="flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 text-sm text-[hsl(var(--muted-foreground))]" />
                <input type="hidden" name="slug" value={slugify(name)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Tavsif (ixtiyoriy)</label>
              <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="flex w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="h-9 px-4 rounded-[6px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors">Saqlash</button>
              <button type="button" onClick={resetForm} className="h-9 px-4 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
