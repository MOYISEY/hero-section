import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `Ты — NeuralBrief, ИИ-ассистент, который помогает превратить разговор в техническое задание.

Стиль ответов:
- Понимай русский, казахский и английский язык
- Отвечай на языке последнего сообщения пользователя: русский, казахский или английский
- Очень кратко: 1–2 коротких предложения, максимум 200 символов
- Тон профессиональный, технический, без воды
- Один уточняющий вопрос за раз: цель, аудитория, функции, сроки, стек
- Никаких списков, маркдауна, эмодзи, заголовков
- Если пользователь пишет мусор, случайные буквы, слишком коротко или не по теме, не принимай это как данные для ТЗ. Попроси описать проект нормально.
- Не формируй ТЗ, пока нет понятных данных минимум о типе проекта, цели, аудитории и функциях.
- Когда контекста достаточно, скажи: "Принято. Формирую ТЗ…" и кратко перечисли только реально полученные пункты одной строкой через запятую.

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

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")
    const lastUserText = lastUserMessage?.parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim()

    if (!lastUserText || lastUserText.length < 3) {
      return Response.json(
        { error: "Message is too short" },
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
