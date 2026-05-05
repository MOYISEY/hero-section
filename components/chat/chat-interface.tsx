"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = {
  id: string
  label: string
  hint: string
}

const STEPS: Step[] = [
  { id: "01", label: "Тип проекта", hint: "Что мы строим" },
  { id: "02", label: "Цели", hint: "Зачем строим" },
  { id: "03", label: "Аудитория", hint: "Для кого" },
  { id: "04", label: "Функциональность", hint: "Что должен уметь сайт" },
  { id: "05", label: "Дизайн", hint: "Тон и характер" },
  { id: "06", label: "Сроки и формат", hint: "Когда и в каком виде" },
]

type Message = {
  id: number
  from: "ai" | "user"
  text: string
  meta?: string
}

const DEMO: Message[] = [
  {
    id: 1,
    from: "ai",
    text:
      "Здравствуйте. Я помогу вам собрать техническое задание. Начнём с главного: что мы строим — лендинг, многостраничный сайт, интернет-магазин или что-то ещё?",
    meta: "Шаг 01",
  },
  { id: 2, from: "user", text: "Лендинг для нашего digital-агентства." },
  {
    id: 3,
    from: "ai",
    text:
      "Хорошо, лендинг. Какой главной цели страница должна достигать через месяц после запуска? Например: пятьдесят заявок в неделю, рост узнаваемости, продажа конкретной услуги.",
    meta: "Шаг 02",
  },
  {
    id: 4,
    from: "user",
    text: "Минимум сорок заявок в неделю на услуги веб-разработки.",
  },
  {
    id: 5,
    from: "ai",
    text:
      "Принято. А кто эти будущие клиенты? Опишите портрет: чем занимаются, какой возраст, с каких устройств чаще зайдут.",
    meta: "Шаг 03",
  },
  {
    id: 6,
    from: "user",
    text:
      "Владельцы малого и среднего бизнеса, 28 — 45 лет. Около 70% будут с мобильных, остальные с десктопа.",
  },
  {
    id: 7,
    from: "ai",
    text:
      "Перехожу к функциональности. Предлагаю обязательные блоки: hero с УТП, кейсы, форма заявки с интеграцией CRM, калькулятор стоимости. Что-то добавим, уберём или поменяем?",
    meta: "Шаг 04",
  },
  {
    id: 8,
    from: "user",
    text:
      "Всё нужно. Дополнительно — блок с отзывами и онлайн-чат с менеджером.",
  },
  {
    id: 9,
    from: "ai",
    text:
      "Записал. Последний короткий блок про дизайн: какой характер сайта вам ближе — строгий и минималистичный, тёплый и человечный или технологичный?",
    meta: "Шаг 05",
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(() => DEMO.slice(0, 1))
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState("")
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const queue = DEMO.slice(1)

    async function play() {
      for (const m of queue) {
        if (cancelled) return
        if (m.from === "ai") {
          setTyping(true)
          await wait(1300)
          if (cancelled) return
          setTyping(false)
        } else {
          await wait(700)
        }
        if (cancelled) return
        setMessages((prev) => [...prev, m])
        if (m.meta) {
          const idx = STEPS.findIndex((s) => m.meta?.includes(s.id))
          if (idx >= 0) setStepIndex(idx)
        }
      }
      if (!cancelled) {
        await wait(700)
        setDone(true)
      }
    }
    play()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const value = input.trim()
    if (!value) return
    const newMsg: Message = { id: Date.now(), from: "user", text: value }
    setMessages((prev) => [...prev, newMsg])
    setInput("")

    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "ai",
          text:
            "Понял вас. Сохранил эту вводную в раздел брифа. Продолжим, когда будете готовы сформировать ТЗ.",
        },
      ])
      if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1)
      setDone(true)
    }, 1200)
  }

  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)

  return (
    <div className="relative">
      {/* Page masthead */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-4 flex items-center justify-between text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="nb-status-dot" />
            / trace · live session
          </span>
          <span>SESSION 4 248</span>
          <span>NODE.12</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-12 pb-20">
        {/* Header */}
        <header className="grid lg:grid-cols-12 gap-x-10 gap-y-6 mb-12 pb-12 border-b border-border">
          <div className="lg:col-span-7">
            <p className="nb-eyebrow mb-4">/ демо · диалог</p>
            <h1 className="font-display font-medium tracking-[-0.025em] text-[44px] sm:text-[64px] leading-[1.0] text-balance">
              Беседа с системой,
              <br />
              <span className="text-primary">которой не нужен черновик</span>.
            </h1>
          </div>
          <p className="lg:col-span-5 self-end max-w-md text-[15px] text-subtle-foreground leading-relaxed">
            Ниже проигрывается заранее записанный фрагмент. Когда демо
            закончится, можно подключиться и продолжить разговор своими
            словами.
          </p>
        </header>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
          {/* Sidebar — печатное оглавление */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="border-y border-border py-6">
              <div className="flex items-baseline justify-between mb-4">
                <span className="nb-eyebrow">Прогресс</span>
                <span className="font-mono text-[11px] text-foreground">
                  {progress}%
                </span>
              </div>
              <div className="h-px bg-border mb-4 relative">
                <div
                  className="absolute inset-y-[-1px] left-0 bg-foreground"
                  style={{
                    width: `${progress}%`,
                    transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>
              <p className="font-display text-xl leading-tight">
                Шаг {STEPS[stepIndex].id} ·{" "}
                <span className="text-primary">{STEPS[stepIndex].label}</span>
              </p>
              <p className="mt-1.5 text-[13px] text-muted-foreground">
                {STEPS[stepIndex].hint}
              </p>
            </div>

            <ol className="mt-6 flex flex-col">
              {STEPS.map((s, i) => {
                const state =
                  i < stepIndex ? "done" : i === stepIndex ? "active" : "todo"
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "grid grid-cols-[28px_1fr_auto] items-baseline gap-3 py-3 border-b border-border last:border-b-0 transition-colors",
                      state === "todo" && "text-muted-foreground",
                      state === "active" && "text-foreground",
                      state === "done" && "text-subtle-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-[0.1em]",
                        state === "active" && "text-primary",
                      )}
                    >
                      {s.id}
                    </span>
                    <span
                      className={cn(
                        "text-[14px]",
                        state === "active" &&
                          "font-display text-primary text-[16px] leading-tight",
                      )}
                    >
                      {s.label}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "text-[10px] font-mono",
                        state === "done" && "text-foreground",
                        state === "active" && "text-primary",
                        state === "todo" && "text-muted-foreground/50",
                      )}
                    >
                      {state === "done" ? "✓" : state === "active" ? "•" : "—"}
                    </span>
                  </li>
                )
              })}
            </ol>

            {/* Generate brief */}
            <div
              className={cn(
                "mt-8 transition-all duration-700",
                done
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none",
              )}
            >
              <p className="nb-eyebrow mb-3">Готово к вёрстке</p>
              <p className="text-[14px] text-subtle-foreground leading-relaxed mb-4">
                Достаточно данных, чтобы сверстать черновик ТЗ.
              </p>
              <Link
                href="/brief"
                className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 text-[14px] font-medium tracking-tight transition-colors hover:bg-primary-soft"
              >
                <span>Собрать ТЗ</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </aside>

          {/* Transcript */}
          <section className="border-l border-border lg:pl-10 -ml-6 pl-6 lg:ml-0">
            <div className="flex items-baseline justify-between pb-4 border-b border-border">
              <p className="font-display text-xl tracking-tight inline-flex items-center gap-3">
                <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
                trace · <span className="text-primary">Praktika.web</span>
              </p>
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                запись 05.05.2026
              </span>
            </div>

            <div
              ref={scrollRef}
              className="py-6 max-h-[640px] overflow-y-auto pr-2"
            >
              <ol className="flex flex-col gap-7">
                {messages.map((m) => (
                  <Line key={m.id} message={m} />
                ))}
                {typing && <TypingLine />}
              </ol>
            </div>

            <form
              onSubmit={handleSend}
              className="mt-2 pt-6 border-t border-border"
            >
              <label className="block">
                <span className="nb-eyebrow">Ваш ответ</span>
                <div className="mt-3 flex items-end gap-3 border-b border-foreground py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Напишите свободно, как сказали бы в разговоре…"
                    className="flex-1 bg-transparent outline-none text-[16px] text-foreground placeholder:text-muted-foreground py-1 font-display"
                    aria-label="Ваше сообщение"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toast("Голосовой ввод", {
                        description:
                          "В демо доступен только текстовый режим.",
                      })
                    }
                    className="text-muted-foreground hover:text-foreground transition-colors text-[12px] font-mono uppercase tracking-widest"
                  >
                    Голос
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="font-mono text-[12px] uppercase tracking-widest text-foreground disabled:opacity-30 nb-link disabled:no-underline"
                  >
                    Отправить →
                  </button>
                </div>
              </label>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground tracking-wide">
                Enter — отправить · Shift + Enter — новая строка
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function Line({ message }: { message: Message }) {
  const isAi = message.from === "ai"
  return (
    <li className="grid grid-cols-[80px_1fr] items-baseline gap-5 nb-fade-up">
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.18em] uppercase",
          isAi ? "text-primary" : "text-muted-foreground",
        )}
      >
        {isAi ? "Бриф" : "Клиент"}
        {message.meta && (
          <span className="block mt-1 text-muted-foreground/70 normal-case tracking-[0.06em]">
            {message.meta}
          </span>
        )}
      </span>
      <p
        className={cn(
          "text-balance",
          isAi
                ? "font-display text-[19px] leading-[1.4] text-foreground"
            : "text-[16px] leading-[1.55] text-subtle-foreground",
        )}
      >
        — {message.text}
      </p>
    </li>
  )
}

function TypingLine() {
  return (
    <li className="grid grid-cols-[80px_1fr] items-baseline gap-5 nb-fade-in">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
        Бриф
      </span>
      <span className="inline-flex items-center gap-1 pt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="block size-1 rounded-full bg-foreground/60"
            style={{
              animation: `nb-pulse-dot 1.2s ${i * 0.18}s infinite cubic-bezier(0.45, 0, 0.55, 1)`,
            }}
          />
        ))}
        <span className="sr-only">Гот��вит вопрос</span>
      </span>
    </li>
  )
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
