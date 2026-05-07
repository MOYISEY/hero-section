"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { FormEvent } from "react"
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
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role["key"]>("client")
  const [error, setError] = useState("")
  const [loadingForm, setLoadingForm] = useState(false)
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

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoadingForm(true)

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: selectedRole,
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || "Не удалось выполнить вход")
      setLoadingForm(false)
      return
    }

    const role = data?.user?.role || selectedRole
    const target = role === "manager" ? "/manager" : role === "developer" ? "/developer" : "/chat"

    router.push(next || target)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submitForm} className="rounded-3xl border border-border bg-surface p-5 md:p-8">
        <div className="mb-6 flex rounded-full border border-border bg-background-alt p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={mode === item ? "flex-1 rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground" : "flex-1 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"}
            >
              {item === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {mode === "register" && (
            <label className="grid gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Имя</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="Ваше имя" />
            </label>
          )}

          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="user@example.com" />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Пароль</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="Минимум 6 символов" />
          </label>

          {mode === "register" && (
            <label className="grid gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Роль</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value as Role["key"])} className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary">
                {roles.map((role) => (
                  <option key={role.key} value={role.key}>{role.title}</option>
                ))}
              </select>
            </label>
          )}

          {error && <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

          <button type="submit" className="rounded-full bg-primary px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground">
            {loadingForm ? "Проверка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-border bg-surface p-5 md:p-8">
        <p className="nb-eyebrow mb-4">demo quick access</p>
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
    </div>
  )
}
