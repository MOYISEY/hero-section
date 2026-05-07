"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { FormEvent } from "react"
import { useState } from "react"

export function RoleLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loadingForm, setLoadingForm] = useState(false)
  const next = searchParams.get("next")

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
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      setError(data?.error || "Не удалось выполнить вход")
      setLoadingForm(false)
      return
    }

    const role = data?.user?.role || "client"
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
              <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="Ваше имя" />
            </label>
          )}

          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Email</span>
            <input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="user@example.com" />
          </label>

          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Пароль</span>
            <input required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="Минимум 6 символов" />
          </label>

          {error && <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

          <button type="submit" className="rounded-full bg-primary px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground">
            {loadingForm ? "Проверка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </div>
      </form>
    </div>
  )
}
