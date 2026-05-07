"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

type Role = {
  key: "client" | "manager" | "developer"
  title: string
  text: string
  href: string
}

const roles: Role[] = [
  { key: "client", title: "Client", text: "Личный профиль, история заказов и чат с ИИ для генерации ТЗ.", href: "/chat" },
  { key: "manager", title: "Manager", text: "Мониторинг активных чатов, перехват диалога и отправка ТЗ разработчикам.", href: "/manager" },
  { key: "developer", title: "Developer", text: "Назначенные задачи, командные чаты, уведомления и статусы разработки.", href: "/developer" },
]

export function RoleLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingRole, setLoadingRole] = useState<string | null>(null)
  const next = searchParams.get("next")

  async function login(role: Role) {
    setLoadingRole(role.key)

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role.key }),
    })

    if (!response.ok) {
      setLoadingRole(null)
      return
    }

    router.push(next || role.href)
    router.refresh()
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.key}
            type="button"
            onClick={() => login(role)}
            className="flex min-h-56 flex-col justify-between rounded-2xl border border-border bg-background-alt p-5 text-left transition-colors hover:border-primary"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">role</p>
              <h2 className="mt-3 font-display text-2xl">{role.title}</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{role.text}</p>
            </div>
            <span className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-foreground">
              {loadingRole === role.key ? "Вход..." : "Войти →"}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
