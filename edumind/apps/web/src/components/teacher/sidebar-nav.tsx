'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, BookOpen, Radio, Users, BarChart3, Settings, LogOut, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/teacher/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/teacher/lessons',   label: 'Darslar',     icon: BookOpen },
  { href: '/teacher/sessions',  label: 'Sessiyalar',  icon: Radio },
  { href: '/teacher/students',  label: 'Talabalar',   icon: Users },
  { href: '/teacher/analytics', label: 'Analitika',   icon: BarChart3 },
  { href: '/teacher/settings',  label: 'Sozlamalar',  icon: Settings },
]

export function TeacherSidebarNav({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname()
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T'

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{ background: 'hsl(236 48% 6% / 0.95)', backdropFilter: 'blur(24px)', borderRight: '1px solid hsl(236 35% 14%)', boxShadow: '4px 0 24px hsl(220 85% 65% / 0.06)' }}>

      <div className="px-5 py-5" style={{ borderBottom: '1px solid hsl(236 35% 14%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">EduMind</span>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] -mt-0.5">O&apos;qituvchi</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                isActive ? 'font-medium text-white' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]')}
              style={isActive ? { background: 'linear-gradient(135deg, hsl(220,85%,60%,0.2), hsl(250,80%,65%,0.12))', boxShadow: 'inset 0 0 0 1px hsl(220 85% 60% / 0.2)' } : undefined}>
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all', isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100')}
                style={isActive ? { background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))' } : { background: 'hsl(236 42% 12%)' }}>
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: 'white' } : {}} />
              </div>
              {label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, hsl(220,85%,70%), hsl(250,80%,70%))' }} />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid hsl(236 35% 14%)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: 'hsl(236 42% 10%)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(220,85%,60%), hsl(250,80%,65%))' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/teacher/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[hsl(var(--muted-foreground))] transition-all hover:text-red-400 hover:bg-red-500/8 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[hsl(236_42%_12%)] group-hover:bg-red-500/10 transition-all">
            <LogOut className="w-3.5 h-3.5" />
          </div>
          Chiqish
        </button>
      </div>
    </aside>
  )
}
