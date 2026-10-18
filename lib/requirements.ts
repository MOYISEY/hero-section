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
  language: string
  openQuestions: string[]
  leadForm: {
    fields: string[]
    delivery: string
    confirmation: boolean
    mobile: boolean
  } | null
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

const audienceKeywords = ["для", "пользовател", "аудитор", "сотрудник", "менеджер", "админ", "студент", "родител", "покупател", "посетител", "ученик"]
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
  const normalizedLabels = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const labelPattern = normalizedLabels.join("|")
  // A section label must start a line and have an explicit delimiter. An
  // instruction such as “В ТЗ отразите цель и границы” is not a goal section.
  const pattern = new RegExp(`^\\s*(?:0?\\d+[.)]?\\s+)?(?:${labelPattern})\\s*[:—-]\\s*(.+)$`, "i")
  const lines = text.split(/\r?\n/)
  for (const line of [...lines].reverse()) {
    const value = line.match(pattern)?.[1]?.trim()
    if (value) return value
  }
  return ""
}

export function isUnresolved(value: string) {
  return !value || /неизвест|не\s+(?:задан|определ[её]н|согласован|предоставлен|выбран|указан|реш[её]н)|требу(?:ет|ют|ется|ются)\s+уточнен|\btbd\b/i.test(value)
}

function isInstruction(value: string) {
  return /^(?:нужно\s+подготовить\s+(?:первую\s+версию\s+)?(?:техническ|тз)|в\s+(?:тз|документе)\s+(?:отразите|укажите|опишите)|сформируйте|несогласованные\s+предложения|недостающие\s+сведения|нужны\s+вопросы\s+заказчику)/i.test(value)
}

function unique(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))]
}

function latestByKeywords(items: string[], keywords: string[]) {
  return findFirstByKeywords([...items].reverse(), keywords)
}

function findAudience(text: string, items: string[]) {
  const labelled = sectionValue(text, ["целевая аудитория", "аудитория", "для кого"])
  if (labelled) return labelled

  // The person commissioning a site is not necessarily its audience.
  const leadAudience = [...items].reverse().find((item) => /заяв(?:ки|ок)\s+от\s+/i.test(item))
  const recipients = leadAudience?.match(/заяв(?:ки|ок)\s+от\s+(.+)$/i)?.[1]
  if (recipients) return recipients.trim()
  return findFirstByKeywords(items.filter((item) => !/^клиент\s*[:—-]/i.test(item)), audienceKeywords)
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
  const userText = userMessages.map((message) => message.text).join("\n")
  const items = sentences(userText).filter((item) => !isInstruction(item))
  const facts = items.filter((item) => !isUnresolved(item))
  const factText = facts.join("\n")

  const projectType = sectionValue(userText, ["тип проекта", "проект"]) || findFirstByKeywords(facts, projectKeywords)
  const businessGoal = facts.find((item) => /для\s+(?:получения|сбора)\s+заявок|нужны\s+заявки|цель\s|чтобы\s|автоматиз/i.test(item))
  const goal = sectionValue(userText, ["цели", "цель", "задача", "задачи"]) || businessGoal || findFirstByKeywords(facts, ["цель", "нужно", "хочу", "задач", "чтобы", "автоматиз"])
  const audience = findAudience(userText, facts)
  const mandatory = facts.flatMap((item) => {
    const list = item.match(/^(?:обязательные\s+требования|обязательно|нужны\s+блоки|функции)\s*:\s*(.+)$/i)?.[1]
    return list ? list.split(",").map((part) => part.trim()) : []
  })
  const features = unique([...mandatory, ...findListByKeywords(facts.filter((item) => !/^обязательные\s+требования\s*:/i.test(item)), featureKeywords)])
  const design = latestByKeywords(items, designKeywords)
  const pages = unique([...findListByKeywords(facts, pageKeywords), ...mandatory.filter((item) => /программ|формат|форма|мобильн/i.test(item))])
  const integrations = findListByKeywords(facts, integrationKeywords)
  const deadline = findDeadline([...items].reverse())
  const constraints = findListByKeywords(items, ["нельзя", "огранич", "без ", "только", "обяз", "безопас", "конфиденц"])
  const language = /на\s+русском|русский\s+язык/i.test(factText) ? "Русский" : "Язык материалов требует уточнения"

  const hasLeadForm = /форм[аыуе]\s+(?:с\s+)?(?:имен|имя|контакт)|форм[аыуе]\s+заяв/i.test(factText)
  const deliveryStatement = hasLeadForm ? [...items].reverse().find((item) => /^(?:получатель и канал доставки|доставка заявки|получатель заявки)\s*[:—-]/i.test(item) || /канал доставки заявки|получатель заявки/i.test(item) || /(?:заяв|форм|данн).*(?:отправля|передава|доставля|получа)/i.test(item) && /@|telegram|whatsapp|crm|почт|api/i.test(item)) : undefined
  const delivery = deliveryStatement?.replace(/^(?:получатель и канал доставки|доставка заявки|получатель заявки)\s*[:—-]\s*/i, "") || ""
  const leadForm = hasLeadForm ? {
    fields: unique([
      ...(/имя|именем|имени/i.test(factText) ? ["Имя"] : []),
      ...(/телефон/i.test(factText) ? ["Телефон"] : []),
      ...(/e-?mail|электронн.{0,12}почт/i.test(factText) ? ["Email"] : []),
      ...(/контакт/i.test(factText) && !/телефон|e-?mail/i.test(factText) ? ["Контакт (тип требует уточнения)"] : []),
    ]),
    delivery,
    confirmation: /подтверждени[ея]\s+(?:успешной\s+)?отправки/i.test(factText),
    mobile: /мобильн|адаптивн/i.test(factText),
  } : null

  const requiredFields = [
    { key: "projectType", label: "тип проекта", value: projectType },
    { key: "goal", label: "цель проекта", value: goal },
    { key: "audience", label: "целевая аудитория", value: audience },
    { key: "features", label: "ключевой функционал", value: features.length ? features.join(" ") : "" },
    { key: "design", label: "дизайн и стиль", value: design },
    { key: "deadline", label: "сроки", value: deadline },
    ...(leadForm ? [{ key: "delivery", label: "получатель и канал доставки заявки", value: delivery }] : []),
  ]

  const missingFields = requiredFields.filter((field) => isUnresolved(field.value)).map((field) => field.label)
  const completeness = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100)
  const openQuestions = unique([
    ...(leadForm && isUnresolved(delivery) ? ["Кто получает заявку, по какому каналу она передаётся и как проверяется получение?"] : []),
    ...(leadForm?.fields.some((field) => field.includes("тип требует")) ? ["Какой контакт собирать и какие правила проверки полей формы согласованы?"] : []),
    ...(/программ|материал|контент/i.test(factText) && !/материалы\s+(?:готовит|предоставляет)|тексты\s+(?:готовит|предоставляет)/i.test(factText) ? ["Кто предоставляет и утверждает содержание программы и остальные материалы? Что уже готово?"] : []),
    ...missingFields.filter((field) => field !== "получатель и канал доставки заявки").map((field) => `Нужно уточнить: ${field}.`),
    ...items.filter((item) => isUnresolved(item)).map((item) => `Уточнить у заказчика: ${item}.`),
  ])

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
    language,
    openQuestions,
    leadForm,
  }
}
