import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `Ты — NeuralBrief, ИИ-ассистент, который помогает превратить разговор в техническое задание.

Стиль ответов:
- Только русский язык
- Очень кратко: 1–2 коротких предложения, максимум 200 символов
- Тон профессиональный, технический, без воды
- Один уточняющий вопрос за раз: цель, аудитория, функции, сроки, стек
- Никаких списков, маркдауна, эмодзи, заголовков
- Когда контекста достаточно (3–5 ответов пользователя), скажи: "Принято. Формирую ТЗ…" и кратко перечисли ключевые пункты одной строкой через запятую.

Ты задаёшь вопросы, чтобы быстро собрать минимально достаточный контекст для ТЗ.`

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 },
    )
  }

  try {
    const { messages }: { messages?: UIMessage[] } = await req.json()

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Request body must include messages array" },
        { status: 400 },
      )
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.6,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Groq error"

    return Response.json(
      { error: message },
      { status: 500 },
    )
  }
}
