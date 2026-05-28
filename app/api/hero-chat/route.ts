import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { extractRequirements, type SavedDialogMessage } from "@/lib/requirements"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `Ты — NeuralBrief, ИИ-аналитик требований. Твоя задача — провести живое интервью с клиентом и собрать данные для технического задания.

Принцип работы:
- Не просто отвечай на сообщение, а анализируй весь предыдущий диалог.
- Определи, какие данные уже есть: тип проекта, цель, аудитория, функции, дизайн, страницы, интеграции, сроки, ограничения.
- Если поле отсутствует или описано слишком расплывчато, задай один конкретный уточняющий вопрос именно про это поле.
- Если клиент дал много информации сразу, кратко подтверди, что понял, и задай следующий вопрос по самому важному отсутствующему полю.
- Если клиент отвечает неполно, не переходи дальше, уточни этот же пункт более конкретно.
- Не придумывай требования за клиента и не заполняй пробелы фантазией.
- Веди разговор как менеджер/бизнес-аналитик: дружелюбно, но по делу.

Порядок интервью:
1. Тип проекта и формат продукта.
2. Бизнес-цель и критерий успеха.
3. Целевая аудитория и роли пользователей.
4. Основной функционал MVP.
5. Страницы/разделы и пользовательские сценарии.
6. Дизайн, стиль, референсы.
7. Интеграции, данные, админка.
8. Сроки, ограничения, приоритеты.

Стиль ответа:
- Понимай русский, казахский и английский язык
- Отвечай на языке последнего сообщения пользователя: русский, казахский или английский
- Кратко: 1–3 предложения
- Тон профессиональный, технический, без воды
- В конце почти всегда должен быть один уточняющий вопрос, если ТЗ ещё не полно
- Никаких списков, маркдауна, эмодзи, заголовков
- Если пользователь пишет мусор, случайные буквы, слишком коротко или не по теме, не принимай это как данные для ТЗ. Попроси описать проект нормально.
- Не говори "формирую ТЗ", пока нет понятных данных минимум о типе проекта, цели, аудитории, функциях, дизайне и сроках.
- Когда контекста достаточно, скажи: "Принято. Данных достаточно для черновика ТЗ." и кратко перечисли реально полученные пункты одной строкой.

Ты должен вытаскивать информацию из клиента вопросами, а не ждать идеального заполнения формы.`

function getText(message: UIMessage): string {
  return message.parts
    ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim() || ""
}

function buildInterviewContext(messages: UIMessage[]) {
  const savedMessages: SavedDialogMessage[] = messages
    .map((message) => ({ role: message.role, text: getText(message) }))
    .filter((message) => message.text)
  const requirements = extractRequirements(savedMessages)
  const missing = requirements.missingFields

  return `Текущее состояние сбора требований:
- Тип проекта: ${requirements.projectType}
- Цель: ${requirements.goal}
- Аудитория: ${requirements.audience}
- Функционал: ${requirements.features.join("; ")}
- Дизайн: ${requirements.design}
- Страницы: ${requirements.pages.join("; ")}
- Интеграции: ${requirements.integrations.length ? requirements.integrations.join("; ") : "не указаны"}
- Сроки: ${requirements.deadline}
- Ограничения: ${requirements.constraints.length ? requirements.constraints.join("; ") : "не указаны"}
- Полнота: ${requirements.completeness}%
- Нужно уточнить дальше: ${missing.length ? missing.join(", ") : "критических пропусков нет"}

Сформулируй следующий ответ так, чтобы он продвигал интервью к заполнению недостающих данных.`
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 500 },
    )
  }

  const rateLimit = checkRateLimit(`hero-chat:${getClientIp(req)}`, 20, 60_000)

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many AI requests. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      },
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
    const lastUserText = lastUserMessage ? getText(lastUserMessage) : ""

    if (!lastUserText || lastUserText.length < 3) {
      return Response.json(
        { error: "Message is too short" },
        { status: 400 },
      )
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `${SYSTEM_PROMPT}\n\n${buildInterviewContext(messages)}`,
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
