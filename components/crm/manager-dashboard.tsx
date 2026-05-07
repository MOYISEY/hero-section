"use client"

import { useEffect, useState } from "react"

type Chat = {
  id: string
  client: string
  state: string
  tone: string
}

type Developer = {
  id: string
  name: string
  stack: string
  load: string
}

type CrmData = {
  chats: Chat[]
  developers: Developer[]
}

const fallbackData: CrmData = {
  chats: [
    { id: "demo-1", client: "Клиент A", state: "ИИ уточняет функции", tone: "stable" },
    { id: "demo-2", client: "Клиент B", state: "Нужен перехват менеджера", tone: "warning" },
  ],
  developers: [
    { id: "dev-1", name: "Frontend developer", stack: "React / UI", load: "Свободен" },
    { id: "dev-2", name: "Backend developer", stack: "Node.js / PostgreSQL", load: "В работе" },
  ],
}

export function ManagerDashboard() {
  const [data, setData] = useState<CrmData>(fallbackData)

  useEffect(() => {
    fetch("/api/crm")
      .then((response) => response.json())
      .then((nextData) => setData({ chats: nextData.chats, developers: nextData.developers }))
      .catch(() => undefined)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="nb-eyebrow">active ai chats</p>
            <h2 className="mt-2 font-display text-2xl">Сетка активных чатов</h2>
          </div>
          <button className="self-start rounded-full bg-primary px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground md:self-auto">
            Отправить разработчикам
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.chats.map((chat) => (
            <article key={chat.id} className="min-h-56 rounded-2xl border border-border bg-background-alt p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="font-display text-xl">{chat.client}</p>
                <span className={chat.tone === "warning" ? "rounded-full border border-warning/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-warning" : "rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary"}>
                  live
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{chat.state}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">Открыть</button>
                <button className="rounded-full border border-destructive/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">Остановить ИИ</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <p className="nb-eyebrow">team resources</p>
          <h2 className="mt-2 font-display text-2xl">Разработчики</h2>
          <div className="mt-5 space-y-4">
            {data.developers.map((developer) => (
              <div key={developer.id} className="rounded-2xl border border-border bg-background-alt p-4">
                <p className="font-display text-lg">{developer.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{developer.stack}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{developer.load}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
