"use client"

type Role = "ai" | "user"

const DEMO_MESSAGES = [
  { id: 1, role: "ai" as const, text: "Здравствуйте. Что вы хотите создать?" },
  { id: 2, role: "user" as const, text: "Сайт для проекта" },
  { id: 3, role: "ai" as const, text: "Какую цель должен выполнить сайт?" },
  { id: 4, role: "user" as const, text: "Собрать заявки и объяснить продукт" },
  { id: 5, role: "ai" as const, text: "Кто основная аудитория?" },
]

export function HeroChat() {
  return (
    <div
      className="relative flex aspect-[4/5] flex-col overflow-hidden border border-border bg-background-alt"
      aria-label="Демо-превью диалога: показывает принцип работы NeuralBrief без подключения к AI."
    >
      <div aria-hidden className="absolute inset-0 nb-grid-fine opacity-40" />
      <div aria-hidden className="absolute inset-0 nb-mesh-soft opacity-70" />

      <span aria-hidden className="absolute top-2 left-2 size-3 border-t border-l border-primary/70" />
      <span aria-hidden className="absolute top-2 right-2 size-3 border-t border-r border-primary/70" />
      <span aria-hidden className="absolute bottom-2 left-2 size-3 border-b border-l border-primary/70" />
      <span aria-hidden className="absolute bottom-2 right-2 size-3 border-b border-r border-primary/70" />

      <div className="relative flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
          session · preview
        </span>
        <span className="hidden sm:inline">brief.ai / preview</span>
        <span>demo</span>
      </div>

      <ul className="relative flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5 [scrollbar-width:thin]">
        {DEMO_MESSAGES.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}
      </ul>

      <div className="relative z-[1] flex shrink-0 items-center gap-2 border-t border-border/70 bg-background-alt/85 px-3 py-2.5 backdrop-blur-sm">
        <span aria-hidden className="font-mono text-[11px] text-primary/80">[</span>
        <span className="flex-1 bg-transparent text-[13px] text-muted-foreground/70 py-1">
          Демо-превью. Реальный диалог начинается по кнопке слева.
        </span>
        <span aria-hidden className="font-mono text-[11px] text-primary/80">]</span>
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
            ? "border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-snug text-foreground whitespace-pre-wrap"
            : "border border-primary/40 bg-primary/[0.08] px-3.5 py-2.5 text-[13px] leading-snug text-foreground whitespace-pre-wrap"
        }
      >
        {text}
      </p>
    </li>
  )
}
