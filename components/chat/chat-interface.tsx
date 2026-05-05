"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Mic, Send, Sparkles } from "lucide-react"

type Step = {
  id: string
  label: string
  hint: string
}

const STEPS: Step[] = [
  { id: "01", label: "Тип проекта", hint: "Что строим" },
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
      "Хорошо, лендинг. Какой главной цели страница должна достигать через месяц после запуска? Например: 50 заявок в неделю, рост узнаваемости, продажа конкретной услуги.",
    meta: "Шаг 02",
  },
  {
    id: 4,
    from: "user",
    text: "Минимум 40 заявок в неделю на услуги веб-разработки.",
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
      "Владельцы малого и среднего бизнеса, 28–45 лет. Около 70% будут с мобильных, остальные — с десктопа.",
  },
  {
    id: 7,
    from: "ai",
    text:
      "Отлично. Перехожу к функциональности. Я предлагаю обязательные блоки: hero с УТП, кейсы, форма заявки с интеграцией CRM, калькулятор стоимости. Что-то добавим, уберём или поменяем?",
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
      "Записал. Последний короткий блок про дизайн: какой характер сайта вам ближе — строгий и минималистичный, тёплый и человечный, или технологичный и футуристичный?",
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

  // Demo replay: stagger messages on mount
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
          // advance progress
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

  // autoscroll
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

    // Simulated AI reply
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
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-10 pb-24">
        {/* Page heading */}
        <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="nb-eyebrow mb-3">Демо-диалог</p>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight font-medium">
              Диалог с
              <span className="font-serif italic text-primary-soft"> NeuralBrief</span>
            </h1>
          </div>
          <p className="max-w-md text-subtle-foreground leading-relaxed">
            Ниже — заранее проигранный пример того, как AI собирает бриф.
            Вы можете подключиться и продолжить разговор.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Sidebar — progress tracker */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-border/70 bg-surface/40 overflow-hidden">
              <div className="p-5 border-b border-border/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Прогресс
                  </span>
                  <span className="font-mono text-[11px] text-primary-soft">
                    {progress}%
                  </span>
                </div>
                <div className="h-[3px] rounded-full bg-border/80 overflow-hidden">
                  <div
                    className="h-full nb-progress-fill rounded-full transition-[width] duration-700"
                    style={{
                      width: `${progress}%`,
                      transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  />
                </div>
                <p className="mt-3 font-display text-lg leading-tight">
                  Шаг {STEPS[stepIndex].id} · {STEPS[stepIndex].label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {STEPS[stepIndex].hint}
                </p>
              </div>

              <ol className="p-3 flex flex-col gap-1">
                {STEPS.map((s, i) => {
                  const state =
                    i < stepIndex ? "done" : i === stepIndex ? "active" : "todo"
                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                        state === "active" && "bg-background border border-border/70",
                        state === "todo" && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid place-items-center size-6 rounded-md font-mono text-[10px] shrink-0",
                          state === "done" && "bg-success/15 text-success border border-success/30",
                          state === "active" && "bg-primary text-primary-foreground",
                          state === "todo" && "bg-surface border border-border/60",
                        )}
                      >
                        {state === "done" ? <CheckIcon /> : s.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{s.label}</div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Generate brief CTA — appears after demo concludes */}
            <div
              className={cn(
                "mt-4 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/15 to-surface/40 p-5 transition-all duration-700",
                done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <div className="flex items-center gap-2 nb-eyebrow text-primary-soft">
                <Sparkles className="size-3.5" /> Готово
              </div>
              <p className="mt-2 text-sm text-subtle-foreground leading-relaxed">
                Достаточно данных, чтобы сформировать черновик ТЗ.
              </p>
              <Link
                href="/brief"
                className="mt-4 group inline-flex items-center justify-between gap-3 w-full rounded-full bg-foreground text-background pl-5 pr-2 py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-500"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                Сгенерировать ТЗ
                <span className="grid place-items-center size-7 rounded-full bg-background/15 group-hover:translate-x-0.5 transition-transform duration-500">
                  <ArrowSm />
                </span>
              </Link>
            </div>
          </aside>

          {/* Chat area */}
          <section className="rounded-2xl border border-border/70 bg-background-alt/60 overflow-hidden flex flex-col min-h-[640px] lg:min-h-[720px]">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/60 bg-background/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-primary to-primary-soft text-primary-foreground font-mono text-[11px] shrink-0">
                  AI
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">NeuralBrief Ассистент</p>
                  <p className="font-mono text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-success" />
                    в эфире · отвечает за пару секунд
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border/60 rounded-full px-2.5 py-1">
                сессия #4248
              </span>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
              <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                <DateDivider />
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {typing && <Typing />}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="border-t border-border/60 bg-background/40 px-4 sm:px-5 py-4"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-surface/60 focus-within:border-primary/60 focus-within:bg-surface/80 transition-colors duration-300 pl-4 pr-2 py-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Напишите ответ или уточнение…"
                    className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder:text-muted-foreground py-2"
                    aria-label="Ваше сообщение"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      toast("Голосовой ввод", {
                        description: "В демо доступен только текстовый режим.",
                      })
                    }
                    className="grid place-items-center size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
                    aria-label="Голосовой ввод"
                  >
                    <Mic className="size-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-300"
                    aria-label="Отправить сообщение"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
                <p className="mt-2 px-1 font-mono text-[11px] text-muted-foreground flex items-center gap-3">
                  <span>Enter — отправить</span>
                  <span className="opacity-40">·</span>
                  <span>Shift + Enter — новая строка</span>
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.from === "user") {
    return (
      <div className="self-end max-w-[82%] nb-fade-up">
        <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 text-[15px] leading-relaxed shadow-[0_8px_24px_-12px_oklch(0.55_0.20_280_/_0.6)]">
          {message.text}
        </div>
        <p className="mt-1.5 px-1 text-right font-mono text-[10px] text-muted-foreground">
          вы · сейчас
        </p>
      </div>
    )
  }
  return (
    <div className="self-start max-w-[88%] nb-fade-up">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid place-items-center size-8 rounded-md bg-surface border border-border/70 font-mono text-[10px] text-primary-soft shrink-0">
          AI
        </div>
        <div className="min-w-0">
          <div className="rounded-2xl rounded-tl-md border border-border/70 bg-surface/70 px-4 py-3 text-[15px] text-foreground leading-relaxed">
            {message.text}
          </div>
          <p className="mt-1.5 px-1 font-mono text-[10px] text-muted-foreground">
            NeuralBrief{message.meta ? ` · ${message.meta}` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="self-start nb-fade-in">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center size-8 rounded-md bg-surface border border-border/70 font-mono text-[10px] text-primary-soft shrink-0">
          AI
        </div>
        <div className="rounded-full border border-border/70 bg-surface/70 px-3 py-2.5 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block size-1.5 rounded-full bg-primary-soft"
              style={{
                animation: `nb-pulse-dot 1.2s ${i * 0.18}s infinite cubic-bezier(0.45, 0, 0.55, 1)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function DateDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <span className="flex-1 h-px bg-border/60" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        начало диалога · сегодня
      </span>
      <span className="flex-1 h-px bg-border/60" />
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" aria-hidden>
      <path
        d="M2.5 6.2L4.7 8.4L9.5 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}
