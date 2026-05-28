import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-16">
      <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
      <BottomNav />
    </div>
  )
}
