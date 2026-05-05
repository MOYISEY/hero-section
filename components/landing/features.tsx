import { Reveal } from "@/components/reveal"

export function LandingFeatures() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div className="max-w-2xl">
              <p className="nb-eyebrow mb-4">Что умеет NeuralBrief</p>
              <h2 className="font-display text-4xl sm:text-5xl tracking-tight font-medium text-balance">
                Нейросеть, обученная на сотнях
                <span className="font-serif italic text-primary-soft"> реальных </span>
                брифов веб-студий.
              </h2>
            </div>
            <p className="max-w-md text-subtle-foreground leading-relaxed">
              Не шаблонный опросник. Каждый следующий вопрос зависит от
              ваших ответов, типа проекта и сложности задачи.
            </p>
          </div>
        </Reveal>

        {/* Asymmetric bento — varying card sizes, NOT identical grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* Big feature — adaptive questions */}
          <Reveal className="col-span-12 lg:col-span-7">
            <FeatureBig />
          </Reveal>

          {/* Tall feature — auto brief */}
          <Reveal className="col-span-12 lg:col-span-5 lg:row-span-2" delay={80}>
            <FeatureTall />
          </Reveal>

          {/* Wide feature — design recommendations */}
          <Reveal className="col-span-12 lg:col-span-7" delay={120}>
            <FeatureWide />
          </Reveal>

          {/* Two short features below */}
          <Reveal className="col-span-12 sm:col-span-6 lg:col-span-6" delay={180}>
            <FeatureSmall
              title="Цветовая палитра"
              text="Подбирает 3–5 оттенков с учётом отрасли и эмоционального тона. Сразу с HEX и OKLCH."
              n="04"
            />
          </Reveal>
          <Reveal className="col-span-12 sm:col-span-6 lg:col-span-6" delay={220}>
            <FeatureSmall
              title="Структура страниц"
              text="Предлагает карту сайта и блочную структуру каждой страницы, исходя из целей."
              n="05"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FeatureBig() {
  return (
    <div className="group relative h-full rounded-2xl border border-border/70 bg-surface/40 p-7 lg:p-9 overflow-hidden transition-colors duration-500 hover:border-border-strong">
      <div
        aria-hidden
        className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      />
      <div className="relative">
        <span className="font-mono text-xs text-muted-foreground">01</span>
        <h3 className="mt-4 font-display text-2xl lg:text-3xl tracking-tight font-medium">
          Адаптивные вопросы
        </h3>
        <p className="mt-3 max-w-md text-subtle-foreground leading-relaxed">
          Если у вас интернет-магазин, AI спросит о категориях и оплате. Если
          лендинг — о целевом действии и УТП. Без лишнего.
        </p>

        <div className="mt-8 grid gap-2.5 max-w-md font-mono text-[12px]">
          {[
            { k: "Тип проекта →", v: "интернет-магазин" },
            { k: "Дальше спрошу →", v: "категории, оплата, доставка" },
            { k: "Пропущу →", v: "блог, форум, мультиязычность" },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-center justify-between gap-4 rounded-md bg-background/60 border border-border/60 px-3 py-2"
            >
              <span className="text-muted-foreground">{row.k}</span>
              <span className="text-foreground truncate">{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureTall() {
  return (
    <div className="relative h-full rounded-2xl border border-border/70 bg-gradient-to-br from-surface/60 to-background-alt p-7 lg:p-9 overflow-hidden">
      <span className="font-mono text-xs text-muted-foreground">02</span>
      <h3 className="mt-4 font-display text-2xl lg:text-3xl tracking-tight font-medium">
        Готовое ТЗ <br />
        <span className="font-serif italic text-primary-soft">в один клик</span>
      </h3>
      <p className="mt-3 text-subtle-foreground leading-relaxed">
        Структурированный документ с разделами, который можно сразу
        отправить разработчикам или выгрузить PDF.
      </p>

      <div className="mt-8 rounded-xl border border-border/60 bg-background/60 p-5 font-mono text-[11px] leading-loose text-subtle-foreground">
        <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>brief.md</span>
          <span>0.2 KB</span>
        </div>
        <div className="space-y-1.5">
          <div className="text-foreground"># Лендинг для агентства</div>
          <div className="text-muted-foreground">## 1. Цели</div>
          <div>— увеличить конверсию до 4.2%</div>
          <div>— собирать заявки 24/7</div>
          <div className="text-muted-foreground">## 2. Аудитория</div>
          <div>— владельцы малого бизнеса</div>
          <div>— возраст 28–45, мобильные 70%</div>
          <div className="text-muted-foreground">## 3. Функционал</div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-success" />
            форма заявки с CRM
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-success" />
            калькулятор стоимости
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="inline-block size-1.5 rounded-full bg-foreground/30" />
            интеграция с amoCRM…
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" /> Сформировано AI
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          09:24:18
        </span>
      </div>
    </div>
  )
}

function FeatureWide() {
  const swatches = [
    { hex: "#0F0E1A", name: "Полночь" },
    { hex: "#6C63FF", name: "Индиго" },
    { hex: "#A78BFA", name: "Фиалка" },
    { hex: "#F0F0FF", name: "Лунный" },
    { hex: "#10B981", name: "Изумруд" },
  ]
  return (
    <div className="relative h-full rounded-2xl border border-border/70 bg-surface/40 p-7 lg:p-9 overflow-hidden">
      <span className="font-mono text-xs text-muted-foreground">03</span>
      <h3 className="mt-4 font-display text-2xl lg:text-3xl tracking-tight font-medium">
        Дизайн-рекомендации
      </h3>
      <p className="mt-3 max-w-md text-subtle-foreground leading-relaxed">
        Подбирает палитру, типографику и стилистические референсы, опираясь
        на тон бренда и характер аудитории.
      </p>

      <div className="mt-8 flex items-stretch gap-3">
        {swatches.map((s, i) => (
          <div
            key={s.hex}
            className="group flex-1 rounded-xl border border-border/60 overflow-hidden bg-background/40 transition-transform duration-500 hover:-translate-y-1"
            style={{ transitionDelay: `${i * 30}ms` }}
          >
            <div
              className="h-20 sm:h-24"
              style={{ backgroundColor: s.hex }}
              aria-hidden
            />
            <div className="px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.hex}
              </div>
              <div className="text-sm mt-0.5">{s.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureSmall({ title, text, n }: { title: string; text: string; n: string }) {
  return (
    <div className="h-full rounded-2xl border border-border/70 bg-surface/30 p-7 transition-colors duration-500 hover:border-border-strong">
      <span className="font-mono text-xs text-muted-foreground">{n}</span>
      <h3 className="mt-4 font-display text-xl tracking-tight font-medium">{title}</h3>
      <p className="mt-2.5 text-subtle-foreground leading-relaxed text-[15px]">{text}</p>
    </div>
  )
}
