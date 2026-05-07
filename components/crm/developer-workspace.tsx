"use client"

import { useEffect, useState } from "react"

type Task = {
  id: string
  title: string
  status: string
  repo: string
}

type CrmData = {
  tasks: Task[]
  events: string[]
  wiki: string[]
}

export function DeveloperWorkspace() {
  const [data, setData] = useState<CrmData>({ tasks: [], events: [], wiki: [] })

  useEffect(() => {
    fetch("/api/crm")
      .then((response) => response.json())
      .then((nextData) => setData({ tasks: nextData.tasks, events: nextData.events, wiki: nextData.wiki }))
      .catch(() => undefined)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {data.tasks.length ? (
          data.tasks.map((task) => (
            <article key={task.id} className="rounded-3xl border border-border bg-surface p-5 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{task.id}</p>
                  <h2 className="mt-3 font-display text-3xl leading-tight">{task.title}</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Финальное техническое задание доступно только для чтения. Изменения вносит менеджер после согласования с клиентом.
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  {task.status}
                </span>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {['В работе', 'На проверке', 'Готово'].map((status) => (
                  <button key={status} className="rounded-2xl border border-border bg-background-alt px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary">
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="nb-eyebrow">repository</p>
                  <p className="mt-3 break-words text-sm text-muted-foreground">{task.repo}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="nb-eyebrow">time tracker</p>
                  <button className="mt-3 rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">
                    Начать работу
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-surface p-6 text-sm leading-6 text-muted-foreground">
            Назначенных задач пока нет. Они появятся здесь после решения менеджера.
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <p className="nb-eyebrow">notifications</p>
          <h2 className="mt-2 font-display text-2xl">Лента событий</h2>
          <div className="mt-5 space-y-3">
            {data.events.length ? (
              data.events.map((event) => (
                <div key={event} className="rounded-2xl border border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                  {event}
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
          <p className="nb-eyebrow">wiki</p>
          <h2 className="mt-2 font-display text-2xl">База знаний</h2>
          <div className="mt-5 space-y-3">
            {data.wiki.length ? (
              data.wiki.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                  {item}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                База знаний пока пустая.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
