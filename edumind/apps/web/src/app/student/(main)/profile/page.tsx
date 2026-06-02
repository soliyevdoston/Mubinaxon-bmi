import { auth } from '@/auth'
import { prisma } from '@edumind/database'
import { ProfileForm } from './profile-form'
import type { HeroClass } from '@/lib/heroes'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true, email: true, heroClass: true },
  })

  return (
    <ProfileForm
      name={user?.fullName ?? session.user.name ?? ''}
      email={user?.email ?? session.user.email ?? ''}
      heroClass={(user?.heroClass ?? null) as HeroClass | null}
    />
  )
}
