"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const labels: Record<string, string> = {
  client: "Пользователь",
  manager: "Менеджер",
  developer: "Разработчик",
  director: "Директор",
}

type User = {
  name: string
  role: string
}

export function AuthStatus() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        setRole(data.role)
        setUser(data.user || null)
      })
      .catch(() => undefined)
  }, [pathname])

  if (!role) {
    return (
      <Link href="/login" className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
        Войти
      </Link>
    )
  }

  return (
    <Link
      href="/profile"
      className="whitespace-nowrap rounded-full border border-border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive lg:text-[10px]"
    >
      {user?.name || labels[role] || role} · {labels[role] || role}
    </Link>
  )
}
