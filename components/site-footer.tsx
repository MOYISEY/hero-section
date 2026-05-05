import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border mt-24">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 pt-16 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-tight leading-tight text-balance">
              Система, которая превращает
              <br />
              <span className="text-primary">разговор в задачу</span>.
            </p>
            <p className="mt-6 max-w-sm text-[15px] text-subtle-foreground leading-relaxed">
              NeuralBrief задумывался как дипломная работа и оказался
              рабочим инструментом для небольших веб-студий.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] uppercase text-muted-foreground">
              <span aria-hidden className="nb-status-dot" />
              <span>SYSTEM ONLINE</span>
            </div>
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
            title="Проект"
            items={[
              { href: "/about", label: "О системе" },
              { href: "/about", label: "Метод" },
              { href: "/about", label: "Команда" },
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
            BUILD 01.2026 · NODE.MOSCOW
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
