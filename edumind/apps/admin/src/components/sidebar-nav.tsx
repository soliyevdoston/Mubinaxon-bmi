'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, BookOpen, BookMarked, Radio, Settings, LogOut, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',  label: 'Bosh sahifa',        icon: LayoutDashboard },
  { href: '/users',      label: 'Foydalanuvchilar',    icon: Users },
  { href: '/subjects',   label: 'Fanlar',              icon: BookMarked },
  { href: '/lessons',    label: 'Darslar',             icon: BookOpen },
  { href: '/sessions',   label: 'Sessiyalar',          icon: Radio },
  { href: '/settings',   label: 'Sozlamalar',          icon: Settings },
]

interface SidebarNavProps {
  user: { name: string; email: string }
}

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname()
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A'

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background: 'hsl(236 48% 6% / 0.95)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid hsl(236 35% 14%)',
        boxShadow: '4px 0 24px hsl(250 85% 68% / 0.06)',
      }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid hsl(236 35% 14%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">EduMind</span>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] -mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                isActive
                  ? 'font-medium text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, hsl(250,85%,65%,0.2), hsl(280,75%,65%,0.12))',
                boxShadow: 'inset 0 0 0 1px hsl(250 85% 65% / 0.2)',
              } : undefined}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
              )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))',
                } : { background: 'hsl(236 42% 12%)' }}>
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: 'white' } : {}} />
              </div>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, hsl(250,85%,70%), hsl(280,75%,70%))' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid hsl(236 35% 14%)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: 'hsl(236 42% 10%)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(250,85%,65%), hsl(280,75%,65%))' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[hsl(var(--muted-foreground))] transition-all hover:text-red-400 hover:bg-red-500/8 group"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all bg-[hsl(236_42%_12%)] group-hover:bg-red-500/10">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Chiqish
        </button>
      </div>
    </aside>
  )
}
