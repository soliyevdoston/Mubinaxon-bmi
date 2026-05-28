import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <SidebarNav user={session.user} />
      <main className="flex-1 pl-64">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
