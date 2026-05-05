"use client"

import { useEffect, useRef, useState } from "react"

type Role = "ai" | "user"
type Message = { id: number; role: Role; text: string }

const SCRIPT: Message[] = [
  { id: 1, role: "ai", text: "Здравствуйте. Что вы хотите создать?" },
  { id: 2, role: "user", text: "Лендинг для сервиса доставки еды." },
  { id: 3, role: "ai", text: "Кто целевая аудитория?" },
  { id: 4, role: "user", text: "Офисные сотрудники, 25–40 лет." },
  { id: 5, role: "ai", text: "Принято. Формирую ТЗ…" },
]

const AI_TYPING_MS = 1100
const USER_TYPING_MS = 700
const STEP_GAP_MS = 700
const RESTART_GAP_MS = 3200

export function HeroChat() {
  const [visible, setVisible] = useState<Message[]>([])
  const [typingRole, setTypingRole] = useState<Role | null>(null)
  const [done, setDone] = useState(false)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      setVisible(SCRIPT)
      setDone(true)
      return
    }

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms)
      timeouts.current.push(id)
    }

    const run = () => {
      setVisible([])
      setDone(false)
      let delay = 600

      SCRIPT.forEach((msg) => {
        const typingMs = msg.role === "ai" ? AI_TYPING_MS : USER_TYPING_MS

        schedule(() => setTypingRole(msg.role), delay)
        delay += typingMs

        schedule(() => {
          setTypingRole(null)
          setVisible((v) => [...v, msg])
        }, delay)
        delay += STEP_GAP_MS
      })

      schedule(() => setDone(true), delay)
      schedule(run, delay + RESTART_GAP_MS)
    }

    run()

    return () => {
      timeouts.current.forEach(clearTimeout)
      timeouts.current = []
    }
  }, [])

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden border border-border bg-background-alt"
      role="img"
      aria-label="Демонстрация диалога: пользователь описывает задачу, ИИ задаёт уточняющие вопросы и формирует техническое задание."
    >
      {/* fine grid backdrop */}
      <div aria-hidden className="absolute inset-0 nb-grid-fine opacity-40" />
      {/* subtle radial accent */}
      <div aria-hidden className="absolute inset-0 nb-mesh-soft opacity-70" />

      {/* corner brackets */}
      <span aria-hidden className="absolute top-2 left-2 size-3 border-t border-l border-primary/70" />
      <span aria-hidden className="absolute top-2 right-2 size-3 border-t border-r border-primary/70" />
      <span aria-hidden className="absolute bottom-2 left-2 size-3 border-b border-l border-primary/70" />
      <span aria-hidden className="absolute bottom-2 right-2 size-3 border-b border-r border-primary/70" />

      {/* terminal header */}
      <div className="relative flex items-center justify-between border-b border-border/70 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
          session · live
        </span>
        <span className="hidden sm:inline">brief.ai / node.02</span>
        <span>04:21</span>
      </div>

      {/* chat surface */}
      <div className="relative flex h-[calc(100%-86px)] flex-col gap-3 overflow-hidden px-4 py-5 sm:px-5">
        <ul className="flex flex-1 flex-col justify-end gap-3" aria-live="polite">
          {visible.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}
          {typingRole && <TypingBubble role={typingRole} />}
        </ul>
      </div>

      {/* footer / status bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border/70 bg-background-alt/80 px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/85 backdrop-blur-sm">
        <span className="inline-flex items-center gap-1.5 text-primary">
          <span aria-hidden className="font-mono">[</span>
          {done ? "brief · ready" : "trace · 142"}
          <span aria-hidden className="font-mono">]</span>
        </span>
        <span className="text-muted-foreground">
          {visible.length}/{SCRIPT.length}
        </span>
      </div>
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
            ? "border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-snug text-foreground"
            : "border border-primary/40 bg-primary/[0.08] px-3.5 py-2.5 text-[13px] leading-snug text-foreground"
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
