'use server'
import { prisma } from '@edumind/database'
import { revalidatePath } from 'next/cache'

export async function getConfig(key: string): Promise<string | null> {
  const row = await prisma.systemConfig.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function setConfig(key: string, value: string) {
  await prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  revalidatePath('/settings')
}

export async function getDefaultTime(): Promise<number> {
  const val = await getConfig('defaultTimePerQuestion')
  return val ? parseInt(val) : 30
}

export async function setDefaultTime(seconds: number) {
  await setConfig('defaultTimePerQuestion', String(seconds))
}

export async function updateApiKey(formData: FormData) {
  const key = formData.get('apiKey') as string
  if (!key?.startsWith('sk-ant-')) {
    return { error: "API kalit 'sk-ant-' bilan boshlanishi kerak" }
  }
  await setConfig('anthropicApiKey', key)
}

export async function getSystemStats() {
  const [userCount, lessonCount, sessionCount, activeCount] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.quizSession.count(),
    prisma.quizSession.count({ where: { status: 'ACTIVE' } }),
  ])
  return { userCount, lessonCount, sessionCount, activeCount }
}
