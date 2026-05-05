import Link from "next/link"
import { Reveal } from "@/components/reveal"

export function LandingFinalCTA() {
  return (
    <section className="relative nb-grid">
      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
        <Reveal>
          <div className="grid lg:grid-cols-12 gap-x-10 gap-y-10 items-end border-t border-border pt-16 lg:pt-20">
            <div className="lg:col-span-8">
              <p className="nb-eyebrow mb-5 inline-flex items-center gap-2">
                <span aria-hidden className="nb-status-dot" />
                / endpoint · ready
              </p>
              <h2 className="font-display font-medium tracking-[-0.025em] text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.98] text-balance">
                Запустите диалог.
                <br />
                <span className="text-primary">Получите ТЗ к концу обеда</span>.
              </h2>
              <p className="mt-8 max-w-xl text-[16px] text-subtle-foreground leading-relaxed">
                Бесплатный демо-режим. Без регистрации. Без подвохов
                в условиях. Если результат не пригодится, закроете
                вкладку и вам ничего за это не будет.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right flex flex-col gap-5 lg:items-end">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-3 self-start lg:self-end bg-primary text-primary-foreground px-7 py-4 text-[15px] font-medium tracking-tight transition-colors hover:bg-primary-soft"
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
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                online since 2026 · 4 248 briefs delivered
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
