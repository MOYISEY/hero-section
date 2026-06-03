"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { NotificationList } from "@/components/crm/notification-list"

type RequestItem = { id: string; title: string; brief_text: string | null; status: string; client_name: string; client_email: string | null }
type Developer = { id: string; name: string; stack: string; load: string }
type Notification = { id: string; title: string; body: string | null; read_at?: string | null }
type ManagerTask = { id: string; short_id: string; project_id: string; title: string; description: string | null; status: string; raw_status: string; repo: string; trello_card_url: string | null; developer_name: string | null; project_title: string; project_status: string }
type ProjectReview = { id: string; rating: number; comment: string | null; project_title: string; client_name: string | null; created_at: string }
type BoardTask = { id: string; short_id: string; title: string; description: string | null; status: string; trello_card_url: string | null; repository_url: string | null; project_title: string; client_name: string | null; developer_name: string | null }
type CrmData = { requests: RequestItem[]; developers: Developer[]; notifications: Notification[]; managerTasks: ManagerTask[]; reviews: ProjectReview[]; board: BoardTask[] }

const boardColumns = [
  { key: "todo", title: "Задачи" },
  { key: "in_progress", title: "В работе" },
  { key: "review", title: "На проверке" },
  { key: "done", title: "Готово" },
]

export function ManagerDashboard() {
  const [data, setData] = useState<CrmData>({ requests: [], developers: [], notifications: [], managerTasks: [], reviews: [], board: [] })
  const [selectedDevelopers, setSelectedDevelopers] = useState<Record<string, string>>({})
  const [returnComments, setReturnComments] = useState<Record<string, string>>({})
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  function loadData() {
    fetch("/api/crm")
      .then((response) => response.json())
      .then((nextData) => setData({ requests: nextData.requests || [], developers: nextData.developers || [], notifications: nextData.notifications || [], managerTasks: nextData.managerTasks || [], reviews: nextData.reviews || [], board: nextData.board || [] }))
      .catch(() => undefined)
  }

  useEffect(() => { loadData() }, [])

  async function reviewProject(projectId: string, action: "approve" | "reject") {
    setLoadingAction(`${action}:${projectId}`)
    const response = await fetch("/api/manager/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action, developerId: selectedDevelopers[projectId] }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      toast.error("Не удалось обработать заявку", { description: result?.error || "Попробуйте ещё раз." })
      setLoadingAction(null)
      return
    }
    toast.success(action === "approve" ? "Заявка отправлена разработчику" : "Заявка отклонена")
    setLoadingAction(null)
    loadData()
  }

  async function closeTask(projectId: string) {
    setLoadingAction(`close:${projectId}`)
    const response = await fetch("/api/manager/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action: "close_task" }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      toast.error("Не удалось закрыть задачу", { description: result?.error || "Проект ещё не готов к закрытию." })
      setLoadingAction(null)
      return
    }
    toast.success("Задача закрыта")
    setLoadingAction(null)
    loadData()
  }

  async function returnTask(projectId: string) {
    const comment = returnComments[projectId]?.trim() || ""
    if (!comment) {
      toast.error("Напишите комментарий для разработчика")
      return
    }
    setLoadingAction(`return:${projectId}`)
    const response = await fetch("/api/manager/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action: "return_task", comment }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      toast.error("Не удалось вернуть задачу", { description: result?.error || "Попробуйте ещё раз." })
      setLoadingAction(null)
      return
    }
    toast.success("Задача возвращена разработчику")
    setLoadingAction(null)
    setReturnComments((current) => ({ ...current, [projectId]: "" }))
    loadData()
  }

  async function deleteDone(projectId: string) {
    setLoadingAction(`delete:${projectId}`)
    const response = await fetch("/api/manager/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action: "delete_done" }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok) {
      toast.error("Не удалось убрать задачу", { description: result?.error || "Можно убрать только закрытую задачу." })
      setLoadingAction(null)
      return
    }
    toast.success("Готовая задача убрана из списка")
    setLoadingAction(null)
    loadData()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div><p className="nb-eyebrow">task board</p><h2 className="mt-2 font-display text-2xl">Доска задач</h2></div>
            <button type="button" onClick={loadData} className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground">Обновить</button>
          </div>
          <div className="grid gap-4 xl:grid-cols-4">
            {boardColumns.map((column) => {
              const tasks = data.board.filter((task) => task.status === column.key)
              return (
                <div key={column.key} className="rounded-2xl border border-border bg-background-alt p-4">
                  <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg">{column.title}</h3><span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] text-primary">{tasks.length}</span></div>
                  <div className="space-y-3">
                    {tasks.length ? tasks.map((task) => (
                      <article key={task.id} className="rounded-xl border border-border/70 bg-surface p-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{task.short_id}</p>
                        <p className="mt-2 font-display text-base">{task.title}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Разработчик: {task.developer_name || "Не назначен"}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Клиент: {task.client_name || "Не указан"}</p>
                        {task.trello_card_url && <a href={task.trello_card_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary">Открыть Trello</a>}
                      </article>
                    )) : <div className="rounded-xl border border-dashed border-border bg-surface/40 p-4 text-sm text-muted-foreground">Пусто</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-5"><p className="nb-eyebrow">brief requests</p><h2 className="mt-2 font-display text-2xl">Заявки на рассмотрение</h2></div>
          <div className="grid gap-4">
            {data.requests.length ? data.requests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div><p className="font-display text-xl">{request.title}</p><p className="mt-2 text-sm text-muted-foreground">{request.client_name}{request.client_email ? ` · ${request.client_email}` : ""}</p></div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">new</span>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{request.brief_text || "ТЗ без текста"}</p>
                <Link href={`/manager/chats?projectId=${request.id}&channel=manager_client`} className="mt-5 inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
                  Открыть переписку
                </Link>
                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                  <select value={selectedDevelopers[request.id] || ""} onChange={(event) => setSelectedDevelopers((current) => ({ ...current, [request.id]: event.target.value }))} className="rounded-full border border-border bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground outline-none">
                    <option value="">Выберите разработчика</option>
                    {data.developers.map((developer) => <option key={developer.id} value={developer.id}>{developer.name} · {developer.stack}</option>)}
                  </select>
                  <button onClick={() => reviewProject(request.id, "approve")} className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">{loadingAction === `approve:${request.id}` ? "..." : "Принять"}</button>
                  <button onClick={() => reviewProject(request.id, "reject")} className="rounded-full border border-destructive/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">{loadingAction === `reject:${request.id}` ? "..." : "Отклонить"}</button>
                </div>
              </article>
            )) : <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm leading-6 text-muted-foreground">Новых заявок пока нет. Они появятся здесь после отправки ТЗ клиентом.</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-5"><p className="nb-eyebrow">developer tasks</p><h2 className="mt-2 font-display text-2xl">Задачи разработчиков</h2></div>
          <div className="grid gap-4">
            {data.managerTasks.length ? data.managerTasks.map((task) => (
              <article key={task.id} className="rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div><p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{task.short_id}</p><h3 className="mt-2 font-display text-xl">{task.title}</h3><p className="mt-1 text-sm text-muted-foreground">Разработчик: {task.developer_name || "Не назначен"}</p></div>
                  <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{task.status}</span>
                </div>
                <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{task.description || "Описание отсутствует"}</p>
                <p className="mt-4 break-words text-xs text-muted-foreground">Repo: {task.repo || "Не прикреплён"}</p>
                <Link href={`/manager/chats?projectId=${task.project_id}&channel=manager_developer`} className="mt-5 inline-flex rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
                  Открыть переписку
                </Link>
                {task.project_status === "review" && (
                  <div className="mt-5 grid gap-3">
                    <input value={returnComments[task.project_id] || ""} onChange={(event) => setReturnComments((current) => ({ ...current, [task.project_id]: event.target.value }))} placeholder="Комментарий для возврата разработчику" className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary" />
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => returnTask(task.project_id)} className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
                        {loadingAction === `return:${task.project_id}` ? "..." : "Вернуть на доработку"}
                      </button>
                      <button onClick={() => closeTask(task.project_id)} className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">
                        {loadingAction === `close:${task.project_id}` ? "..." : "Закрыть задачу"}
                      </button>
                    </div>
                  </div>
                )}
                {task.project_status === "done" && (
                  <button onClick={() => deleteDone(task.project_id)} className="mt-5 rounded-full border border-destructive/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">
                    {loadingAction === `delete:${task.project_id}` ? "..." : "Убрать готовую задачу"}
                  </button>
                )}
              </article>
            )) : <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm leading-6 text-muted-foreground">Назначенных задач пока нет.</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-5"><p className="nb-eyebrow">client reviews</p><h2 className="mt-2 font-display text-2xl">Отзывы клиентов</h2></div>
          <div className="grid gap-4">
            {data.reviews.length ? data.reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl">{review.project_title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Клиент: {review.client_name || "Не указан"}</p>
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1 font-mono text-[10px] text-primary-foreground">{review.rating}/5</span>
                </div>
                {review.comment && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">{review.comment}</p>}
              </article>
            )) : <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm leading-6 text-muted-foreground">Отзывов по вашим проектам пока нет.</div>}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6"><p className="nb-eyebrow">notifications</p><h2 className="mt-2 font-display text-2xl">Уведомления</h2><NotificationList items={data.notifications} onChanged={loadData} /></div>
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6"><p className="nb-eyebrow">team resources</p><h2 className="mt-2 font-display text-2xl">Разработчики</h2><div className="mt-5 space-y-4">{data.developers.length ? data.developers.map((developer) => <div key={developer.id} className="rounded-2xl border border-border bg-background-alt p-4"><p className="font-display text-lg">{developer.name}</p><p className="mt-1 text-sm text-muted-foreground">{developer.stack}</p><p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{developer.load}</p></div>) : <div className="rounded-2xl border border-dashed border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">Реальные разработчики ещё не добавлены директором.</div>}</div></div>
      </aside>
    </div>
  )
}
