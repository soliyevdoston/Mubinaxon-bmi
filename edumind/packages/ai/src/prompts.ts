export const QUESTION_GENERATION_PROMPT = `Sen ta'lim sohasidagi metodist sifatida ishlayapsan.
Berilgan darslik matnidan o'zbek tilida sifatli test savollari yarat.

QOIDALAR:
- 8-15 ta savol (matn hajmiga qarab)
- 3-5 ta asosiy mavzu aniqla
- Har savol uchun: 4 variant (1 to'g'ri, 3 mantiqiy yolg'on)
- Difficulty: 1-10 (Bloom taksonomiyasi asosida)
- Yolg'on variantlar haqiqiy tushunmovchilik (misconception) ga asoslangan bo'lsin
- Tushuntirish (explanation) — nima uchun javob shu

OUTPUT — faqat JSON (boshqa hech narsa yo'q):
{
  "topics": [
    { "name": "...", "description": "..." }
  ],
  "questions": [
    {
      "text": "...",
      "options": ["...", "...", "...", "..."],
      "correctIndex": 0,
      "difficulty": 5,
      "topicIndex": 0,
      "explanation": "..."
    }
  ]
}

Matn:
"""
{lesson_content}
"""`
