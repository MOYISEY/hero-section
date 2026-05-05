import Link from "next/link"
import { ConversationPreview } from "@/components/landing/conversation-preview"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Mesh background — purposeful, only here */}
      <div aria-hidden className="absolute inset-0 nb-mesh" />
      <div aria-hidden className="absolute inset-0 nb-grid" />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          {/* LEFT — editorial headline */}
          <div className="lg:col-span-7">
            <div className="nb-fade-up flex items-center gap-3 mb-8">
              <span
                aria-hidden
                className="inline-block size-1.5 rounded-full bg-success animate-pulse"
              />
              <span className="nb-eyebrow">Нейросеть в работе</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="font-mono text-xs text-muted-foreground">v 1.0</span>
            </div>

            <h1
              className="nb-fade-up font-display text-balance text-5xl sm:text-6xl lg:text-[88px] leading-[0.94] tracking-[-0.03em] font-medium"
              style={{ animationDelay: "80ms" }}
            >
              Превратим ваши идеи
              <br />
              в техническое задание{" "}
              <span className="font-serif italic font-normal text-primary-soft">
                за пять минут
              </span>
              .
            </h1>

            <p
              className="nb-fade-up mt-8 max-w-[58ch] text-lg text-subtle-foreground leading-relaxed"
              style={{ animationDelay: "180ms" }}
            >
              NeuralBrief — это AI-ассистент веб-студии. Он задаёт нужные вопросы,
              понимает ваши цели и формирует подробное ТЗ автоматически. Без
              созвонов на два часа и таблиц в Excel.
            </p>

            <div
              className="nb-fade-up mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "260ms" }}
            >
              <Link
                href="/chat"
                className="group relative inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2.5 text-[15px] font-medium transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                Начать диалог
                <span className="grid place-items-center size-9 rounded-full bg-background/15 transition-transform duration-500 group-hover:translate-x-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                href="/brief"
                className="inline-flex items-center gap-2 px-5 py-3 text-[15px] text-subtle-foreground hover:text-foreground transition-colors duration-300"
              >
                <span aria-hidden className="text-primary-soft">→</span>
                Посмотреть пример ТЗ
              </Link>
            </div>

            {/* Editorial stat row, NOT a card grid */}
            <dl
              className="nb-fade-up mt-16 grid grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60 max-w-2xl"
              style={{ animationDelay: "360ms" }}
            >
              {[
                { v: "5 мин", l: "вместо двух часов созвонов" },
                { v: "98%", l: "клиентов довольны брифом" },
                { v: "0", l: "недопониманий с разработчиками" },
              ].map((s) => (
                <div key={s.l} className="bg-background-alt p-5">
                  <dt className="font-display text-3xl tracking-tight">{s.v}</dt>
                  <dd className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {s.l}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* RIGHT — animated chat preview, way more interesting than abstract blob */}
          <div className="lg:col-span-5 relative">
            <div
              className="nb-fade-up relative"
              style={{ animationDelay: "300ms" }}
            >
              <ConversationPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
