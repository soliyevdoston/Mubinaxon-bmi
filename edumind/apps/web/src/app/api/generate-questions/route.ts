import { NextRequest, NextResponse } from 'next/server'
import { generateQuestionsFromLesson } from '@edumind/ai'

export async function POST(req: NextRequest) {
  const { content } = await req.json() as { content: string }
  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  const result = await generateQuestionsFromLesson(content)
  return NextResponse.json(result)
}
