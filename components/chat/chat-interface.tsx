"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState, type FormEvent } from "react"

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognitionAlternative = {
  transcript: string
}

type SpeechRecognitionResult = {
  0: SpeechRecognitionAlternative
}

type SpeechRecognitionEvent = Event & {
  results: {
    length: number
    [index: number]: SpeechRecognitionResult
  }
}

type SpeechRecognition = EventTarget & {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  start: () => void
  stop: () => void
}

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

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

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: "start",
    role: "assistant",
    parts: [
      {
        type: "text",
        text:
          "Здравствуйте. Я помогу собрать ТЗ. Начнём с главного: что вы хотите создать?",
      },
    ],
  },
]

function getText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/hero-chat" }),
    messages: INITIAL_MESSAGES,
  })
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [voicePreview, setVoicePreview] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef("")
  const shouldKeepRecordingRef = useRef(false)
  const voiceBaseTextRef = useRef("")
  const isStreaming = status === "submitted" || status === "streaming"
  const userMessagesCount = messages.filter((message) => message.role === "user").length
  const stepIndex = Math.min(userMessagesCount, STEPS.length - 1)
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100)
  const done = userMessagesCount >= 4

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isStreaming])

  useEffect(() => {
    inputRef.current = input
  }, [input])

  useEffect(() => {
    const savedMessages = messages
      .map((message) => ({
        role: message.role,
        text: getText(message),
      }))
      .filter((message) => message.text)
    localStorage.setItem("neuralbrief.chat", JSON.stringify(savedMessages))
    localStorage.setItem("neuralbrief.updatedAt", new Date().toISOString())

    if (savedMessages.some((message) => message.role === "user")) {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: savedMessages }),
      }).catch(() => undefined)
    }
  }, [messages])

  function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const value = input.trim()
    if (!value || isStreaming) return

    if (value.length < 3) {
      toast("Сообщение слишком короткое", {
        description: "Опишите проект чуть подробнее, чтобы AI мог собрать ТЗ.",
      })
      return
    }

    sendMessage({ text: value })
    setInput("")
  }

  function handleVoiceInput() {
    const SpeechRecognitionApi =
      (window as WindowWithSpeechRecognition).SpeechRecognition ||
      (window as WindowWithSpeechRecognition).webkitSpeechRecognition

    if (!SpeechRecognitionApi) {
      toast("Голосовой ввод недоступен", {
        description: "Откройте сайт в Chrome или Edge и разрешите доступ к микрофону.",
      })
      return
    }

    const SpeechRecognitionCtor = SpeechRecognitionApi

    function startRecognition() {
      const recognition = new SpeechRecognitionCtor()
      recognitionRef.current = recognition
      const browserLanguage = navigator.language
      recognition.lang = /^(ru|kk|en)/i.test(browserLanguage) ? browserLanguage : "ru-RU"
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length }, (_, index) =>
          event.results[index][0].transcript,
        )
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()

        if (transcript) {
          const nextText = [voiceBaseTextRef.current, transcript].filter(Boolean).join(" ")
          setVoicePreview(transcript)
          setInput(nextText)
          inputRef.current = nextText
        }
      }

      recognition.onerror = () => {
        setIsRecording(false)
        shouldKeepRecordingRef.current = false
        toast("Не удалось распознать голос", {
          description: "Проверьте микрофон, разрешения браузера и попробуйте ещё раз.",
        })
      }

      recognition.onend = () => {
        if (shouldKeepRecordingRef.current) {
          voiceBaseTextRef.current = inputRef.current.trim()
          startRecognition()
          return
        }

        setIsRecording(false)
      }

      recognition.start()
    }

    if (isRecording) {
      shouldKeepRecordingRef.current = false
      voiceBaseTextRef.current = inputRef.current.trim()
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    shouldKeepRecordingRef.current = true
    voiceBaseTextRef.current = inputRef.current.trim()
    startRecognition()
    setIsRecording(true)
    setVoicePreview("")
    toast("Слушаю голос", {
      description: "Говорите на русском, казахском или английском. Текст появится ниже.",
    })
  }

  return (
    <div className="relative">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-4 flex items-center justify-between text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="nb-status-dot" />
            / trace · live session
          </span>
          <span>SESSION 0</span>
          <span>GROQ</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-12 pb-20">
        <header className="grid lg:grid-cols-12 gap-x-10 gap-y-6 mb-12 pb-12 border-b border-border">
          <div className="lg:col-span-7">
            <p className="nb-eyebrow mb-4">/ live · диалог</p>
            <h1 className="font-display font-medium tracking-[-0.025em] text-[44px] sm:text-[64px] leading-[1.0] text-balance">
              Беседа с AI,
              <br />
              <span className="text-primary">которая собирает ТЗ</span>.
            </h1>
          </div>
          <p className="lg:col-span-5 self-end max-w-md text-[15px] text-subtle-foreground leading-relaxed">
            Здесь начинается реальная работа AI. Опишите проект своими словами,
            а система будет задавать уточняющие вопросы для технического задания.
          </p>
        </header>

        <div className="grid lg:grid-cols-[280px_1fr] gap-10">
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
                Если данных достаточно, можно открыть черновик ТЗ.
              </p>
              <Link
                href="/brief"
                onClick={() => {
                  const savedMessages = messages
                    .map((message) => ({
                      role: message.role,
                      text: getText(message),
                    }))
                    .filter((message) => message.text)
                  localStorage.setItem("neuralbrief.chat", JSON.stringify(savedMessages))
                  localStorage.setItem("neuralbrief.updatedAt", new Date().toISOString())
                }}
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

          <section className="border-l border-border lg:pl-10 -ml-6 pl-6 lg:ml-0">
            <div className="flex items-baseline justify-between pb-4 border-b border-border">
              <p className="font-display text-xl tracking-tight inline-flex items-center gap-3">
                <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
                trace · <span className="text-primary">Astana IT University</span>
              </p>
              <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
                live session
              </span>
            </div>

            <div
              ref={scrollRef}
              className="py-6 max-h-[640px] overflow-y-auto pr-2"
            >
              <ol className="flex flex-col gap-7">
                {messages.map((message) => {
                  const text = getText(message)
                  if (!text) return null
                  return <Line key={message.id} message={message} text={text} />
                })}
                {status === "submitted" && <TypingLine />}
              </ol>
            </div>

            <form
              onSubmit={handleSend}
              className="mt-2 pt-6 border-t border-border"
            >
              <label className="block">
                <span className="nb-eyebrow">Ваш ответ</span>
                <div
                  className={cn(
                    "mt-3 flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all duration-300",
                    isRecording
                      ? "border-primary/70 bg-primary/[0.06] shadow-[0_0_40px_rgba(0,229,255,0.08)]"
                      : "border-border bg-surface/30",
                  )}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Опишите проект своими словами…"
                    className="flex-1 bg-transparent outline-none text-[16px] text-foreground placeholder:text-muted-foreground py-1 font-display"
                    aria-label="Ваше сообщение"
                    disabled={isStreaming}
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={isStreaming}
                    className={cn(
                      "relative grid size-11 shrink-0 place-items-center rounded-full border font-mono text-[11px] uppercase tracking-widest transition-all duration-300 disabled:opacity-40",
                      isRecording
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_24px_rgba(0,229,255,0.35)]"
                        : "border-border-strong bg-background text-muted-foreground hover:border-primary hover:text-primary",
                    )}
                    aria-label={isRecording ? "Остановить запись голоса" : "Начать голосовой ввод"}
                  >
                    {isRecording && (
                      <span
                        aria-hidden
                        className="absolute inset-[-6px] rounded-full border border-primary/40 animate-ping"
                      />
                    )}
                    <span aria-hidden>{isRecording ? "■" : "●"}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="font-mono text-[12px] uppercase tracking-widest text-foreground disabled:opacity-30 nb-link disabled:no-underline"
                  >
                    Отправить →
                  </button>
                </div>
              </label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground tracking-wide">
                <p>{isRecording ? "Идёт запись · говорите свободно" : "Enter — отправить · голос распознаётся автоматически"}</p>
                {voicePreview && (
                  <p className="max-w-full truncate rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-primary">
                    Распознано: {voicePreview}
                  </p>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function Line({ message, text }: { message: UIMessage; text: string }) {
  const isAi = message.role !== "user"
  return (
    <li className="grid grid-cols-[80px_1fr] items-baseline gap-5 nb-fade-up">
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.18em] uppercase",
          isAi ? "text-primary" : "text-muted-foreground",
        )}
      >
        {isAi ? "Бриф" : "Клиент"}
      </span>
      <p
        className={cn(
          "text-balance",
          isAi
            ? "font-display text-[19px] leading-[1.4] text-foreground"
            : "text-[16px] leading-[1.55] text-subtle-foreground",
        )}
      >
        — {text}
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
        <span className="sr-only">Готовит вопрос</span>
      </span>
    </li>
  )
}
