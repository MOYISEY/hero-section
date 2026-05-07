"use client"

import { Reveal } from "@/components/reveal"
import { BriefActions } from "@/components/brief/brief-actions"
import { Compass, Target, Users, Layers, Brush, ListTree } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type SavedMessage = {
  role: string
  text: string
}

const SECTIONS = [
  { id: "summary", label: "Краткое описание", icon: Compass },
  { id: "goals", label: "Цели", icon: Target },
  { id: "audience", label: "Аудитория", icon: Users },
  { id: "features", label: "Функционал", icon: Layers },
  { id: "design", label: "Дизайн", icon: Brush },
  { id: "structure", label: "Структура", icon: ListTree },
]

function fallbackMessages(): SavedMessage[] {
  return [
    {
      role: "assistant",
      text:
        "Черновик пока пуст. Начните реальный диалог, чтобы здесь появилось ТЗ по вашему проекту.",
    },
  ]
}

function splitItems(text: string): string[] {
  return text
    .split(/[\n.;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 8)
    .slice(0, 6)
}

function buildBrief(messages: SavedMessage[]) {
  const userMessages = messages.filter((message) => message.role === "user")
  const aiMessages = messages.filter((message) => message.role !== "user")
  const userText = userMessages.map((message) => message.text).join(". ").trim()
  const aiText = aiMessages.map((message) => message.text).join(". ").trim()
  const sourceText = userText || aiText
  const items = splitItems(sourceText)

  return {
    title: userMessages[0]?.text || "Черновик ТЗ по вашему диалогу",
    summary:
      sourceText ||
      "Нет сохранённых ответов пользователя. Вернитесь в диалог и опишите проект.",
    goals: items.length ? items : ["Цели нужно уточнить в диалоге."],
    audience:
      userMessages[1]?.text || "Аудиторию нужно уточнить отдельным вопросом в диалоге.",
    features:
      userMessages[2]?.text || "Функционал нужно уточнить отдельным вопросом в диалоге.",
    design:
      userMessages[3]?.text || "Дизайн-предпочтения пока не указаны.",
    structure:
      aiMessages.at(-1)?.text || "Структура будет дополнена после уточняющих вопросов AI.",
    transcript: messages,
  }
}

export function BriefDocument() {
  const [messages, setMessages] = useState<SavedMessage[]>(fallbackMessages)
  const [updatedAt, setUpdatedAt] = useState<string>("")
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("neuralbrief.chat")
    const savedUpdatedAt = localStorage.getItem("neuralbrief.updatedAt")

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.filter((message) => message.text))
        }
      } catch {
        setMessages(fallbackMessages())
      }
    }

    if (savedUpdatedAt) setUpdatedAt(savedUpdatedAt)
    setGeneratedAt(new Date().toLocaleString("ru-RU"))
  }, [])

  const brief = useMemo(() => buildBrief(messages), [messages])
  const briefText = useMemo(
    () =>
      [
        `ТЗ: ${brief.title}`,
        `Описание: ${brief.summary}`,
        `Цели: ${brief.goals.join("; ")}`,
        `Аудитория: ${brief.audience}`,
        `Функционал: ${brief.features}`,
        `Дизайн: ${brief.design}`,
        `Структура: ${brief.structure}`,
      ].join("\n\n"),
    [brief],
  )

  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-10 pb-10 border-b border-border/60">
          <div>
            <p className="nb-eyebrow mb-3">Техническое задание · черновик</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight font-medium text-balance leading-[1.02]">
              {brief.title}
            </h1>
            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 max-w-2xl">
              {[
                { k: "ID", v: "NB-DRAFT" },
                { k: "Дата", v: generatedAt ? generatedAt.split(",")[0] : "—" },
                { k: "Автор", v: "NeuralBrief AI" },
                { k: "Источник", v: updatedAt ? "Диалог" : "Нет данных" },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {m.k}
                  </dt>
                  <dd className="text-sm mt-1">{m.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <BriefActions briefText={briefText} />
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          <aside className="lg:sticky lg:top-24 self-start">
            <p className="nb-eyebrow mb-4">Содержание</p>
            <ol className="flex flex-col gap-1 font-mono text-[12px] tracking-wide">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="group flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/40 transition-colors"
                  >
                    <span className="text-muted-foreground/60 w-5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="max-w-3xl">
            <Section id="summary" icon={Compass} n="01" title="Краткое описание">
              <p>{brief.summary}</p>
            </Section>

            <Section id="goals" icon={Target} n="02" title="Цели">
              <BulletList items={brief.goals} />
            </Section>

            <Section id="audience" icon={Users} n="03" title="Аудитория">
              <p>{brief.audience}</p>
            </Section>

            <Section id="features" icon={Layers} n="04" title="Функционал">
              <p>{brief.features}</p>
            </Section>

            <Section id="design" icon={Brush} n="05" title="Дизайн-предпочтения">
              <p>{brief.design}</p>
            </Section>

            <Section id="structure" icon={ListTree} n="06" title="Структура и заметки AI">
              <p>{brief.structure}</p>
            </Section>

            <Section id="transcript" icon={ListTree} n="07" title="Исходный диалог">
              <ol className="mt-5 flex flex-col gap-3">
                {brief.transcript.map((message, index) => (
                  <li key={`${message.role}-${index}`} className="rounded-xl border border-border/60 bg-surface/30 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {message.role === "user" ? "Клиент" : "AI"}
                    </p>
                    <p className="mt-2 text-foreground">{message.text}</p>
                  </li>
                ))}
              </ol>
            </Section>

            <div className="mt-16 pt-10 border-t border-border/60 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="nb-eyebrow mb-2">Согласовано</p>
                <p className="font-display text-xl">Вы и NeuralBrief AI</p>
              </div>
              <div className="font-mono text-xs text-muted-foreground space-y-1.5">
                <p>Хэш документа: локальный черновик</p>
                <p>Сгенерировано: {generatedAt || "—"}</p>
                <p>Источник: сохранённый диалог браузера</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

function Section({
  id,
  icon: Icon,
  n,
  title,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24 py-10 first:pt-0 border-b border-border/60 last:border-b-0">
        <div className="flex items-center gap-3 mb-5">
          <span className="grid place-items-center size-9 rounded-lg border border-border/70 bg-surface/60 text-primary-soft">
            <Icon className="size-4" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            раздел {n}
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-[34px] tracking-tight font-medium leading-[1.05]">
          {title}
        </h2>
        <div className="mt-5 text-subtle-foreground leading-relaxed [&>p]:max-w-[68ch] [&>p+*]:mt-5 text-[15.5px]">
          {children}
        </div>
      </section>
    </Reveal>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="font-mono text-[11px] text-primary-soft mt-1.5 w-6 shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-foreground/90">{it}</span>
        </li>
      ))}
    </ul>
  )
}
