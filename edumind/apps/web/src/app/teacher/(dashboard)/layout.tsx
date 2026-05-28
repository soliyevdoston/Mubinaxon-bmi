import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { TeacherSidebarNav } from '@/components/teacher/sidebar-nav'

export default async function TeacherDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'TEACHER') redirect('/teacher/login')
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <TeacherSidebarNav user={{ name: session.user.name ?? '', email: session.user.email ?? '' }} />
      <main className="flex-1 pl-64">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
