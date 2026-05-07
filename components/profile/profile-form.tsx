"use client"

import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"

const roleLabels: Record<string, string> = {
  client: "Пользователь",
  manager: "Менеджер",
  developer: "Разработчик",
  director: "Директор",
}

type User = {
  id: string
  email: string
  name: string
  role: string
  specialization: string | null
  avatar_url: string | null
}

export function ProfileForm() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          setName(data.user.name)
          setAvatarUrl(data.user.avatar_url || "")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatarUrl }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Не удалось сохранить профиль", {
        description: data?.error || "Проверьте данные и попробуйте ещё раз.",
      })
      setSaving(false)
      return
    }

    setUser(data.user)
    setSaving(false)
    toast.success("Профиль обновлён")
  }

  if (loading) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-sm text-muted-foreground">Загрузка профиля...</div>
  }

  if (!user) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-sm text-muted-foreground">Войдите в аккаунт, чтобы открыть профиль.</div>
  }

  const role = roleLabels[user.role] || "Пользователь"

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center text-center">
          <div className="grid size-36 place-items-center overflow-hidden rounded-full border border-border bg-background-alt font-display text-5xl text-muted-foreground">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="size-full object-cover" />
            ) : (
              user.name.slice(0, 1).toUpperCase()
            )}
          </div>
          <h2 className="mt-5 font-display text-3xl">{user.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{user.name} · {role}</p>
          {user.specialization && <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{user.specialization}</p>}
          <p className="mt-5 break-all text-xs text-muted-foreground">{user.email}</p>
        </div>
      </aside>

      <form onSubmit={saveProfile} className="rounded-3xl border border-border bg-surface p-6 md:p-8">
        <p className="nb-eyebrow">profile settings</p>
        <h1 className="mt-3 font-display text-4xl">Настройки профиля</h1>
        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Имя</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="Ваше имя" />
          </label>
          <label className="grid gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Фото профиля URL</span>
            <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} className="rounded-2xl border border-border bg-background-alt px-4 py-3 outline-none transition-colors focus:border-primary" placeholder="https://example.com/avatar.jpg" />
          </label>
          <button type="submit" className="rounded-full bg-primary px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground disabled:opacity-60" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить профиль"}
          </button>
        </div>
      </form>
    </div>
  )
}
