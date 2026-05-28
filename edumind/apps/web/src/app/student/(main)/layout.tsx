import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { StudentBottomNav } from '@/components/student/bottom-nav'

export default async function StudentMainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'STUDENT') redirect('/student/login')
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-16">
      <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
      <StudentBottomNav />
    </div>
  )
}
