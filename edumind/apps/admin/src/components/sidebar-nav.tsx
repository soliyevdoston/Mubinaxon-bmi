'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookMarked,
  Radio,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/subjects', label: 'Fanlar', icon: BookMarked },
  { href: '/lessons', label: 'Darslar', icon: BookOpen },
  { href: '/sessions', label: 'Sessiyalar', icon: Radio },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
]

interface SidebarNavProps {
  user: { name: string; email: string }
}

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] flex flex-col">
      <div className="px-6 py-5 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-[hsl(var(--primary))] flex-shrink-0" />
          <span className="font-semibold text-sm tracking-tight">EduMind Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--primary))]/8 text-[hsl(var(--primary))] font-medium'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-[hsl(var(--primary))]' : '')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[hsl(var(--border))]">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </aside>
  )
}
