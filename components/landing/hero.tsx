import Image from "next/image"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative border-b border-border nb-grid">
      {/* HUD strip */}
      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10 pt-6 pb-4 flex items-center justify-between text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground border-b border-border/60">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="nb-status-dot" />
          NeuralBrief / system online
        </span>
        <span className="hidden sm:inline">PROTOCOL · BRIEF.AI v.01</span>
        <span>NODE 01 / 04</span>
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-x-10 gap-y-12 items-start">
          {/* LEFT — primary signal */}
          <div className="relative z-[2] min-w-0">
            <p className="nb-eyebrow mb-8 inline-flex items-center gap-2">
              <span aria-hidden className="size-1 rounded-full bg-primary" />
              SIGNAL · 01
            </p>

            <h1 className="font-display font-medium tracking-[-0.025em] leading-[0.95] text-[48px] sm:text-[64px] lg:text-[72px] xl:text-[88px] text-balance break-words">
              Разговор,
              <br />
              превращённый
              <br />
              <span className="text-primary">в задачу</span>.
            </h1>

            <div className="mt-12 grid sm:grid-cols-12 gap-x-6 gap-y-8 max-w-[820px]">
              <p className="sm:col-span-7 text-[17px] leading-[1.55] text-foreground">
                Техническое задание начинается не с шаблона в Excel,
                а с честного разговора о цели. NeuralBrief задаёт
                вопросы, которые задал бы внимательный арт-директор,
                и сводит ответы в один документ.
              </p>
              <div className="sm:col-span-5 sm:border-l sm:border-border sm:pl-6 flex flex-col gap-3">
                <p className="nb-folio uppercase tracking-widest">/ контекст</p>
                <p className="text-[14px] leading-relaxed text-subtle-foreground">
                  Инструмент для небольших студий, которым надоело
                  тратить два часа на созвон, чтобы получить десять
                  пунктов в блокноте.
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-4">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 text-[14px] font-medium tracking-tight transition-colors hover:bg-primary-soft"
              >
                <span>Начать диалог</span>
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
              <Link
                href="/brief"
                className="inline-flex items-center gap-3 border border-border-strong px-6 py-3.5 text-[14px] font-medium tracking-tight text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground group-hover:text-primary">
                  /
                </span>
                <span>Прочитать готовое ТЗ</span>
              </Link>
            </div>
          </div>

          {/* RIGHT — neural visualization with caption */}
          <figure className="relative z-[1] min-w-0 self-end">
            <div className="relative aspect-[4/5] overflow-hidden bg-background-alt border border-border">
              <Image
                src="/neural-hero.jpg"
                alt="Абстрактная визуализация нейронной сети: тонкие циановые линии связей между узлами на тёмно-синем фоне"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              {/* corner ticks */}
              <span aria-hidden className="absolute top-2 left-2 size-3 border-t border-l border-primary/70" />
              <span aria-hidden className="absolute top-2 right-2 size-3 border-t border-r border-primary/70" />
              <span aria-hidden className="absolute bottom-2 left-2 size-3 border-b border-l border-primary/70" />
              <span aria-hidden className="absolute bottom-2 right-2 size-3 border-b border-r border-primary/70" />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 px-3 py-2 flex items-center justify-between text-[10px] font-mono tracking-[0.18em] uppercase text-foreground/85 bg-gradient-to-t from-background/80 to-transparent"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="size-1.5 rounded-full bg-primary nb-blink" />
                  TRACE 142
                </span>
                <span>04:21</span>
              </div>
            </div>
            <figcaption className="mt-4 flex items-baseline gap-3 text-[12px] text-muted-foreground">
              <span className="font-mono tracking-widest uppercase">/ visual 01</span>
              <span className="leading-snug">
                Так выглядит исходный материал любого ТЗ, пока
                NeuralBrief не приведёт его в порядок.
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Stats deck */}
        <div className="mt-20 grid sm:grid-cols-3 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { k: "В среднем", v: "5 минут", d: "вместо двух часов созвонов" },
            { k: "Точность", v: "98%", d: "клиентов согласовали ТЗ с первого раза" },
            { k: "Вопросов", v: "8 — 12", d: "ровно столько, сколько нужно" },
          ].map((item, i) => (
            <div
              key={item.k}
              className="py-7 sm:px-7 first:sm:pl-0 last:sm:pr-0 flex items-baseline gap-5"
            >
              <span className="font-mono text-[11px] text-primary tracking-[0.16em] uppercase shrink-0 w-7">
                /0{i + 1}
              </span>
              <div>
                <p className="nb-eyebrow mb-1">{item.k}</p>
                <p className="font-display text-[28px] tracking-tight leading-none">
                  {item.v}
                </p>
                <p className="mt-1.5 text-[13px] text-subtle-foreground leading-snug">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
