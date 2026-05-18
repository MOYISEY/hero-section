import Link from "next/link"
import { HeroChat } from "./hero-chat"

export function LandingHero() {
  return (
    <section className="relative border-b border-border nb-grid">
      <div className="relative mx-auto max-w-[1320px] px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-x-10 gap-y-12 items-start">
          <div className="relative z-[2] min-w-0">
            <h1
              className="font-display font-medium tracking-[-0.025em] leading-[1.02] text-[40px] sm:text-[52px] lg:text-[58px] xl:text-[72px] text-pretty hyphens-none [word-break:keep-all]"
              lang="ru"
            >
              Разговор,
              <br />
              превращённый
              <br />
              <span className="text-primary">в задачу</span>.
            </h1>

            <p className="mt-8 max-w-2xl text-[17px] leading-[1.55] text-foreground">
              NeuralBrief задаёт вопросы клиенту и собирает ответы в понятное техническое задание.
            </p>

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
                <span>Прочитать готовое ТЗ</span>
              </Link>
            </div>
          </div>

          <figure className="relative z-[1] min-w-0 self-end">
            <HeroChat />
          </figure>
        </div>
      </div>
    </section>
  )
}
