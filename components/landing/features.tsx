import Image from "next/image"
import { Reveal } from "@/components/reveal"
import { ConversationPreview } from "@/components/landing/conversation-preview"

/**
 * Editorial spread: an interview transcript on the left,
 * margin notes and an excerpt on the right. Then a printed
 * "table of contents" of features below.
 */
export function LandingFeatures() {
  return (
    <section className="relative border-b border-border">
      {/* SPREAD 01 — transcript + margin notes */}
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
        <Reveal>
          <header className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="nb-eyebrow mb-4">Глава I · Метод</p>
              <h2 className="font-display font-medium tracking-[-0.015em] text-[40px] sm:text-[52px] leading-[1.02] text-balance">
                NeuralBrief задаёт вопросы,
                <br />
                <span className="italic">а не заполняет анкету</span>.
              </h2>
            </div>
            <p className="nb-folio uppercase tracking-widest">стр. 04 — 05</p>
          </header>
        </Reveal>

        <div className="grid lg:grid-cols-12 gap-x-10 gap-y-12">
          <Reveal className="lg:col-span-7">
            <ConversationPreview />
          </Reveal>

          <Reveal className="lg:col-span-5 lg:pt-12" delay={120}>
            <div className="lg:border-l lg:border-border lg:pl-10">
              <p className="nb-eyebrow mb-4">Заметки на полях</p>
              <p className="nb-pullquote text-[28px] leading-[1.15] text-balance">
                «Если у вас интернет-магазин, я спрошу о категориях
                и оплате. Если лендинг — о целевом действии и
                <span className="text-primary"> УТП</span>. Без шаблонов».
              </p>
              <p className="mt-5 text-[14px] text-muted-foreground leading-relaxed">
                Каждый следующий вопрос зависит от предыдущего ответа,
                типа проекта и сложности задачи. Без вежливых формальностей.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6">
                <div>
                  <dt className="nb-folio uppercase tracking-widest">средняя длина</dt>
                  <dd className="mt-1.5 font-display text-2xl">8 — 12 вопросов</dd>
                </div>
                <div>
                  <dt className="nb-folio uppercase tracking-widest">время</dt>
                  <dd className="mt-1.5 font-display text-2xl">≈ 4 минуты</dd>
                </div>
                <div>
                  <dt className="nb-folio uppercase tracking-widest">сценариев</dt>
                  <dd className="mt-1.5 font-display text-2xl">37</dd>
                </div>
                <div>
                  <dt className="nb-folio uppercase tracking-widest">пропускает</dt>
                  <dd className="mt-1.5 font-display text-2xl">всё лишнее</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SPREAD 02 — table of contents of features */}
      <div className="border-t border-border bg-background-alt/40">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
          <Reveal>
            <header className="grid lg:grid-cols-12 gap-x-10 mb-14">
              <div className="lg:col-span-7">
                <p className="nb-eyebrow mb-4">Содержание · Что внутри</p>
                <h2 className="font-display font-medium tracking-[-0.015em] text-[40px] sm:text-[52px] leading-[1.02] text-balance">
                  Пять разделов, из которых
                  <br />
                  <span className="italic">собирается каждое ТЗ</span>.
                </h2>
              </div>
              <p className="lg:col-span-5 self-end text-[15px] text-subtle-foreground leading-relaxed max-w-md">
                NeuralBrief работает не как болтливый чат-бот, а как
                редактор: разделяет ответы по главам и не теряет
                ни одной важной детали.
              </p>
            </header>
          </Reveal>

          <ol className="border-t border-border">
            {ENTRIES.map((entry, i) => (
              <Reveal key={entry.title} delay={i * 60}>
                <TocRow {...entry} index={i + 1} />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      {/* SPREAD 03 — palette plate, like a printed colour swatch page */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-x-10 gap-y-12">
            <Reveal className="lg:col-span-5">
              <p className="nb-eyebrow mb-4">Иллюстрация · 02</p>
              <h3 className="font-display font-medium tracking-[-0.015em] text-[36px] leading-[1.05] text-balance">
                Палитра подбирается так же,
                <br />
                <span className="italic">как редактор подбирает обложку</span>.
              </h3>
              <p className="mt-5 max-w-md text-[15px] text-subtle-foreground leading-relaxed">
                Тон бренда, характер аудитории, отрасль. На выходе три,
                четыре или пять цветов с пояснением, зачем каждый из них
                нужен в макете.
              </p>
              <p className="mt-8 nb-folio uppercase tracking-widest">
                Пример для агентства недвижимости
              </p>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <div className="grid grid-cols-5 border border-border">
                {SWATCHES.map((s) => (
                  <div
                    key={s.hex}
                    className="border-r last:border-r-0 border-border"
                  >
                    <div
                      className="aspect-[3/4]"
                      style={{ backgroundColor: s.hex }}
                      aria-hidden
                    />
                    <div className="px-4 py-4 border-t border-border">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {s.hex}
                      </p>
                      <p className="mt-1.5 font-display text-[15px]">{s.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                        {s.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <figure className="mt-10 grid grid-cols-12 items-end gap-6">
                <div className="col-span-7 relative aspect-[5/4] overflow-hidden border border-border">
                  <Image
                    src="/editorial-sketch.jpg"
                    alt="Рукописные эскизы блоков сайта чёрной шариковой ручкой на бумаге"
                    fill
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="col-span-5 text-[13px] text-muted-foreground leading-relaxed">
                  <span className="block nb-folio uppercase tracking-widest mb-2">
                    фото 02
                  </span>
                  Прежде чем добраться до Figma, каждое ТЗ начинает свою
                  жизнь как набросок на полях блокнота.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

const ENTRIES = [
  {
    title: "Цели и задачи",
    text:
      "Уточняет, чего проект должен добиться через три месяца. Без расплывчатых формулировок «привлечь больше клиентов».",
    page: "стр. 06",
  },
  {
    title: "Аудитория и устройства",
    text:
      "Кому он нужен и откуда они приходят. Доли мобильного и десктопа, языки, география.",
    page: "стр. 09",
  },
  {
    title: "Функционал",
    text:
      "Список разделов и функций, разделённый на обязательные и желательные. С приоритетами и зависимостями.",
    page: "стр. 12",
  },
  {
    title: "Структура и навигация",
    text:
      "Карта сайта и блоки на каждой странице. Не вайрфрейм, но достаточный каркас, чтобы дизайнер начинал не с нуля.",
    page: "стр. 15",
  },
  {
    title: "Дизайн и стилистика",
    text:
      "Тон, ассоциации, палитра, типографика. Референсы, к которым стоит присмотреться, и те, которых стоит избегать.",
    page: "стр. 18",
  },
] as const

const SWATCHES = [
  { hex: "#1B1A17", name: "Графит", role: "основной текст" },
  { hex: "#A9794E", name: "Терракот", role: "акцент" },
  { hex: "#EFE7D6", name: "Кремовый", role: "фон" },
  { hex: "#445249", name: "Хвоя", role: "контраст" },
  { hex: "#C8B69A", name: "Песок", role: "вторичный" },
] as const

function TocRow({
  title,
  text,
  page,
  index,
}: {
  title: string
  text: string
  page: string
  index: number
}) {
  return (
    <li className="grid grid-cols-12 gap-x-6 items-baseline border-b border-border py-8 group transition-colors duration-500 hover:bg-background-alt/60">
      <span className="col-span-2 sm:col-span-1 font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
        № 0{index}
      </span>
      <h3 className="col-span-10 sm:col-span-4 font-display text-[24px] sm:text-[28px] tracking-tight font-medium">
        {title}
      </h3>
      <p className="col-span-12 sm:col-span-5 text-[15px] leading-relaxed text-subtle-foreground sm:pr-6 mt-2 sm:mt-0">
        {text}
      </p>
      <span className="col-span-12 sm:col-span-2 sm:text-right nb-folio uppercase tracking-widest mt-2 sm:mt-0">
        {page}
      </span>
    </li>
  )
}
