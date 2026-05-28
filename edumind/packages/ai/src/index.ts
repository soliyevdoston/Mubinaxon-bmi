import Anthropic from '@anthropic-ai/sdk'
import type { AIGenerationResult } from '@edumind/types'
import { QUESTION_GENERATION_PROMPT } from './prompts'

let clientInstance: Anthropic | null = null

function getClient(): Anthropic {
  if (!clientInstance) {
    clientInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return clientInstance
}

export async function generateQuestionsFromLesson(
  lessonContent: string
): Promise<AIGenerationResult> {
  const client = getClient()

  const prompt = QUESTION_GENERATION_PROMPT.replace('{lesson_content}', lessonContent)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system:
      "Sen ta'lim metodisti sifatida savol yaratasanda faqat to'g'ri JSON formatida javob berasan.",
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('AI javob bermadi')
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("AI noto'g'ri format qaytardi")
  }

  const result = JSON.parse(jsonMatch[0]) as AIGenerationResult
  return result
}

export { QUESTION_GENERATION_PROMPT }
