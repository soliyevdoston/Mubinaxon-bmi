'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, History, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/home', label: 'Bosh sahifa', icon: Home },
  { href: '/history', label: 'Tarix', icon: History },
  { href: '/progress', label: 'Bilimim', icon: TrendingUp },
  { href: '/profile', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] flex items-center justify-around px-4">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} className={cn('flex flex-col items-center gap-1 text-xs transition-colors', isActive ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]')}>
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
