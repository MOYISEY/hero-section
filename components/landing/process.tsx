import { Reveal } from "@/components/reveal"

const STEPS = [
  {
    n: "I",
    title: "Диалог",
    text:
      "Восемь — двенадцать вопросов в чате. Без шаблонов и без полей «комментарий», в которые никто никогда не пишет.",
    time: "≈ 4 минуты",
  },
  {
    n: "II",
    title: "Анализ",
    text:
      "Нейросеть классифицирует проект, расставляет приоритеты и сводит ответы в логически связанные разделы.",
    time: "≈ 30 секунд",
  },
  {
    n: "III",
    title: "Документ",
    text:
      "Получаете подробное ТЗ. Можно отправить разработчикам, выгрузить PDF или продолжить править вручную.",
    time: "≈ 10 секунд",
  },
] as const

export function LandingProcess() {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
        <Reveal>
          <header className="grid lg:grid-cols-12 gap-x-10 mb-16">
            <div className="lg:col-span-7">
              <p className="nb-eyebrow mb-4">Глава II · Как устроено</p>
              <h2 className="font-display font-medium tracking-[-0.015em] text-[40px] sm:text-[56px] leading-[1.02] text-balance">
                Три шага между идеей
                <br />
                <span className="italic">и точным заданием</span>.
              </h2>
            </div>
            <p className="lg:col-span-5 self-end text-[15px] text-subtle-foreground leading-relaxed max-w-md">
              Каждый шаг отделён от следующего ровно настолько, чтобы
              можно было остановиться, перечитать и поправить — но не
              настолько, чтобы заскучать.
            </p>
          </header>
        </Reveal>

        <ol className="grid lg:grid-cols-3 border-t border-border">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <li
                className={`relative h-full p-8 lg:p-10 border-b lg:border-b-0 ${
                  i < STEPS.length - 1 ? "lg:border-r" : ""
                } border-border`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                    Шаг
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {s.time}
                  </span>
                </div>

                <p className="mt-12 font-display text-[88px] leading-none tracking-tight italic text-primary">
                  {s.n}
                </p>

                <h3 className="mt-8 font-display text-[28px] tracking-tight font-medium">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-subtle-foreground max-w-sm">
                  {s.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
