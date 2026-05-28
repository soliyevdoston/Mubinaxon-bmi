import { auth } from '@/auth'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null
  return <SettingsForm name={session.user.name ?? ''} email={session.user.email ?? ''} />
}
