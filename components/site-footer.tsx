import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border mt-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-tight leading-tight text-balance">
              Журнал о том, как разговор
              <br />
              <span className="italic">превращается в задачу</span>.
            </p>
            <p className="mt-6 max-w-sm text-[15px] text-subtle-foreground leading-relaxed">
              NeuralBrief задумывался как дипломная работа и оказался
              рабочим инструментом для небольших веб-студий.
            </p>
          </div>

          <FooterCol
            className="md:col-span-2 md:col-start-7"
            title="Разделы"
            items={[
              { href: "/", label: "Главная" },
              { href: "/chat", label: "Диалог" },
              { href: "/brief", label: "Образец ТЗ" },
            ]}
          />
          <FooterCol
            className="md:col-span-2"
            title="Издание"
            items={[
              { href: "/about", label: "О журнале" },
              { href: "/about", label: "Метод" },
              { href: "/about", label: "Авторы" },
            ]}
          />
          <FooterCol
            className="md:col-span-3"
            title="Связаться"
            items={[
              { href: "mailto:hello@neuralbrief.app", label: "hello@neuralbrief.app" },
              { href: "#", label: "Telegram" },
              { href: "#", label: "GitHub" },
            ]}
          />
        </div>

        <div className="mt-16 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span className="font-mono tracking-wide">
            © 2026 · NEURALBRIEF · ВСЕ ПРАВА ЗАЩИЩЕНЫ
          </span>
          <span className="font-mono tracking-wide">
            ВЫПУСК № 01 · ВЕСНА · MMXXVI
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
  className,
}: {
  title: string
  items: { href: string; label: string }[]
  className?: string
}) {
  return (
    <div className={className}>
      <p className="nb-eyebrow mb-5">{title}</p>
      <ul className="flex flex-col gap-3 text-[14px]">
        {items.map((it, i) => (
          <li key={i}>
            <Link
              href={it.href}
              className="text-foreground nb-link"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
