import Link from "next/link"
import { NeuralLogo } from "@/components/neural-logo"

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 mt-24">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <NeuralLogo className="h-7 w-7" />
              <span className="font-display text-lg tracking-tight">
                Neural<span className="text-muted-foreground">Brief</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              Превращаем диалог в готовое техническое задание. Без таблиц
              в Excel и встреч на два часа.
            </p>
            <p className="mt-6 nb-eyebrow">Дипломный проект, 2026</p>
          </div>

          <FooterCol
            title="Продукт"
            items={[
              { href: "/", label: "Главная" },
              { href: "/chat", label: "Диалог с AI" },
              { href: "/brief", label: "Пример ТЗ" },
            ]}
          />
          <FooterCol
            title="Компания"
            items={[
              { href: "/about", label: "О системе" },
              { href: "/about", label: "Как это работает" },
              { href: "/about", label: "Команда" },
            ]}
          />
          <FooterCol
            title="Связаться"
            items={[
              { href: "mailto:hello@neuralbrief.app", label: "hello@neuralbrief.app" },
              { href: "#", label: "Telegram" },
              { href: "#", label: "GitHub" },
            ]}
          />
        </div>

        <div className="mt-14 pt-6 border-t border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <span>© 2026 NeuralBrief. Все права защищены.</span>
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-success" />
            Все системы работают
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
}: {
  title: string
  items: { href: string; label: string }[]
}) {
  return (
    <div>
      <p className="nb-eyebrow mb-4">{title}</p>
      <ul className="flex flex-col gap-2.5 text-sm">
        {items.map((it, i) => (
          <li key={i}>
            <Link
              href={it.href}
              className="text-subtle-foreground hover:text-foreground transition-colors duration-300"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
