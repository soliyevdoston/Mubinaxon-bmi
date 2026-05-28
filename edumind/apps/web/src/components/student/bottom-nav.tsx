'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/student/home',     label: 'Bosh sahifa', icon: Home },
  { href: '/student/history',  label: 'Tarix',       icon: History },
  { href: '/student/progress', label: 'Bilimim',     icon: TrendingUp },
  { href: '/student/profile',  label: 'Profil',      icon: User },
]

export function StudentBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{
        height: 68,
        background: 'hsl(236 48% 6% / 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid hsl(236 35% 14%)',
        boxShadow: '0 -4px 24px hsl(250 85% 68% / 0.08)',
      }}>
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 relative group"
            style={isActive ? { background: 'linear-gradient(135deg, hsl(170,60%,45%,0.15), hsl(200,75%,55%,0.1))' } : undefined}>
            <div className={cn('w-6 h-6 flex items-center justify-center transition-all duration-200',
              isActive ? 'scale-110' : 'opacity-50 group-hover:opacity-80 group-hover:scale-105')}>
              <Icon className="w-5 h-5" style={isActive ? { color: 'hsl(170,60%,55%)' } : { color: 'hsl(var(--muted-foreground))' }} />
            </div>
            <span className={cn('text-[10px] font-medium transition-colors', isActive ? '' : 'text-[hsl(var(--muted-foreground))]')}
              style={isActive ? { color: 'hsl(170,60%,55%)' } : {}}>
              {label}
            </span>
            {isActive && (
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(170,60%,50%), hsl(200,75%,55%))' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
