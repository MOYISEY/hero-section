import { describe, expect, it } from "vitest"
import { extractRequirements, type SavedDialogMessage } from "@/lib/requirements"
import { hashPassword, isRole, verifyPassword, roles } from "@/lib/auth"

function user(text: string): SavedDialogMessage[] {
  return [{ role: "user", text }]
}

const featureCases = [
  ["Нужна авторизация пользователей", "авторизац"],
  ["Добавить регистрацию клиентов", "регистрац"],
  ["Нужен личный кабинет", "личный кабинет"],
  ["Система должна отправлять уведомления", "уведомлен"],
  ["Нужен модуль задач", "задач"],
  ["Менеджер должен видеть заявки", "заявк"],
  ["Нужен чат с клиентом", "чат"],
  ["Добавить поиск по проектам", "поиск"],
  ["Нужны фильтры по статусам", "фильтр"],
  ["Добавить оплату тарифа", "оплат"],
  ["Нужна админ панель", "админ"],
  ["Сделать экспорт отчета", "экспорт"],
  ["CRM должна иметь авторизацию", "авторизац"],
  ["Портал должен иметь регистрацию", "регистрац"],
  ["В кабинете нужны уведомления", "уведомлен"],
  ["Добавить управление задачами", "задач"],
  ["Нужна обработка заявок", "заявок"],
  ["В приложении нужен чат", "чат"],
  ["Нужен поиск клиентов", "поиск"],
  ["Нужен фильтр задач", "фильтр"],
  ["Интернет-магазин должен иметь оплату", "оплат"],
  ["Админ должен управлять пользователями", "админ"],
  ["Экспортировать ТЗ в PDF", "экспорт"],
  ["Личный кабинет клиента", "личный кабинет"],
  ["Уведомления менеджеру", "уведомлен"],
  ["Заявки от клиента", "заявк"],
  ["Чат поддержки", "чат"],
  ["Поиск по каталогу", "поиск"],
  ["Фильтр товаров", "фильтр"],
  ["Оплата заказа", "оплат"],
]

const projectCases = [
  ["Нужна CRM для менеджеров", "crm"],
  ["Хочу сайт для компании", "сайт"],
  ["Нужен лендинг для курса", "лендинг"],
  ["Сделать интернет-магазин одежды", "интернет-магазин"],
  ["Нужно веб приложение для задач", "приложение"],
  ["Создать платформу обучения", "платформу"],
  ["Нужен сервис бронирования", "сервис"],
  ["Сделать дашборд аналитики", "дашборд"],
  ["Нужен портал для студентов", "портал"],
  ["Магазин цифровых товаров", "магазин"],
  ["CRM система для продаж", "crm"],
  ["Корпоративный сайт", "сайт"],
  ["Промо лендинг", "лендинг"],
  ["Веб сервис заявок", "сервис"],
  ["Админ дашборд", "дашборд"],
]

const audienceCases = [
  "для клиентов компании",
  "для пользователей мобильного сервиса",
  "целевая аудитория студенты",
  "для сотрудников отдела продаж",
  "для менеджеров и админов",
  "для клиентов интернет-магазина",
  "для пользователей CRM",
  "для сотрудников университета",
  "для админов платформы",
  "для студентов колледжа",
]

const designCases = [
  "дизайн должен быть темный",
  "стиль минималистичный",
  "цвет основной синий",
  "палитра cyan и dark blue",
  "нужен современный ui",
  "важен хороший ux",
  "светлый дизайн",
  "минималистичный стиль",
  "темная палитра",
  "современный дизайн",
]

const pageCases = [
  "нужна главная страница",
  "добавить профиль пользователя",
  "нужен личный кабинет",
  "сделать админ страницу",
  "нужен дашборд менеджера",
  "сделать каталог товаров",
  "нужна карточка проекта",
  "добавить форму заявки",
  "страница аналитики",
  "кабинет клиента",
]

const integrationCases = [
  "интеграция с api платежей",
  "подключить github",
  "уведомления в telegram",
  "связь с whatsapp",
  "нужна оплата картой",
  "email рассылка",
  "sms уведомления",
  "интеграция с CRM",
  "подключить внешний api",
  "github repository",
]

const deadlineCases = [
  "срок 2 недели",
  "сделать за 10 дней",
  "дедлайн до июня",
  "mvp за месяц",
  "нужен срок месяц",
  "готово через неделю",
  "до 15 мая",
  "сроки 3 недели",
  "за один месяц",
  "дедлайн через 20 дней",
]

