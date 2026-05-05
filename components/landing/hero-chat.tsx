"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { ArrowUp } from "lucide-react"
import { useEffect, useRef, useState, type FormEvent } from "react"

type Role = "ai" | "user"

const SEED_MESSAGES: UIMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    parts: [{ type: "text", text: "Здравствуйте. Что вы хотите создать?" }],
  },
  {
    id: "seed-2",
    role: "user",
    parts: [{ type: "text", text: "Лендинг для сервиса доставки еды." }],
  },
  {
    id: "seed-3",
    role: "assistant",
    parts: [{ type: "text", text: "Кто целевая аудитория?" }],
  },
]

function getText(m: UIMessage): string {
  if (!m.parts || !Array.isArray(m.parts)) return ""
  return m.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function HeroChat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/hero-chat" }),
    messages: SEED_MESSAGES,
  })

  const [input, setInput] = useState("")
  const listRef = useRef<HTMLUListElement>(null)
  const isStreaming = status === "submitted" || status === "streaming"

  // auto-scroll to bottom on every new message / streaming chunk
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isStreaming])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = input.trim()
    if (!value || isStreaming) return
    sendMessage({ text: value })
    setInput("")
  }

  return (
    <div
      className="relative flex aspect-[4/5] flex-col overflow-hidden border border-border bg-background-alt"
      aria-label="Живой диалог: пользователь описывает идею, ИИ NeuralBrief задаёт уточняющие вопросы и формирует техническое задание."
    >
      {/* fine grid backdrop */}
      <div aria-hidden className="absolute inset-0 nb-grid-fine opacity-40" />
      <div aria-hidden className="absolute inset-0 nb-mesh-soft opacity-70" />

      {/* corner brackets */}
      <span aria-hidden className="absolute top-2 left-2 size-3 border-t border-l border-primary/70" />
      <span aria-hidden className="absolute top-2 right-2 size-3 border-t border-r border-primary/70" />
      <span aria-hidden className="absolute bottom-2 left-2 size-3 border-b border-l border-primary/70" />
      <span aria-hidden className="absolute bottom-2 right-2 size-3 border-b border-r border-primary/70" />

      {/* terminal header */}
      <div className="relative flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
          session · live
        </span>
        <span className="hidden sm:inline">brief.ai / groq</span>
        <span>{isStreaming ? "stream" : "ready"}</span>
      </div>

      {/* chat surface — top-to-bottom flow, scrollable, anchored to bottom */}
      <ul
        ref={listRef}
        className="relative flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 [scrollbar-width:thin]"
        aria-live="polite"
      >
        {messages.map((m) => {
          const text = getText(m)
          if (!text) return null
          return <Bubble key={m.id} role={m.role === "user" ? "user" : "ai"} text={text} />
        })}
        {status === "submitted" && <TypingBubble role="ai" />}
      </ul>

      {/* composer */}
      <form
        onSubmit={handleSubmit}
        className="relative z-[1] flex shrink-0 items-center gap-2 border-t border-border/70 bg-background-alt/85 px-3 py-2.5 backdrop-blur-sm"
      >
        <span aria-hidden className="font-mono text-[11px] text-primary/80">
          [
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Опишите вашу идею…"
          aria-label="Опишите вашу идею"
          disabled={isStreaming}
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-60"
          autoComplete="off"
        />
        <span aria-hidden className="font-mono text-[11px] text-primary/80">
          ]
        </span>
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          aria-label="Отправить сообщение"
          className="inline-flex size-7 items-center justify-center border border-primary/40 bg-primary/[0.08] text-primary transition-colors hover:bg-primary/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-3.5" strokeWidth={2.25} />
        </button>
      </form>
    </div>
  )
}

function Bubble({ role, text }: { role: Role; text: string }) {
  const isAi = role === "ai"
  return (
    <li
      className={
        isAi
          ? "nb-fade-up flex max-w-[82%] flex-col items-start gap-1 self-start"
          : "nb-fade-up flex max-w-[82%] flex-col items-end gap-1 self-end"
      }
    >
      <span
        className={
          isAi
            ? "font-mono text-[9px] uppercase tracking-[0.22em] text-primary"
            : "font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground"
        }
      >
        {isAi ? "/ ai" : "/ you"}
      </span>
      <p
        className={
          isAi
            ? "border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-snug text-foreground whitespace-pre-wrap"
            : "border border-primary/40 bg-primary/[0.08] px-3.5 py-2.5 text-[13px] leading-snug text-foreground whitespace-pre-wrap"
        }
      >
        {text}
      </p>
    </li>
  )
}

function TypingBubble({ role }: { role: Role }) {
  const isAi = role === "ai"
  return (
    <li
      className={
        isAi
          ? "nb-fade-in flex flex-col items-start gap-1 self-start"
          : "nb-fade-in flex flex-col items-end gap-1 self-end"
      }
    >
      <span
        className={
          isAi
            ? "font-mono text-[9px] uppercase tracking-[0.22em] text-primary"
            : "font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground"
        }
      >
        {isAi ? "/ ai" : "/ you"}
      </span>
      <span
        className={
          isAi
            ? "inline-flex items-center gap-1.5 border border-border bg-surface px-3.5 py-3"
            : "inline-flex items-center gap-1.5 border border-primary/40 bg-primary/[0.08] px-3.5 py-3"
        }
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="block size-1.5 rounded-full bg-primary/80"
            style={{
              animation: `nb-pulse-dot 1.2s ${i * 0.18}s infinite cubic-bezier(0.45, 0, 0.55, 1)`,
            }}
          />
        ))}
        <span className="sr-only">Печатает…</span>
      </span>
    </li>
  )
}
