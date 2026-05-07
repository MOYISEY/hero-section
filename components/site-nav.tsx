"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthStatus } from "@/components/auth/auth-status"

const NAV = [
  { href: "/", label: "Главная", num: "01" },
  { href: "/chat", label: "Диалог", num: "02" },
  { href: "/brief", label: "Образец ТЗ", num: "03" },
  { href: "/manager", label: "Менеджер", num: "04", role: "manager" },
  { href: "/developer", label: "Разработчик", num: "05", role: "developer" },
  { href: "/about", label: "О системе", num: "06" },
] as const

export function SiteNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setRole(data.role))
      .catch(() => undefined)
  }, [pathname])

  const navItems = NAV.filter((item) => !("role" in item) || item.role === role)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 border-b",
        scrolled ? "bg-background/95 border-border" : "bg-background border-border/60",
      )}
    >
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8 h-14 flex items-center justify-between gap-5">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="NeuralBrief — на главную"
        >
          <span aria-hidden className="nb-status-dot" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            v.01 / 2026
          </span>
          <span aria-hidden className="h-3 w-px bg-border" />
          <span className="font-display text-[19px] tracking-tight font-medium leading-none">
            NeuralBrief
          </span>
        </Link>

        <nav
          className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-4 lg:gap-5"
          aria-label="Основная навигация"
        >
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] transition-colors duration-300 lg:text-[13px]",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground/70">
                  {item.num}
                </span>
                <span className="relative">
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 right-0 -bottom-1 h-px origin-left transition-transform duration-500",
                      active ? "bg-foreground scale-x-100" : "bg-foreground/40 scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="hidden shrink-0 md:flex items-center gap-2.5">
          <AuthStatus />
          <ThemeToggle />
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 whitespace-nowrap text-[12px] font-medium text-foreground lg:text-[13px]"
          >
            <span className="nb-link">Начать диалог</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid place-items-center size-10 -mr-2 text-foreground"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-6 py-4 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-baseline gap-3 py-3 border-b border-border/60 last:border-0 text-[16px]",
                  pathname === item.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground/70 w-6">
                  {item.num}
                </span>
                <span className="font-display">{item.label}</span>
              </Link>
            ))}
            <div className="mt-4">
              <ThemeToggle />
            </div>
            <div className="mt-4">
              <AuthStatus />
            </div>
            <Link
              href="/chat"
              className="mt-4 inline-flex items-center justify-between bg-primary text-primary-foreground px-5 py-3 text-[14px] font-medium"
            >
              Начать диалог
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
