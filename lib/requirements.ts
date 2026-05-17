export type SavedDialogMessage = {
  role: string
  text: string
}

export type StructuredRequirements = {
  projectType: string
  goal: string
  audience: string
  features: string[]
  design: string
  pages: string[]
  integrations: string[]
  deadline: string
  constraints: string[]
  missingFields: string[]
  completeness: number
}

const projectKeywords = [
  "crm",
  "сайт",
  "лендинг",
  "магазин",
  "интернет-магазин",
  "приложение",
  "платформ",
  "сервис",
  "дашборд",
  "портал",
]

const designKeywords = [
  "дизайн",
  "стиль",
  "цвет",
  "палитр",
  "минимал",
  "тёмн",
  "светл",
  "современ",
  "ui",
  "ux",
]

const audienceKeywords = ["для", "клиент", "пользовател", "аудитор", "сотрудник", "менеджер", "админ", "студент"]
const deadlineKeywords = ["день", "недел", "месяц", "срок", "дедлайн", "до ", "mvp"]
const integrationKeywords = ["api", "github", "telegram", "whatsapp", "оплат", "email", "sms", "интеграц", "crm"]
const featureKeywords = ["авторизац", "регистрац", "личный кабинет", "уведомлен", "задач", "заявк", "заявок", "чат", "поиск", "фильтр", "оплат", "админ", "экспорт"]
const pageKeywords = ["главная", "профиль", "кабинет", "админ", "дашборд", "каталог", "карточка", "форма", "форму", "страниц"]

function normalize(text: string) {
  return text.toLowerCase().replace(/ё/g, "е")
}

function sentences(text: string) {
  return text
    .replace(/\b(0?[1-9]|1[0-2])\s+([А-ЯA-ZЁ][а-яa-zё]+)/g, "\n$1 $2")
    .split(/[\n.!?;]/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^(0?[1-9]|1[0-2])\s+/, ""))
    .filter((item) => item.length > 6)
}

function sectionValue(text: string, labels: string[]) {
  if (!/(\n|^)\s*0?\d\s+/.test(text) && !/[:—-]/.test(text)) return ""

  const normalizedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const labelPattern = normalizedLabels.join("|")
  const match = text.match(new RegExp(`(?:^|\\n|\\s)(?:0?\\d\\s+)?(?:${labelPattern})\\s*[:—-]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:0?\\d\\s+)?[А-ЯA-ZЁ][а-яa-zё\\s]{2,25}\\s*[:—-]?|$)`, "i"))
  return match?.[1]?.trim() || ""
}

function findFirstByKeywords(items: string[], keywords: string[]) {
  return items.find((item) => keywords.some((keyword) => normalize(item).includes(keyword))) || ""
}

function findListByKeywords(items: string[], keywords: string[], fallbackFromCommas = false) {
  const matches = items.filter((item) => keywords.some((keyword) => normalize(item).includes(keyword)))
  if (matches.length || !fallbackFromCommas) return matches.slice(0, 8)

  return items
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 6)
    .slice(0, 8)
}

function findDeadline(items: string[]) {
  return items.find((item) => /(день|дней|недел|месяц|срок|дедлайн|mvp|до\s+\d|до\s+[а-яa-z])/i.test(normalize(item))) || ""
}

export function extractRequirements(messages: SavedDialogMessage[]): StructuredRequirements {
  const userMessages = messages.filter((message) => message.role === "user" && message.text.trim())
  const userText = userMessages.map((message) => message.text).join(". ")
  const items = sentences(userText)

  const projectType = sectionValue(userText, ["тип проекта", "проект"]) || findFirstByKeywords(items, projectKeywords)
  const goal = sectionValue(userText, ["цели", "цель", "задача", "задачи"]) || findFirstByKeywords(items, ["цель", "нужно", "хочу", "задач", "чтобы", "автоматиз"])
  const audience = sectionValue(userText, ["аудитория", "целевая аудитория", "для кого"]) || findFirstByKeywords(items, audienceKeywords)
  const features = findListByKeywords(items, featureKeywords)
  const design = findFirstByKeywords(items, designKeywords)
  const pages = findListByKeywords(items, pageKeywords)
  const integrations = findListByKeywords(items, integrationKeywords)
  const deadline = findDeadline(items)
  const constraints = findListByKeywords(items, ["нельзя", "огранич", "без ", "только", "обяз", "безопас", "конфиденц"])

  const requiredFields = [
    { key: "projectType", label: "тип проекта", value: projectType },
    { key: "goal", label: "цель проекта", value: goal },
    { key: "audience", label: "целевая аудитория", value: audience },
    { key: "features", label: "ключевой функционал", value: features.length ? features.join(" ") : "" },
    { key: "design", label: "дизайн и стиль", value: design },
    { key: "deadline", label: "сроки", value: deadline },
  ]

  const missingFields = requiredFields.filter((field) => !field.value).map((field) => field.label)
  const completeness = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)

  return {
    projectType: projectType || "Тип проекта не определён",
    goal: goal || "Цель проекта требует уточнения",
    audience: audience || "Целевая аудитория требует уточнения",
    features: features.length ? features : ["Функциональные требования требуют уточнения"],
    design: design || "Дизайн-предпочтения требуют уточнения",
    pages: pages.length ? pages : ["Структура страниц требует уточнения"],
    integrations,
    deadline: deadline || "Сроки требуют уточнения",
    constraints,
    missingFields,
    completeness,
  }
}
