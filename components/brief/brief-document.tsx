import { Reveal } from "@/components/reveal"
import { BriefActions } from "@/components/brief/brief-actions"
import {
  Compass,
  Target,
  Users,
  Layers,
  Palette,
  Brush,
  ListTree,
} from "lucide-react"

const SECTIONS = [
  { id: "tip", label: "Тип сайта", icon: Compass },
  { id: "celi", label: "Цели", icon: Target },
  { id: "auditoriya", label: "Аудитория", icon: Users },
  { id: "funkcii", label: "Функционал", icon: Layers },
  { id: "dizayn", label: "Дизайн-предпочтения", icon: Brush },
  { id: "palitra", label: "Цветовая палитра", icon: Palette },
  { id: "struktura", label: "Структура страниц", icon: ListTree },
]

const PALETTE = [
  { hex: "#0F0E1A", name: "Полночь", role: "Фон" },
  { hex: "#1A1830", name: "Глубина", role: "Карточки" },
  { hex: "#6C63FF", name: "Индиго", role: "Акцент" },
  { hex: "#A78BFA", name: "Фиалка", role: "Подсветка" },
  { hex: "#F0F0FF", name: "Лунный", role: "Текст" },
] as const

export function BriefDocument() {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-24">
        {/* Document header */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-10 pb-10 border-b border-border/60">
          <div>
            <p className="nb-eyebrow mb-3">Техническое задание · черновик</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight font-medium text-balance leading-[1.02]">
              Лендинг для digital-агентства
              <span className="text-primary"> «Astana IT University»</span>
            </h1>
            <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 max-w-2xl">
              {[
                { k: "ID", v: "NB-4248" },
                { k: "Дата", v: "05.05.2026" },
                { k: "Автор", v: "NeuralBrief AI" },
                { k: "Версия", v: "1.0" },
              ].map((m) => (
                <div key={m.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {m.k}
                  </dt>
                  <dd className="text-sm mt-1">{m.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <BriefActions />
        </div>

        {/* Body */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* TOC */}
          <aside className="lg:sticky lg:top-24 self-start">
            <p className="nb-eyebrow mb-4">Содержание</p>
            <ol className="flex flex-col gap-1 font-mono text-[12px] tracking-wide">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="group flex items-center gap-3 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface/40 transition-colors"
                  >
                    <span className="text-muted-foreground/60 w-5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          {/* Sections */}
          <article className="max-w-3xl">
            <Section id="tip" icon={Compass} n="01" title="Тип сайта">
              <p>
                Одностраничный лендинг с фокусом на сбор заявок. Адаптивный,
                с приоритетом мобильной версии. Оптимизирован
                под Lighthouse Performance ≥ 90.
              </p>
              <KeyValueGrid
                items={[
                  ["Формат", "лендинг (single-page)"],
                  ["Адаптивность", "mobile-first, ≥ 320px"],
                  ["Языки", "русский (база), английский в перспективе"],
                ]}
              />
            </Section>

            <Section id="celi" icon={Target} n="02" title="Цели">
              <p>Запуск решает три бизнес-задачи:</p>
              <BulletList
                items={[
                  "0 подтверждённых целевых заявок на текущем этапе.",
                  "0 подтверждённых данных по стоимости лида на текущем этапе.",
                  "0 подтверждённых кейсов с измеримыми результатами на текущем этапе.",
                ]}
              />
            </Section>

            <Section id="auditoriya" icon={Users} n="03" title="Аудитория">
              <p>
                Основной сегмент — владельцы малого и среднего бизнеса
                в возрасте 28–45 лет. Принимают решения быстро, ценят
                конкретику и сроки.
              </p>
              <div className="mt-6 grid sm:grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60">
                {[
                  { v: "0%", l: "мобильный трафик" },
                  { v: "0", l: "возраст ядра" },
                  { v: "B2B", l: "тип принятия решений" },
                ].map((s) => (
                  <div key={s.l} className="bg-background p-5">
                    <div className="font-display text-2xl tracking-tight">
                      {s.v}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="funkcii" icon={Layers} n="04" title="Функционал">
              <p>Обязательные модули, согласованные в диалоге:</p>
              <BulletList
                items={[
                  "Hero-блок с УТП и единственной целевой кнопкой «Оставить заявку».",
                  "Секция кейсов: 0 проектов с подтверждёнными метриками результата.",
                  "Калькулятор стоимости с тремя пресетами и итоговой вилкой.",
                  "Форма заявки с интеграцией amoCRM (UTM, IP, источник).",
                  "Блок социальных доказательств: 0 видео-отзывов клиентов.",
                  "Онлайн-чат с менеджером (JivoSite или аналог).",
                ]}
              />
            </Section>

            <Section id="dizayn" icon={Brush} n="05" title="Дизайн-предпочтения">
              <p>
                Тон — технологичный, уверенный, без излишней игры.
                Антиреференсы: SaaS-шаблоны с Inter и фиолетовыми
                градиентами, кейс-страницы с одинаковыми карточками.
              </p>
              <KeyValueGrid
                items={[
                  ["Настроение", "точность, спокойная сила, премиальность"],
                  ["Типографика", "Space Grotesk + акцентный Instrument Serif"],
                  ["Анимации", "редкие, плавные, ease-out-quart"],
                  ["Сетка", "12 колонок, варьируемые отступы"],
                ]}
              />
            </Section>

            <Section id="palitra" icon={Palette} n="06" title="Цветовая палитра">
              <p>
                Тёмная база с тёплыми индиго-нейтралами. Акцент удерживается
                в пределах 15% поверхности.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PALETTE.map((c) => (
                  <div
                    key={c.hex}
                    className="rounded-xl border border-border/60 overflow-hidden bg-surface/40"
                  >
                    <div
                      className="h-24"
                      style={{ backgroundColor: c.hex }}
                      aria-hidden
                    />
                    <div className="p-3.5">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {c.hex}
                      </div>
                      <div className="text-sm mt-1 font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="struktura" icon={ListTree} n="07" title="Структура страниц">
              <p>
                Линейная структура с одним уровнем вложенности на отдельных
                страницах политик и кейсов.
              </p>
              <ol className="mt-6 flex flex-col rounded-xl overflow-hidden border border-border/60 divide-y divide-border/60">
                {[
                  ["01", "Главная", "/ — лендинг"],
                  ["02", "Кейс", "/cases/[slug]"],
                  ["03", "Услуга", "/services/[slug]"],
                  ["04", "Контакты", "/contacts"],
                  ["05", "Политика", "/legal/privacy"],
                ].map(([n, name, path]) => (
                  <li
                    key={n}
                    className="flex items-center gap-4 px-4 py-3.5 bg-background hover:bg-surface/40 transition-colors"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground w-6 shrink-0">
                      {n}
                    </span>
                    <span className="flex-1 text-sm">{name}</span>
                    <span className="font-mono text-[12px] text-primary-soft truncate">
                      {path}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            {/* Sign-off */}
            <div className="mt-16 pt-10 border-t border-border/60 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="nb-eyebrow mb-2">Согласовано</p>
                <p className="font-display text-xl">Вы и NeuralBrief AI</p>
              </div>
              <div className="font-mono text-xs text-muted-foreground space-y-1.5">
                <p>Хэш документа: a4f9·c81b·2e07·5d10</p>
                <p>Сгенерировано: 05.05.2026, 14:32</p>
                <p>Время сборки: 0 мин 0 сек</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

function Section({
  id,
  icon: Icon,
  n,
  title,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <Reveal>
      <section id={id} className="scroll-mt-24 py-10 first:pt-0 border-b border-border/60 last:border-b-0">
        <div className="flex items-center gap-3 mb-5">
          <span className="grid place-items-center size-9 rounded-lg border border-border/70 bg-surface/60 text-primary-soft">
            <Icon className="size-4" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            раздел {n}
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-[34px] tracking-tight font-medium leading-[1.05]">
          {title}
        </h2>
        <div className="mt-5 text-subtle-foreground leading-relaxed [&>p]:max-w-[68ch] [&>p+*]:mt-5 text-[15.5px]">
          {children}
        </div>
      </section>
    </Reveal>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="font-mono text-[11px] text-primary-soft mt-1.5 w-6 shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-foreground/90">{it}</span>
        </li>
      ))}
    </ul>
  )
}

function KeyValueGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border/60 bg-surface/30 p-5">
      {items.map(([k, v]) => (
        <div
          key={k}
          className="flex items-baseline gap-3 py-1 border-b border-border/30 last:border-b-0 sm:border-b-0"
        >
          <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground w-32 shrink-0">
            {k}
          </dt>
          <dd className="text-sm text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
