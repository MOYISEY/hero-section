"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type RequestItem = {
  id: string
  title: string
  brief_text: string | null
  status: string
  client_name: string
  client_email: string | null
}

type Developer = {
  id: string
  name: string
  stack: string
  load: string
}

type Notification = {
  id: string
  title: string
  body: string | null
}

type CrmData = {
  requests: RequestItem[]
  developers: Developer[]
  notifications: Notification[]
}

export function ManagerDashboard() {
  const [data, setData] = useState<CrmData>({ requests: [], developers: [], notifications: [] })
  const [selectedDevelopers, setSelectedDevelopers] = useState<Record<string, string>>(        {})
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  function loadData() {
    fetch("/api/crm")
      .then((response) => response.json())
      .then((nextData) => setData({ requests: nextData.requests || [], developers: nextData.developers || [], notifications: nextData.notifications || [] }))
      .catch(() => undefined)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function reviewProject(projectId: string, action: "approve" | "reject") {
    setLoadingAction(`${action}:${projectId}`)

    const response = await fetch("/api/manager/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action, developerId: selectedDevelopers[projectId] }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Не удалось обработать заявку", {
        description: result?.error || "Попробуйте ещё раз.",
      })
      setLoadingAction(null)
      return
    }

    toast.success(action === "approve" ? "Заявка принята" : "Заявка отклонена")
    setLoadingAction(null)
    loadData()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
        <div className="mb-5">
          <p className="nb-eyebrow">brief requests</p>
          <h2 className="mt-2 font-display text-2xl">Заявки на рассмотрение</h2>
        </div>
        <div className="grid gap-4">
          {data.requests.length ? (
            data.requests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-display text-xl">{request.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{request.client_name}{request.client_email ? ` · ${request.client_email}` : ""}</p>
                  </div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">new</span>
                </div>
                <p className="mt-5 line-clamp-4 text-sm leading-6 text-muted-foreground">{request.brief_text || "ТЗ без текста"}</p>
                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <select
                    value={selectedDevelopers[request.id] || ""}
                    onChange={(event) => setSelectedDevelopers((current) => ({ ...current, [request.id]: event.target.value }))}
                    className="rounded-full border border-border bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground outline-none"
                  >
                    <option value="">Выберите разработчика</option>
                    {data.developers.map((developer) => (
                      <option key={developer.id} value={developer.id}>{developer.name} · {developer.stack}</option>
                    ))}
                  </select>
                  <button onClick={() => reviewProject(request.id, "approve")} className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">
                    {loadingAction === `approve:${request.id}` ? "..." : "Принять"}
                  </button>
                  <button onClick={() => reviewProject(request.id, "reject")} className="rounded-full border border-destructive/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {loadingAction === `reject:${request.id}` ? "..." : "Отклонить"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm leading-6 text-muted-foreground">
              Новых заявок пока нет. Они появятся здесь после отправки ТЗ клиентом.
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <p className="nb-eyebrow">notifications</p>
          <h2 className="mt-2 font-display text-2xl">Уведомления</h2>
          <div className="mt-5 space-y-4">
            {data.notifications.length ? (
              data.notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="font-display text-lg">{notification.title}</p>
                  {notification.body && <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.body}</p>}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                Уведомлений пока нет.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <p className="nb-eyebrow">team resources</p>
          <h2 className="mt-2 font-display text-2xl">Разработчики</h2>
          <div className="mt-5 space-y-4">
            {data.developers.length ? (
              data.developers.map((developer) => (
                <div key={developer.id} className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="font-display text-lg">{developer.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{developer.stack}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{developer.load}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                Реальные разработчики ещё не добавлены директором.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
