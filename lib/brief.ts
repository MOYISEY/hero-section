import { extractRequirements, isUnresolved, type SavedDialogMessage } from "@/lib/requirements"

export function buildBrief(messages: SavedDialogMessage[]) {
  const requirements = extractRequirements(messages)
  const form = requirements.leadForm
  const deliveryKnown = form && !isUnresolved(form.delivery)
  const title = requirements.projectType === "Тип проекта не определён" ? "Черновик ТЗ по вашему диалогу" : requirements.projectType
  const scenarios = form ? [
    "Посетитель знакомится с описанием продукта и переходит к форме заявки.",
    `Посетитель заполняет поля: ${form.fields.length ? form.fields.join(", ") : "состав полей требует уточнения"}, затем отправляет заявку.`,
    ...(form.confirmation ? ["После успешной обработки заявки показывается явное подтверждение отправки. Оно означает получение заявки, а не подтверждение записи или оказания услуги."] : []),
    `Передача заявки: ${deliveryKnown ? form.delivery : "получатель и канал пока не согласованы; реализация и приёмка доставки заблокированы до уточнения"}.`,
  ] : ["Основной пользовательский путь и его состояния нужно согласовать с заказчиком."]
  const proposals = form ? [
    "Согласовать обязательность полей и формат контакта. При ошибке заполнения указывать проблемное поле.",
    "При сетевом сбое или отказе обработчика показывать ошибку, сохранять введённые данные и позволять повторить отправку; не показывать ложное подтверждение успеха.",
  ] : []
  const acceptanceCriteria = [
    ...requirements.features.filter((item) => item !== "Функциональные требования требуют уточнения").map((item) => {
      if (/^программа$/i.test(item)) return "На странице виден блок «Программа» с текстом, утверждённым заказчиком. До получения текста проверка содержания заблокирована."
      if (/^формат занятий$/i.test(item)) return "На странице виден блок «Формат занятий»; его текст соответствует известному формату из диалога, неподтверждённые расписание и доступность не добавлены."
      return `В составе работ отражено требование: «${item}».`
    }),
    ...(form?.fields.length ? [`В форме присутствуют поля из исходных данных: ${form.fields.join(", ")}. Обязательность и правила проверки нужно согласовать.`] : []),
    ...(form?.confirmation ? ["После положительного ответа обработчика видно подтверждение успешной отправки заявки."] : []),
    ...(form ? ["Предлагаемая проверка ошибок: при неверных данных или недоступном обработчике нет сообщения об успешной отправке, данные сохранены и повтор доступен.", deliveryKnown ? "Тестовая заявка с полями формы фактически получена согласованным получателем." : "Проверка фактического получения заявки заблокирована до выбора получателя и канала."] : []),
    ...(form?.mobile ? ["На согласованных мобильном устройстве и настольном экране можно прочитать материал, заполнить форму, отправить заявку и увидеть результат без горизонтальной прокрутки основного сценария."] : []),
    "Неподтверждённые сроки, цены, доступность и обещания не выдаются за согласованные факты.",
  ]

  return {
    title: title.length > 90 ? `${title.slice(0, 90).trim()}…` : title,
    summary: `Формат: ${requirements.projectType}. Цель: ${requirements.goal}. Аудитория: ${requirements.audience}.`,
    goals: [requirements.goal],
    audience: requirements.audience,
    features: requirements.features.map((item) => {
      if (/^программа$/i.test(item)) return "Блок «Программа»: показать содержание программы после получения и утверждения материалов заказчиком; темы и результаты не придумывать."
      if (/^формат занятий$/i.test(item)) return `Блок «Формат занятий»: отразить условия из исходного диалога${messages.some((message) => message.role === "user" && /занятия.{0,20}онлайн/i.test(message.text)) ? "; занятия проходят онлайн" : "; детали требуют уточнения"}. Длительность, расписание и доступность без подтверждения не указывать.`
      return item
    }),
    design: requirements.design,
    structure: requirements.pages,
    scenarios,
    proposals,
    acceptanceCriteria,
    content: [
      `Язык материалов: ${requirements.language}.`,
      "Неуказанные тексты и материалы не считаются готовыми. Их содержание, поставщика и порядок утверждения нужно согласовать; вопросы перечислены ниже.",
    ],
    scope: "Объём ограничен перечисленными требованиями. Дополнительные функции и предложения ниже требуют отдельного согласования заказчика.",
    approvalStatus: "Не согласовано. Черновик для проверки заказчиком.",
    requirements,
    transcript: messages,
  }
}

export type Brief = ReturnType<typeof buildBrief>

export function serializeBrief(brief: Brief) {
  const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n")
  return [
    `ТЗ: ${brief.title}`,
    `Статус: ${brief.approvalStatus}`,
    `Описание: ${brief.summary}`,
    `Границы работ: ${brief.scope}`,
    `Цели:\n${list(brief.goals)}`,
    `Аудитория: ${brief.audience}`,
    `Функционал:\n${list(brief.features)}`,
    `Структура:\n${list(brief.structure)}`,
    `Контент:\n${list(brief.content)}`,
    `Сценарий заявки:\n${list(brief.scenarios)}`,
    `Предложения для согласования:\n${list(brief.proposals)}`,
    `Предлагаемые условия приёмки:\n${list(brief.acceptanceCriteria)}`,
    `Дизайн: ${brief.design}`,
    `Сроки: ${brief.requirements.deadline}`,
    `Ограничения:\n${list(brief.requirements.constraints)}`,
    `Полнота ответов по основным полям: ${brief.requirements.completeness}% (не оценка качества и не приёмка)`,
    `Вопросы заказчику:\n${list(brief.requirements.openQuestions)}`,
  ].join("\n\n")
}
