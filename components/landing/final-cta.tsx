import Link from "next/link"
import { Reveal } from "@/components/reveal"

export function LandingFinalCTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/40">
            <div aria-hidden className="absolute inset-0 nb-mesh-soft" />
            <div aria-hidden className="absolute inset-0 nb-grid opacity-40" />

            <div className="relative px-8 py-20 lg:px-16 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-8">
                <p className="nb-eyebrow mb-5">Попробуйте сейчас</p>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight font-medium text-balance leading-[0.98]">
                  Запустите диалог. Получите ТЗ
                  <span className="font-serif italic text-primary-soft"> к концу обеда</span>.
                </h2>
                <p className="mt-6 max-w-xl text-subtle-foreground leading-relaxed">
                  Бесплатный демо-режим. Без регистрации. Без подвохов в петите.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-4 lg:items-end">
                <Link
                  href="/chat"
                  className="group relative inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-3 text-[15px] font-medium transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
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
                <span className="font-mono text-[11px] text-muted-foreground">
                  работает с 2026 года · 4 248 брифов сгенерировано
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
