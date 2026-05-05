import Link from "next/link"
import { Reveal } from "@/components/reveal"
import { AnimatedStat } from "@/components/about/animated-stat"

export const metadata = {
  title: "О системе · NeuralBrief",
  description:
    "Как устроен NeuralBrief: нейросеть, обученная на брифах веб-студий, и три шага от диалога к ТЗ.",
}

export default function AboutPage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden className="absolute inset-0 nb-mesh-soft" />
        <div aria-hidden className="absolute inset-0 nb-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <p className="nb-eyebrow mb-5">О системе</p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight font-medium text-balance leading-[0.98] max-w-5xl">
            Построено на нейронных сетях.
            <br />
            <span className="font-serif italic text-primary-soft">
              Обучено на работе настоящих студий.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-subtle-foreground leading-relaxed">
            NeuralBrief — это не очередной чат-бот по шаблону. Это специализированная
            модель, заточенная под одну задачу: понять клиента веб-студии и собрать
            из разговора готовое техническое задание.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps with animated connecting line */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <div className="max-w-3xl mb-14">
              <p className="nb-eyebrow mb-4">Как это работает</p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance">
                Между идеей и заданием —
                <span className="font-serif italic text-primary-soft"> ровно три шага</span>.
              </h2>
            </div>
          </Reveal>

          <div className="relative">
            {/* connecting line */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-[156px] left-[12%] right-[12%] h-px"
            >
              <div className="relative h-full bg-gradient-to-r from-transparent via-primary/45 to-transparent">
                <div className="absolute -top-[3px] size-2 rounded-full bg-primary-soft shadow-[0_0_14px_3px_oklch(0.78_0.14_295)] left-[16%]" />
                <div className="absolute -top-[3px] size-2 rounded-full bg-primary-soft shadow-[0_0_14px_3px_oklch(0.78_0.14_295)] left-1/2" />
                <div className="absolute -top-[3px] size-2 rounded-full bg-primary-soft shadow-[0_0_14px_3px_oklch(0.78_0.14_295)] left-[83%]" />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 relative">
              {[
                {
                  n: "01",
                  title: "Диалог с AI",
                  body: "Не анкета. Живой разговор: AI задаёт точные вопросы, уточняет ответы и пропускает то, что не относится к вашему типу проекта.",
                  meta: "≈ 4 минуты",
                },
                {
                  n: "02",
                  title: "Анализ ответов",
                  body: "Модель классифицирует проект, расставляет приоритеты, подбирает функциональные модули и выявляет противоречия в требованиях.",
                  meta: "≈ 30 секунд",
                },
                {
                  n: "03",
                  title: "Готовое ТЗ",
                  body: "Получаете документ со всеми разделами, цветовой палитрой, структурой страниц и параметрами производительности. Сразу в работу.",
                  meta: "≈ 10 секунд",
                },
              ].map((s, i) => (
                <Reveal key={s.n} delay={i * 100}>
                  <article className="rounded-2xl border border-border/70 bg-surface/40 p-7 lg:p-8 h-full">
                    <div className="flex items-baseline justify-between mb-12">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                        Шаг {s.n}
                      </span>
                      <span className="font-mono text-[11px] text-primary-soft">
                        {s.meta}
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

      {/* STATS — editorial, NOT hero-metric template */}
      <section className="relative border-y border-border/60 bg-background-alt/40">
        <div aria-hidden className="absolute inset-0 nb-grid-fine opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-end mb-14">
            <p className="nb-eyebrow">Цифры</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight font-medium text-balance leading-[1.05] max-w-3xl">
              За пять месяцев работы NeuralBrief заменил
              <span className="font-serif italic text-primary-soft"> 312 часов </span>
              созвонов и таблиц.
            </h2>
          </div>

          <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60">
            {[
              {
                value: <AnimatedStat to={98} suffix="%" />,
                label: "клиентов довольны итоговым брифом",
              },
              {
                value: <AnimatedStat to={5} suffix=" мин" />,
                label: "среднее время вместо двух часов созвона",
              },
              {
                value: <AnimatedStat to={0} />,
                label: "недопониманий между отделом продаж и разработкой",
              },
              {
                value: <AnimatedStat to={4248} />,
                label: "брифов сгенерировано с момента запуска",
              },
            ].map((s, i) => (
              <Reveal
                key={i}
                delay={i * 60}
                className="bg-background p-7 lg:p-8 flex flex-col justify-between min-h-[180px]"
              >
                <div className="font-display text-4xl lg:text-5xl tracking-tight font-medium leading-none">
                  {s.value}
                </div>
                <div className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-[26ch]">
                  {s.label}
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* TECH / VALUES section */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <Reveal>
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-14 items-start">
              <div className="lg:sticky lg:top-24">
                <p className="nb-eyebrow mb-5">Технология</p>
                <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance leading-[1.02]">
                  Не «универсальный» GPT.
                  <br />
                  <span className="font-serif italic text-primary-soft">
                    Узкая модель под одну задачу.
                  </span>
                </h2>
                <p className="mt-6 text-subtle-foreground leading-relaxed max-w-md">
                  Дообучена на анонимизированных брифах российских и
                  европейских веб-студий с привязкой к реальным результатам
                  проектов.
                </p>
              </div>

              <ul className="grid gap-4">
                {[
                  {
                    h: "Контекстная память",
                    p: "Модель помнит весь диалог и связывает ответы между разделами. Если на третьем шаге вы сказали «мобильный приоритет», на пятом она не предложит десктоп-первый дизайн.",
                  },
                  {
                    h: "Распознавание противоречий",
                    p: "Если бюджет не сходится с функциональностью, AI поднимает это в реальном времени и предлагает компромисс или второй вариант.",
                  },
                  {
                    h: "Авто-структурирование",
                    p: "Финальный документ строится по канону веб-студий: цели, аудитория, функционал, дизайн, сроки. Без вольных интерпретаций.",
                  },
                  {
                    h: "Честные ограничения",
                    p: "AI прямо говорит, что не знает: «уточните у дизайнера», «согласуйте с юристом». Никаких выдуманных деталей.",
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

      {/* CTA */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-24 lg:pb-32">
          <Reveal>
            <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-surface/50 to-background-alt p-10 lg:p-14 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight font-medium leading-[1.02] max-w-2xl text-balance">
                  Достаточно слов о системе.
                  <br />
                  <span className="font-serif italic text-primary-soft">
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
                className="group inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-3 text-[15px] font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-500 self-start lg:self-auto"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                Начать диалог
                <span className="grid place-items-center size-9 rounded-full bg-background/15 group-hover:translate-x-1 transition-transform duration-500">
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
