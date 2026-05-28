'use client'
import { useState } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, Shield, GraduationCap, BookOpen, Ban, CheckCircle2 } from 'lucide-react'
import { deleteUser, toggleUserBlock } from '@/actions/users'
import type { User } from '@edumind/database'

const roleLabel: Record<string, { label: string; icon: typeof Shield }> = {
  ADMIN: { label: 'Admin', icon: Shield },
  TEACHER: { label: "O'qituvchi", icon: BookOpen },
  STUDENT: { label: 'Talaba', icon: GraduationCap },
}

export function UsersTable({ users }: { users: User[] }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  if (users.length === 0) {
    return (
      <div className="rounded-[6px] border border-[hsl(var(--border))] p-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Foydalanuvchilar topilmadi</p>
      </div>
    )
  }

  return (
    <div className="rounded-[6px] border border-[hsl(var(--border))] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
            <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Ism</th>
            <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Rol</th>
            <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Holat</th>
            <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Ro'yxatdan o'tgan</th>
            <th className="text-left font-medium px-4 py-3 text-[hsl(var(--muted-foreground))]">Oxirgi faollik</th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const role = roleLabel[user.role]
            const RoleIcon = role?.icon ?? Shield
            return (
              <tr key={user.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-[4px] border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50">
                    <RoleIcon className="w-3 h-3" />
                    {role?.label ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isBlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[4px] border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]">
                      <Ban className="w-3 h-3" /> Bloklangan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[4px] border border-[hsl(155_60%_45%/0.3)] bg-[hsl(155_60%_45%/0.08)] text-[hsl(155,60%,55%)]">
                      <CheckCircle2 className="w-3 h-3" /> Faol
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                  {format(user.createdAt, 'dd.MM.yyyy')}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                  {user.lastSeenAt ? format(user.lastSeenAt, 'dd.MM.yyyy HH:mm') : '—'}
                </td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {openMenu === user.id && (
                    <div className="absolute right-2 top-10 z-10 w-48 rounded-[6px] border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-sm py-1">
                      <form action={toggleUserBlock.bind(null, user.id)}>
                        <button type="submit" className="w-full text-left px-3 py-1.5 text-sm hover:bg-[hsl(var(--muted))] transition-colors flex items-center gap-2">
                          {user.isBlocked ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 text-[hsl(155,60%,55%)]" /> Blokdan chiqarish</>
                          ) : (
                            <><Ban className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" /> Bloklash</>
                          )}
                        </button>
                      </form>
                      <form action={deleteUser.bind(null, user.id)}>
                        <button type="submit" className="w-full text-left px-3 py-1.5 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/5 transition-colors">
                          O'chirish
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
