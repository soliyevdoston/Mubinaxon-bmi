import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebarNav } from '@/components/admin/sidebar-nav'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <AdminSidebarNav user={session.user} />
      <main className="flex-1 pl-64">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
