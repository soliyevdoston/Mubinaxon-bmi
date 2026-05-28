import { prisma } from '@edumind/database'
import { UsersTable } from '@/components/admin/users-table'
import { CreateUserModal } from '@/components/admin/create-user-modal'
import { Search } from 'lucide-react'

interface SearchParams {
  q?: string
  role?: string
  page?: string
}

const PAGE_SIZE = 50

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = parseInt(params.page ?? '1')
  const where = {
    ...(params.q ? {
      OR: [
        { fullName: { contains: params.q, mode: 'insensitive' as const } },
        { email: { contains: params.q, mode: 'insensitive' as const } },
      ]
    } : {}),
    ...(params.role && ['ADMIN', 'TEACHER', 'STUDENT'].includes(params.role)
      ? { role: params.role as 'ADMIN' | 'TEACHER' | 'STUDENT' }
      : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Foydalanuvchilar</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{total} ta foydalanuvchi</p>
        </div>
        <CreateUserModal />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Ism yoki email..."
              className="pl-9 flex h-9 w-full rounded-[6px] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/20"
            />
            <button type="submit" className="h-9 px-3 rounded-[6px] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--muted))] transition-colors flex-shrink-0">
              Qidirish
            </button>
          </form>
        </div>
        <form className="flex gap-1">
          {[{ value: '', label: 'Barchasi' }, { value: 'TEACHER', label: "O'qituvchi" }, { value: 'STUDENT', label: 'Talaba' }].map((f) => (
            <button
              key={f.value}
              type="submit"
              name="role"
              value={f.value}
              className={`h-9 px-3 rounded-[6px] text-sm font-medium transition-colors border ${
                params.role === f.value || (!params.role && !f.value)
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </form>
      </div>

      <UsersTable users={users} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[hsl(var(--muted-foreground))]">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(params.role ? { role: params.role } : {}), page: String(p) })}`}
                className={`w-8 h-8 flex items-center justify-center rounded-[6px] text-sm transition-colors ${
                  p === page
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
