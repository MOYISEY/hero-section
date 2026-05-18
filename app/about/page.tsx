import Link from "next/link"
import { Reveal } from "@/components/reveal"

export const metadata = {
  title: "О системе · NeuralBrief",
  description:
    "Как устроен NeuralBrief: нейросеть, обученная на брифах веб-студий, и три шага от диалога к ТЗ.",
}

export default function AboutPage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight font-medium text-balance leading-[0.98] max-w-5xl">
            Система для сбора требований.
            <br />
            <span className="text-primary">
              Без лишних созвонов и таблиц.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-subtle-foreground leading-relaxed">
            NeuralBrief помогает клиенту описать проект, а команде — получить понятное техническое задание.
          </p>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <div className="max-w-3xl mb-14">
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance">
                Как это работает
              </h2>
            </div>
          </Reveal>

          <div className="relative">
            <div className="grid lg:grid-cols-3 gap-6 relative">
              {[
                {
                  n: "01",
                  title: "Диалог с AI",
                  body: "Клиент отвечает на вопросы о проекте.",
                },
                {
                  n: "02",
                  title: "Анализ ответов",
                  body: "Система выделяет цель, аудиторию, функции, дизайн и сроки.",
                },
                {
                  n: "03",
                  title: "Готовое ТЗ",
                  body: "Команда получает структурированный документ для работы.",
                },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <article className="rounded-2xl border border-border/70 bg-surface/40 p-7 lg:p-8 h-full">
                    <div className="mb-10">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        Шаг {s.n}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl tracking-tight font-medium">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-subtle-foreground leading-relaxed">
                      {s.body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14 items-start">
              <div className="lg:sticky lg:top-24">
                <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance leading-[1.02]">
                  Что делает система
                </h2>
                <p className="mt-6 text-subtle-foreground leading-relaxed max-w-md">
                  Она не заменяет менеджера, а помогает быстрее собрать основу для проекта.
                </p>
              </div>

              <ul className="grid gap-4">
                {[
                  {
                    h: "Контекстная память",
                    p: "ИИ учитывает предыдущие ответы клиента.",
                  },
                  {
                    h: "Структура ТЗ",
                    p: "Ответы превращаются в разделы: цель, аудитория, функции, дизайн и сроки.",
                  },
                  {
                    h: "CRM-процесс",
                    p: "Менеджер, разработчик и клиент работают с проектом в одной системе.",
                  },
                  {
                    h: "Контроль задач",
                    p: "Задачи можно назначать, возвращать на доработку и закрывать после проверки.",
                  },
                ].map((it, i) => (
                  <Reveal key={it.h} delay={i * 70}>
                    <li className="rounded-2xl border border-border/70 bg-surface/30 p-6 lg:p-7">
                      <h3 className="font-display text-xl tracking-tight font-medium">
                        {it.h}
                      </h3>
                      <p className="mt-2 text-subtle-foreground leading-relaxed">
                        {it.p}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 lg:pb-32">
          <Reveal>
            <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/50 to-background-alt p-10 lg:p-14 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight font-medium leading-[1.02] max-w-2xl text-balance">
                  Достаточно слов о системе.
                  <br />
                  <span className="text-primary">
                    Попробуйте сами.
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-subtle-foreground leading-relaxed">
                  Демо открыто, регистрация не нужна. Через пять минут у вас
                  будет первый черновик ТЗ.
                </p>
              </div>
              <Link
                href="/chat"
                className="group inline-flex items-center gap-3 bg-primary text-primary-foreground pl-6 pr-2 py-3 text-[15px] font-medium hover:bg-primary-soft transition-colors duration-500 self-start lg:self-auto"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                Начать диалог
                <span className="grid place-items-center size-9 bg-primary-foreground/15 group-hover:translate-x-1 transition-transform duration-500">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
