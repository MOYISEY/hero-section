"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const MODES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const

type ThemeMode = (typeof MODES)[number]["value"]

function resolveSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

function applyTheme(mode: ThemeMode) {
  const resolvedTheme = mode === "system" ? resolveSystemTheme() : mode

  document.documentElement.classList.toggle("light", resolvedTheme === "light")
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("neuralbrief.theme")
    const initialTheme: ThemeMode =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "dark"

    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)

    const media = window.matchMedia("(prefers-color-scheme: light)")
    const onSystemThemeChange = () => {
      if (localStorage.getItem("neuralbrief.theme") === "system") applyTheme("system")
    }

    media.addEventListener("change", onSystemThemeChange)

    return () => media.removeEventListener("change", onSystemThemeChange)
  }, [])

  function handleThemeChange(mode: ThemeMode) {
    setTheme(mode)
    localStorage.setItem("neuralbrief.theme", mode)
    applyTheme(mode)
  }

  if (!mounted) {
    return <div className="h-8 w-[104px] rounded-full border border-border bg-surface/40" />
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface/60 p-1">
      {MODES.map((mode) => {
        const Icon = mode.icon
        const active = theme === mode.value

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => handleThemeChange(mode.value)}
            className={active ? "grid size-7 place-items-center rounded-full bg-primary text-primary-foreground" : "grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"}
            aria-label={`Включить тему ${mode.label}`}
            title={mode.label}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
