import { Reveal } from "@/components/reveal"

const STEPS = [
  {
    n: "01",
    title: "Диалог с AI",
    text: "Отвечаете на 8–12 точечных вопросов в чате. Без шаблонов и без лишних полей.",
    time: "≈ 4 мин",
  },
  {
    n: "02",
    title: "Анализ ответов",
    text: "Нейросеть классифицирует проект, подбирает функционал и расставляет приоритеты.",
    time: "≈ 30 сек",
  },
  {
    n: "03",
    title: "Готовое ТЗ",
    text: "Получаете структурированный документ с целями, аудиторией, функциями и палитрой.",
    time: "≈ 10 сек",
  },
] as const

export function LandingProcess() {
  return (
    <section className="relative border-y border-border/60 bg-background-alt/40">
      <div aria-hidden className="absolute inset-0 nb-grid-fine opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal>
          <div className="max-w-3xl mb-16">
            <p className="nb-eyebrow mb-4">Как это работает</p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance">
              Три шага между идеей и
              <span className="font-serif italic text-primary-soft"> точным </span>
              техническим заданием.
            </h2>
          </div>
        </Reveal>

        <div className="relative grid lg:grid-cols-3 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
          {/* Connecting animated line on desktop */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[88px] left-[8%] right-[8%] h-px"
          >
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute -top-[2px] h-[5px] w-[5px] rounded-full bg-primary-soft shadow-[0_0_12px_2px_oklch(0.78_0.14_295)] left-1/2" />
            </div>
          </div>

          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <article className="relative h-full bg-background p-8 lg:p-10">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs text-muted-foreground tracking-widest">
                    ШАГ {s.n}
                  </span>
                  <span className="font-mono text-[10px] text-primary-soft">{s.time}</span>
                </div>

                <div className="mt-12 grid place-items-center size-14 rounded-xl border border-border/70 bg-surface/60">
                  <span className="font-display text-xl tracking-tight">{s.n}</span>
                </div>

                <h3 className="mt-5 font-display text-2xl tracking-tight font-medium">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-subtle-foreground leading-relaxed max-w-sm">
                  {s.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