const constraintCases = [
  "нельзя хранить пароль открыто",
  "ограничение только для менеджера",
  "без лишних демо данных",
  "обязательно проверить безопасность",
  "конфиденциальность данных клиента",
  "только назначенный разработчик",
  "без публичного api ключа",
  "обязательная авторизация",
  "ограничить доступ по ролям",
  "безопасное хранение данных",
]

describe("extractRequirements", () => {
  it.each(featureCases)("extracts feature from %s", (text, expected) => {
    expect(extractRequirements(user(text)).features.join(" ").toLowerCase()).toContain(expected)
  })

  it.each(projectCases)("detects project type from %s", (text, expected) => {
    expect(extractRequirements(user(text)).projectType.toLowerCase()).toContain(expected)
  })

  it.each(audienceCases)("detects audience from %s", (text) => {
    expect(extractRequirements(user(text)).audience).toBe(text)
  })

  it.each(designCases)("detects design preference from %s", (text) => {
    expect(extractRequirements(user(text)).design).toBe(text)
  })

  it.each(pageCases)("detects page structure from %s", (text) => {
    expect(extractRequirements(user(text)).pages).toContain(text)
  })

  it.each(integrationCases)("detects integration from %s", (text) => {
    expect(extractRequirements(user(text)).integrations).toContain(text)
  })

  it.each(deadlineCases)("detects deadline from %s", (text) => {
    expect(extractRequirements(user(text)).deadline).toBe(text)
  })

  it.each(constraintCases)("detects constraint from %s", (text) => {
    expect(extractRequirements(user(text)).constraints).toContain(text)
  })

  it.each([
    ["CRM для менеджеров. Цель автоматизировать заявки. Для сотрудников. Нужна авторизация. Дизайн темный. Срок 2 недели", 100],
    ["CRM для менеджеров. Цель автоматизировать заявки. Для сотрудников. Нужна авторизация. Дизайн темный", 83],
    ["CRM для менеджеров. Цель автоматизировать заявки. Для сотрудников. Нужна авторизация", 67],
    ["CRM для менеджеров. Цель автоматизировать заявки. Для сотрудников", 67],
    ["CRM для менеджеров. Цель автоматизировать заявки", 67],
    ["CRM для менеджеров", 33],
    ["", 0],
    ["Нужна авторизация и уведомления", 17],
    ["Для клиентов нужен каталог", 17],
    ["Дизайн темный и срок 2 недели", 33],
  ])("calculates completeness for %s", (text, expected) => {
    expect(extractRequirements(user(text)).completeness).toBe(expected)
  })

  it.each([
    ["CRM для менеджеров", "цель проекта"],
    ["Цель автоматизировать заявки", "тип проекта"],
    ["Для сотрудников", "тип проекта"],
    ["Нужна авторизация", "тип проекта"],
    ["Дизайн темный", "тип проекта"],
    ["Срок 2 недели", "тип проекта"],
    ["CRM для менеджеров. Цель автоматизировать заявки", "дизайн и стиль"],
    ["CRM для менеджеров. Для сотрудников", "цель проекта"],
    ["CRM для менеджеров. Нужна авторизация", "цель проекта"],
    ["CRM для менеджеров. Дизайн темный", "цель проекта"],
    ["CRM для менеджеров. Срок 2 недели", "цель проекта"],
    ["CRM для менеджеров. Цель автоматизировать заявки. Для сотрудников. Нужна авторизация. Срок 2 недели", "дизайн и стиль"],
  ])("reports missing field for %s", (text, expected) => {
    expect(extractRequirements(user(text)).missingFields).toContain(expected)
  })
})

describe("auth helpers", () => {
  it.each(roles)("accepts role %s", (role) => {
    expect(isRole(role)).toBe(true)
  })

  it.each(["admin", "guest", "", "manager_admin", "CLIENT", "developer_old"])("rejects role %s", (role) => {
    expect(isRole(role)).toBe(false)
  })

  it.each(["secret123", "Пароль123", "complex-password", "1234567890"])("verifies correct password", (password) => {
    expect(verifyPassword(password, hashPassword(password))).toBe(true)
  })

  it.each(["secret123", "Пароль123", "complex-password", "1234567890"])("rejects wrong password", (password) => {
    expect(verifyPassword(`${password}!`, hashPassword(password))).toBe(false)
  })

  it.each(["", "broken", "120000:salt", "abc:salt:hash"])("rejects invalid hash %s", (hash) => {
    expect(verifyPassword("password", hash)).toBe(false)
  })
})
