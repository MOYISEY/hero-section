import Link from "next/link"
import { Reveal } from "@/components/reveal"

export function LandingFinalCTA() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
        <Reveal>
          <div className="grid lg:grid-cols-12 gap-x-10 gap-y-10 items-end border-t border-border pt-16 lg:pt-20">
            <div className="lg:col-span-8">
              <p className="nb-eyebrow mb-5">Колофон</p>
              <h2 className="font-display font-medium tracking-[-0.015em] text-[44px] sm:text-[64px] lg:text-[80px] leading-[0.98] text-balance">
                Запустите диалог.
                <br />
                <span className="italic">Получите ТЗ к концу обеда</span>.
              </h2>
              <p className="mt-8 max-w-xl text-[16px] text-subtle-foreground leading-relaxed">
                Бесплатный демо-режим. Без регистрации. Без подвохов
                в петите. Если результат не пригодится — закроете
                вкладку, и вам ничего за это не будет.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right flex flex-col gap-5 lg:items-end">
              <Link
                href="/chat"
                className="group inline-flex items-baseline gap-3 self-start lg:self-end"
              >
                <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                  →
                </span>
                <span className="font-display italic text-[32px] leading-none">
                  <span className="nb-link">Начать диалог</span>
                </span>
              </Link>
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                Работает с 2026 · 4 248 ТЗ выпущено
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
