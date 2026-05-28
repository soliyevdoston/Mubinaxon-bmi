import { auth } from '@/auth'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) return null
  return <ProfileForm name={session.user.name ?? ''} email={session.user.email ?? ''} />
}
