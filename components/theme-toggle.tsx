"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

const MODES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            onClick={() => setTheme(mode.value)}
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
