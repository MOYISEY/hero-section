"use client"

import { useEffect, useState } from "react"

const MESSAGES = [
  { from: "ai", text: "Что должны сделать посетители на главной странице за первые десять секунд?" },
  { from: "user", text: "Понять, что мы делаем, и оставить заявку." },
  { from: "ai", text: "Какая дневная аудитория и с каких устройств приходят?" },
  { from: "user", text: "Около полутора тысяч заходов в день, семьдесят процентов с мобильных." },
  { from: "ai", text: "Принято. Записал в раздел «Аудитория и устройства»." },
] as const

/**
 * Editorial transcript — like a printed interview, not a chat UI.
 * No window chrome, no traffic lights, no glass.
 */
export function ConversationPreview() {
  const [visible, setVisible] = useState(2)
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
      isAi ? 1700 : 950,
    )
    return () => clearTimeout(t)
  }, [visible])

  return (
    <div className="relative border border-border bg-surface px-6 py-7 md:px-9 md:py-9">
      <span aria-hidden className="absolute top-2 left-2 size-2.5 border-t border-l border-primary/70" />
      <span aria-hidden className="absolute top-2 right-2 size-2.5 border-t border-r border-primary/70" />
      <span aria-hidden className="absolute bottom-2 left-2 size-2.5 border-b border-l border-primary/70" />
      <span aria-hidden className="absolute bottom-2 right-2 size-2.5 border-b border-r border-primary/70" />
      <header className="flex items-baseline justify-between gap-4 pb-4 border-b border-border">
        <div>
          <p className="nb-eyebrow inline-flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
            / trace · live
          </p>
          <p className="mt-1.5 font-display text-lg tracking-tight">
            session 142 · фрагмент
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">
          node.02
        </span>
      </header>

      <ol className="mt-6 flex flex-col gap-5">
        {MESSAGES.slice(0, visible).map((m, i) => (
          <Line key={i} from={m.from} text={m.text} />
        ))}
        {typing && <TypingLine />}
      </ol>
    </div>
  )
}

function Line({ from, text }: { from: "ai" | "user"; text: string }) {
  const isAi = from === "ai"
  return (
    <li className="grid grid-cols-[64px_1fr] items-baseline gap-4 nb-fade-up">
      <span
        className={
          isAi
            ? "font-mono text-[10px] tracking-[0.18em] uppercase text-primary"
            : "font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
        }
      >
        {isAi ? "AI · бриф" : "клиент"}
      </span>
      <p
        className={
          isAi
            ? "font-display text-[17px] leading-[1.45] text-foreground"
            : "text-[15px] leading-[1.55] text-subtle-foreground"
        }
      >
        {text}
      </p>
    </li>
  )
}

function TypingLine() {
  return (
    <li className="grid grid-cols-[64px_1fr] items-baseline gap-4 nb-fade-in">
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
        AI · бриф
      </span>
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="block size-1 rounded-full bg-primary/80"
            style={{
              animation: `nb-pulse-dot 1.2s ${i * 0.18}s infinite cubic-bezier(0.45, 0, 0.55, 1)`,
            }}
          />
        ))}
        <span className="sr-only">Готовит ответ</span>
      </span>
    </li>
  )
}
