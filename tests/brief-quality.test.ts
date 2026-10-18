import { describe, expect, it } from "vitest"
import { buildBrief, serializeBrief } from "@/lib/brief"
import { extractRequirements } from "@/lib/requirements"
import { C01_PROMPT, C01_FOLLOWUP } from "./fixtures/c01"

const user = (text: string) => ({ role: "user", text })

describe("C01 quality regressions", () => {
  it.each([C01_PROMPT, C01_PROMPT.replace(/\n/g, "")])("separates source facts from drafting instructions", (prompt) => {
    const requirements = extractRequirements([user(prompt), user(C01_FOLLOWUP)])
    expect(requirements.audience).toBe("родителей старшеклассников")
    expect(requirements.goal).toBe("Нужен лендинг для получения заявок от родителей старшеклассников")
    expect(requirements.features).toEqual(expect.arrayContaining([
      "программа", "формат занятий", "форма с именем и контактом",
      "подтверждение успешной отправки", "мобильная версия",
    ]))
    expect(requirements.features.join(" ")).not.toContain("В ТЗ отразите")
    expect(requirements.missingFields).toEqual(expect.arrayContaining([
      "дизайн и стиль", "сроки", "получатель и канал доставки заявки",
    ]))
    expect(requirements.completeness).toBeLessThan(100)
    expect(requirements.openQuestions[0]).toContain("Кто получает заявку")
    expect(requirements.openQuestions.join(" ")).toContain("Кто предоставляет и утверждает")
  })

  it("exports the same draft status, delivery blocker and reviewable scenarios as the document", () => {
    const brief = buildBrief([user(C01_PROMPT), user(C01_FOLLOWUP)])
    const text = serializeBrief(brief)
    expect(brief.approvalStatus).toBe("Не согласовано. Черновик для проверки заказчиком.")
    expect(brief.features.join(" ")).toContain("Блок «Программа»")
    expect(brief.features.join(" ")).toContain("занятия проходят онлайн")
    expect(text).toContain("Аудитория: родителей старшеклассников")
    expect(text).toContain("Русский")
    expect(text).toContain("не подтверждение записи")
    expect(text).toContain("не показывать ложное подтверждение")
    expect(text).toContain("заблокирована до выбора получателя и канала")
    expect(text).toContain("без горизонтальной прокрутки")
    expect(text).toContain("не оценка качества и не приёмка")
    expect(text).not.toContain("Вы и NeuralBrief AI")
    for (const item of [...brief.features, ...brief.proposals, ...brief.acceptanceCriteria]) {
      expect(text).toContain(item)
    }
  })

  it("keeps explicit section boundaries and later unknown values", () => {
    const requirements = extractRequirements([
      user("Тип проекта: сайт\nЦель: собирать заявки\nАудитория: покупатели\nДизайн: синий\nСрок: 2 недели\nФункции: форма заявки"),
      user("Цель: не определена\nДизайн пока не согласован. Срок не определён."),
    ])
    expect(requirements.projectType).toBe("сайт")
    expect(requirements.audience).toBe("покупатели")
    expect(requirements.goal).toBe("не определена")
    expect(requirements.missingFields).toEqual(expect.arrayContaining(["цель проекта", "дизайн и стиль", "сроки"]))
  })

  it("does not keep an obsolete delivery channel after the client withdraws it", () => {
    const brief = buildBrief([
      user("Нужен сайт для покупателей. Функции: форма заявки.\nДоставка заявки: в CRM менеджеру"),
      user("Канал доставки заявки и её получатель не заданы."),
    ])
    expect(brief.requirements.missingFields).toContain("получатель и канал доставки заявки")
    expect(brief.scenarios.join(" ")).toContain("заблокированы до уточнения")
  })

  it("supports another commissioning client without adding tutor-specific requirements", () => {
    const brief = buildBrief([user("Клиент — мастерская. Нужен сайт для получения заявок от владельцев велосипедов. Функции: форма с именем и телефоном. Доставка заявки: в CRM менеджеру. Дизайн минималистичный. Срок 3 недели.")])
    expect(brief.audience).toBe("владельцев велосипедов")
    expect(brief.requirements.leadForm?.fields).toEqual(["Имя", "Телефон"])
    expect(brief.requirements.missingFields).not.toContain("получатель и канал доставки заявки")
    expect(serializeBrief(brief)).not.toMatch(/репетитор|старшеклассник|экзамен/)
  })
})
