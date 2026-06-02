import { NextRequest, NextResponse } from 'next/server'
import { generateQuestionsFromLesson } from '@edumind/ai'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json() as { content: string }
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI API key sozlanmagan' }, { status: 503 })
    }

    const result = await generateQuestionsFromLesson(content)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[generate-questions]', err)
    return NextResponse.json({ error: 'AI xizmat vaqtincha ishlamayapti' }, { status: 500 })
  }
}
