"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { NeuralLogo } from "@/components/neural-logo"

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/chat", label: "Диалог" },
  { href: "/brief", label: "Пример ТЗ" },
  { href: "/about", label: "О системе" },
] as const

export function SiteNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/60"
          : "bg-transparent border-b border-transparent",
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="NeuralBrief — на главную"
        >
          <NeuralLogo className="h-7 w-7 transition-transform duration-500 group-hover:rotate-[18deg]" />
          <span className="font-display text-[17px] tracking-tight">
            Neural<span className="text-muted-foreground">Brief</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Основная навигация">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3.5 py-2 text-sm transition-colors duration-300",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute left-3.5 right-3.5 -bottom-px h-px origin-left transition-transform duration-500",
                    active
                      ? "bg-primary scale-x-100"
                      : "bg-foreground/30 scale-x-0 group-hover:scale-x-100",
                  )}
                  style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/chat"
            className="group relative inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-4 pr-2 py-1.5 text-sm font-medium transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            Попробовать
            <span className="grid place-items-center size-6 rounded-full bg-background/15 transition-transform duration-500 group-hover:translate-x-0.5">
              <ArrowIcon />
            </span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid place-items-center size-10 rounded-md border border-border/60 text-foreground"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2.5 rounded-md text-[15px] transition-colors",
                  pathname === item.href
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/60",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/chat"
              className="mt-2 inline-flex items-center justify-between rounded-full bg-foreground text-background px-4 py-2.5 text-sm font-medium"
            >
              Попробовать
              <ArrowIcon />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
