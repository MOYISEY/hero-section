"use client"

import { useEffect, useState } from "react"

const MESSAGES = [
  { from: "ai", text: "Что должны сделать посетители на главной странице за первые 10 секунд?" },
  { from: "user", text: "Понять, что мы делаем, и оставить заявку." },
  { from: "ai", text: "Отлично. Какая у вас ежедневная аудитория и с каких устройств приходят?" },
  { from: "user", text: "Около 1500 заходов, 70% с мобильных." },
  { from: "ai", text: "Принято. Готовлю раздел «Аудитория и устройства» в брифе…" },
] as const

export function ConversationPreview() {
  const [visible, setVisible] = useState(1)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (visible >= MESSAGES.length) return
    const isAi = MESSAGES[visible].from === "ai"
    setTyping(isAi)
    const t = setTimeout(
      () => {
        setTyping(false)
        setVisible((v) => v + 1)
      },
      isAi ? 1600 : 900,
    )
    return () => clearTimeout(t)
  }, [visible])

  return (
    <div className="relative">
      {/* subtle aura, NOT decorative glass blur */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl bg-primary/10 blur-2xl"
      />

      <div className="relative rounded-2xl border border-border/70 bg-background-alt/80 backdrop-blur-md overflow-hidden shadow-[0_30px_80px_-30px_oklch(0.18_0.06_280)]">
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-background/40">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            neuralbrief / диалог
          </span>
          <span className="font-mono text-[10px] text-success">
            ● в эфире
          </span>
        </div>

        {/* Progress chip */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Шаг 2 из 6 · Аудитория</span>
            <span>33%</span>
          </div>
          <div className="mt-2 h-[3px] rounded-full bg-border/80 overflow-hidden">
            <div className="h-full w-1/3 nb-progress-fill rounded-full" />
          </div>
        </div>

        {/* Messages */}
        <div className="px-5 pb-5 pt-4 flex flex-col gap-3 min-h-[360px]">
          {MESSAGES.slice(0, visible).map((m, i) => (
            <Bubble key={i} from={m.from} text={m.text} />
          ))}
          {typing && <TypingDots />}
        </div>
      </div>
    </div>
  )
}

function Bubble({ from, text }: { from: "ai" | "user"; text: string }) {
  if (from === "user") {
    return (
      <div className="self-end max-w-[82%] nb-fade-up">
        <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-[14px] leading-relaxed">
          {text}
        </div>
      </div>
    )
  }
  return (
    <div className="self-start max-w-[88%] nb-fade-up">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 grid place-items-center size-7 rounded-md bg-surface border border-border/70 font-mono text-[10px] text-primary-soft shrink-0">
          AI
        </div>
        <div className="rounded-2xl rounded-tl-md border border-border/70 bg-surface/80 px-4 py-2.5 text-[14px] text-foreground leading-relaxed">
          {text}
        </div>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="self-start nb-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="grid place-items-center size-7 rounded-md bg-surface border border-border/70 font-mono text-[10px] text-primary-soft shrink-0">
          AI
        </div>
        <div className="rounded-full border border-border/70 bg-surface/80 px-3 py-2 flex items-center gap-1">
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
