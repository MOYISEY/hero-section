import Image from "next/image"
import Link from "next/link"

export function LandingHero() {
  return (
    <section className="relative border-b border-border">
      {/* Magazine masthead */}
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-6 pb-4 flex items-center justify-between text-[11px] font-mono tracking-[0.16em] uppercase text-muted-foreground border-b border-border/60">
        <span>NeuralBrief · Выпуск № 01</span>
        <span className="hidden sm:inline">Москва · Весна MMXXVI</span>
        <span>стр. 01</span>
      </div>

      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12">
          {/* LEFT — editorial column */}
          <div className="lg:col-span-7">
            <p className="nb-eyebrow mb-8">Полевые заметки · 01</p>

            <h1 className="font-display font-medium tracking-[-0.02em] leading-[0.96] text-[52px] sm:text-[72px] lg:text-[104px] text-balance">
              Разговор,
              <br />
              превращённый
              <br />
              <span className="italic font-normal">в задачу</span>.
            </h1>

            <div className="mt-12 grid sm:grid-cols-12 gap-x-6 gap-y-8 max-w-[820px]">
              <p className="sm:col-span-7 text-[17px] leading-[1.55] text-foreground">
                <span className="float-left font-display text-[58px] leading-[0.85] mr-2 mt-1 text-primary">
                  В
                </span>
                едь техническое задание начинается не с шаблона в Excel,
                а с честного разговора о цели. NeuralBrief задаёт
                вопросы, которые задал бы внимательный арт-директор,
                и сводит ответы в один документ.
              </p>
              <div className="sm:col-span-5 sm:border-l sm:border-border sm:pl-6 flex flex-col gap-3">
                <p className="nb-folio uppercase tracking-widest">От редакции</p>
                <p className="text-[14px] leading-relaxed text-subtle-foreground">
                  Инструмент для небольших студий, которым надоело
                  тратить два часа на созвон, чтобы получить десять
                  пунктов в блокноте.
                </p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/chat"
                className="group inline-flex items-baseline gap-3 text-foreground"
              >
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  →
                </span>
                <span className="font-display italic text-2xl">
                  <span className="nb-link">Начать диалог</span>
                </span>
              </Link>
              <Link
                href="/brief"
                className="inline-flex items-baseline gap-3 text-subtle-foreground hover:text-foreground transition-colors duration-300"
              >
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  стр. 24
                </span>
                <span className="text-[15px] nb-link">
                  Прочитать готовое ТЗ
                </span>
              </Link>
            </div>
          </div>

          {/* RIGHT — editorial photograph with caption */}
          <figure className="lg:col-span-5 self-end">
            <div className="relative aspect-[4/5] overflow-hidden bg-background-alt">
              <Image
                src="/editorial-desk.jpg"
                alt="Открытый блокнот с рукописными заметками и эскизами на деревянном столе, кружка кофе, в тёплом дневном свете"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 ring-1 ring-foreground/[0.04]"
              />
            </div>
            <figcaption className="mt-4 flex items-baseline gap-3 text-[12px] text-muted-foreground">
              <span className="font-mono tracking-widest uppercase">фото 01</span>
              <span className="leading-snug">
                Так выглядит исходный материал любого ТЗ, пока
                NeuralBrief не приведёт его в порядок.
              </span>
            </figcaption>
          </figure>
        </div>

        {/* Bottom rule with key facts, like a magazine deck */}
        <div className="mt-20 grid sm:grid-cols-3 border-y border-border divide-y sm:divide-y-0 sm:divide-x divide-border">
          {[
            { k: "В среднем", v: "5 минут", d: "вместо двух часов созвонов" },
            { k: "Точность", v: "98%", d: "клиентов согласовали ТЗ с первого раза" },
            { k: "Вопросов", v: "8 — 12", d: "ровно столько, сколько нужно" },
          ].map((item, i) => (
            <div
              key={item.k}
              className="py-7 sm:px-7 first:sm:pl-0 last:sm:pr-0 flex items-baseline gap-5"
            >
              <span className="font-mono text-[11px] text-muted-foreground tracking-[0.16em] uppercase shrink-0 w-7">
                0{i + 1}
              </span>
              <div>
                <p className="nb-eyebrow mb-1">{item.k}</p>
                <p className="font-display text-[28px] tracking-tight leading-none">
                  {item.v}
                </p>
                <p className="mt-1.5 text-[13px] text-subtle-foreground leading-snug">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
