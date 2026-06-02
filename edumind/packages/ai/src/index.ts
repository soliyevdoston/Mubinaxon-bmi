import OpenAI from 'openai'
import type { AIGenerationResult } from '@edumind/types'
import { QUESTION_GENERATION_PROMPT } from './prompts'

let clientInstance: OpenAI | null = null

function getClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL, // Railway proxy uchun (ixtiyoriy)
    })
  }
  return clientInstance
}

export async function generateQuestionsFromLesson(
  lessonContent: string
): Promise<AIGenerationResult> {
  const client = getClient()

  const prompt = QUESTION_GENERATION_PROMPT.replace('{lesson_content}', lessonContent)

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: "Sen ta'lim metodisti sifatida savol yaratasanda faqat to'g'ri JSON formatida javob berasan.",
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const text = response.choices[0]?.message?.content
  if (!text) {
    throw new Error('AI javob bermadi')
  }

  const result = JSON.parse(text) as AIGenerationResult
  return result
}

export { QUESTION_GENERATION_PROMPT }
