"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type DirectorData = {
  stats?: { active_projects: number; done_projects: number; active_tasks: number; average_rating: string | number }
  usersByRole: { role: string; count: number }[]
  users: { id: string; email: string; name: string; role: string; is_banned: boolean; status: string }[]
  auditLog: { id: string; action: string; actor_name: string | null; target_name: string | null; created_at: string }[]
  projects: { id: string; title: string; status: string; is_released: boolean; client_name: string | null; manager_name: string | null }[]
}

export function DirectorDashboard() {
  const [data, setData] = useState<DirectorData>({ usersByRole: [], users: [], auditLog: [], projects: [] })
  const [loading, setLoading] = useState<string | null>(null)

  function loadData() {
    fetch("/api/director/dashboard")
      .then((response) => response.json())
      .then((nextData) => setData({ usersByRole: nextData.usersByRole || [], users: nextData.users || [], auditLog: nextData.auditLog || [], projects: nextData.projects || [], stats: nextData.stats }))
      .catch(() => undefined)
  }

  useEffect(() => { loadData() }, [])

  async function manageUser(userId: string, action: "set_role" | "ban" | "unban" | "soft_delete", role?: string) {
    setLoading(`${action}:${userId}`)
    const response = await fetch("/api/director/users/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role }),
    })
    const result = await response.json().catch(() => null)
    setLoading(null)

    if (!response.ok) {
      toast.error("Не удалось обновить пользователя", { description: result?.error || "Попробуйте ещё раз." })
      return
    }

    toast.success("Пользователь обновлён")
    loadData()
  }

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-8">
        <p className="nb-eyebrow">director dashboard</p>
        <h1 className="mt-3 font-display text-4xl">Панель директора</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[{ label: "Активные проекты", value: data.stats?.active_projects ?? 0 }, { label: "Активные задачи", value: data.stats?.active_tasks ?? 0 }, { label: "Готовые проекты", value: data.stats?.done_projects ?? 0 }, { label: "Средняя оценка", value: data.stats?.average_rating ?? 0 }].map((item) => (
          <div key={item.label} className="rounded-3xl border border-border bg-surface p-5">
            <p className="nb-eyebrow">{item.label}</p>
            <p className="mt-3 font-display text-4xl">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <h2 className="font-display text-2xl">Пользователи</h2>
          <div className="mt-5 grid gap-3">
            {data.users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-border bg-background-alt p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-display text-lg">{user.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{user.email} · {user.role} · {user.is_banned ? "заблокирован" : user.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["client", "manager", "developer"].map((role) => <button key={role} onClick={() => manageUser(user.id, "set_role", role)} className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">{role}</button>)}
                    <button onClick={() => manageUser(user.id, user.is_banned ? "unban" : "ban")} className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">{loading === `ban:${user.id}` ? "..." : user.is_banned ? "Разбан" : "Бан"}</button>
                    <button onClick={() => manageUser(user.id, "soft_delete")} className="rounded-full border border-destructive/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">Удалить</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <h2 className="font-display text-2xl">Роли</h2>
            <div className="mt-5 space-y-3">{data.usersByRole.map((item) => <div key={item.role} className="flex justify-between rounded-2xl border border-border bg-background-alt p-4"><span>{item.role}</span><span>{item.count}</span></div>)}</div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <h2 className="font-display text-2xl">Audit log</h2>
            <div className="mt-5 space-y-3">{data.auditLog.map((item) => <div key={item.id} className="rounded-2xl border border-border bg-background-alt p-4 text-sm"><p>{item.action}</p><p className="mt-1 text-muted-foreground">{item.actor_name || "Система"} → {item.target_name || "объект"}</p></div>)}</div>
          </section>
        </aside>
      </div>
    </div>
  )
}
