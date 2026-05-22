"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

const developerSpecializations = [
  "Full-stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Next.js Developer",
  "Vue Developer",
  "Angular Developer",
  "Node.js Developer",
  "Python/Django Developer",
  "PHP/Laravel Developer",
  "WordPress Developer",
  "Shopify Developer",
  "Mobile Developer",
  "React Native Developer",
  "Flutter Developer",
  "UI/UX Designer",
  "Web Designer",
  "QA Engineer",
  "DevOps Engineer",
  "Database Engineer",
  "SEO Specialist",
  "No-code Developer",
  "E-commerce Developer",
  "API Integration Specialist",
]

const boardColumns = [
  { key: "todo", title: "Задачи" },
  { key: "in_progress", title: "В работе" },
  { key: "review", title: "На проверке" },
  { key: "done", title: "Готово" },
]

type DirectorData = {
  stats?: { active_projects: number; done_projects: number; average_rating: string | number }
  users: { id: string; email: string; name: string; role: string; is_banned: boolean; status: string; specialization: string | null }[]
  reviews: { id: string; rating: number; comment: string | null; project_title: string; client_name: string | null; manager_name: string | null; developer_name: string | null; created_at: string }[]
  projects: { id: string; title: string; status: string; is_released: boolean; client_name: string | null; manager_name: string | null; developer_name: string | null; task_status: string | null; trello_card_url: string | null; repository_url: string | null; created_at: string; updated_at: string; task_created_at: string | null; task_updated_at: string | null; task_completed_at: string | null; days_in_work: number | null; brief_text: string | null }[]
  board: { id: string; short_id: string; title: string; description: string | null; status: string; repository_url: string | null; trello_card_url: string | null; created_at: string; updated_at: string; project_id: string; project_title: string; project_status: string; client_name: string | null; manager_name: string | null; developer_name: string | null }[]
  boardStats: { status: string; count: number }[]
}

export function DirectorDashboard() {
  const [data, setData] = useState<DirectorData>({ users: [], reviews: [], projects: [], board: [], boardStats: [] })
  const [loading, setLoading] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "manager", specialization: "" })
  const [showAllReviews, setShowAllReviews] = useState(false)

  function loadData() {
    fetch("/api/director/dashboard")
      .then((response) => response.json())
      .then((nextData) => setData({ users: nextData.users || [], reviews: nextData.reviews || [], projects: nextData.projects || [], board: nextData.board || [], boardStats: nextData.boardStats || [], stats: nextData.stats }))
      .catch(() => undefined)
  }

  useEffect(() => { loadData() }, [])

  async function manageUser(userId: string, action: "set_role" | "set_specialization" | "delete", role?: string, specialization?: string) {
    if (action === "delete" && !window.confirm("Полностью удалить сотрудника? Это действие нельзя отменить.")) return
    setLoading(`${action}:${userId}`)
    const response = await fetch("/api/director/users/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role, specialization }),
    })
    const result = await response.json().catch(() => null)
    setLoading(null)

    if (!response.ok) {
      toast.error("Не удалось обновить пользователя", { description: result?.error || "Попробуйте ещё раз." })
      return
    }

    toast.success(action === "delete" ? "Сотрудник удалён" : "Сотрудник обновлён")
    loadData()
  }

  async function createStaff() {
    const response = await fetch("/api/director/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Не удалось создать сотрудника", { description: result?.error || "Проверьте данные." })
      return
    }

    toast.success("Сотрудник создан")
    setNewUser({ name: "", email: "", password: "", role: "manager", specialization: "" })
    loadData()
  }

  async function hideDoneProject(projectId: string) {
    if (!window.confirm("Убрать готовый проект из панели директора? Данные проекта сохранятся.")) return

    setLoading(`hide:${projectId}`)
    const response = await fetch("/api/director/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, action: "hide_done" }),
    })
    const result = await response.json().catch(() => null)
    setLoading(null)

    if (!response.ok) {
      toast.error("Не удалось убрать проект", { description: result?.error || "Можно убрать только готовый проект." })
      return
    }

    toast.success("Проект убран из наблюдения")
    loadData()
  }

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="mb-8">
        <p className="nb-eyebrow">director dashboard</p>
        <h1 className="mt-3 font-display text-4xl">Панель директора</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Управление рабочей командой, ролями, специализациями разработчиков и отзывами клиентов.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[{ label: "Активные проекты", value: data.stats?.active_projects ?? 0 }, { label: "Готовые проекты", value: data.stats?.done_projects ?? 0 }, { label: "Средняя оценка", value: data.stats?.average_rating ?? 0 }].map((item) => (
          <div key={item.label} className="rounded-3xl border border-border bg-surface p-5">
            <p className="nb-eyebrow">{item.label}</p>
            <p className="mt-3 font-display text-4xl">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="nb-eyebrow">company task board</p>
            <h2 className="mt-2 font-display text-2xl">Доска задач компании</h2>
            <p className="mt-2 text-sm text-muted-foreground">Директор видит весь поток: назначение менеджером, работу разработчика, проверку и готовые задачи.</p>
          </div>
          <button type="button" onClick={loadData} className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground">Обновить</button>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          {boardColumns.map((column) => {
            const tasks = data.board.filter((task) => task.status === column.key)
            const count = data.boardStats.find((item) => item.status === column.key)?.count ?? tasks.length
            return (
              <div key={column.key} className="rounded-2xl border border-border bg-background-alt p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl">{column.title}</h3>
                  <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] text-primary">{count}</span>
                </div>
                <div className="space-y-3">
                  {tasks.length ? tasks.map((task) => (
                    <article key={task.id} className="rounded-xl border border-border/70 bg-surface p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{task.short_id}</p>
                      <h4 className="mt-2 font-display text-lg leading-tight">{task.title}</h4>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description || task.project_title}</p>
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <p>Клиент: {task.client_name || "Не указан"}</p>
                        <p>Менеджер: {task.manager_name || "Не назначен"}</p>
                        <p>Разработчик: {task.developer_name || "Не назначен"}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.trello_card_url && <a href={task.trello_card_url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary">Trello</a>}
                        {task.repository_url && <a href={task.repository_url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:border-primary hover:text-primary">GitHub</a>}
                      </div>
                    </article>
                  )) : (
                    <div className="rounded-xl border border-dashed border-border bg-surface/40 p-4 text-sm text-muted-foreground">Пусто</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <h2 className="font-display text-2xl">Рабочая команда</h2>
          <p className="mt-2 text-sm text-muted-foreground">Менеджеры и разработчики. Клиенты здесь не показываются.</p>
          <div className="mt-5 rounded-2xl border border-border bg-background-alt p-4">
            <p className="font-display text-lg">Добавить сотрудника</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} placeholder="Имя" className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary" />
              <input value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} placeholder="Email" type="email" className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary" />
              <input value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} placeholder="Пароль" type="password" className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary" />
              <select value={newUser.role} onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))} className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary">
                <option value="manager">Менеджер</option>
                <option value="developer">Разработчик</option>
              </select>
              {newUser.role === "developer" && (
                <select value={newUser.specialization} onChange={(event) => setNewUser((current) => ({ ...current, specialization: event.target.value }))} className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Категория разработчика</option>
                  {developerSpecializations.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              )}
              <button type="button" onClick={createStaff} className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">Создать</button>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {data.users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-border bg-background-alt p-4">
                <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                  <div>
                    <p className="font-display text-lg">{user.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{user.email} · {user.role === "manager" ? "Менеджер" : "Разработчик"} · {user.is_banned ? "заблокирован" : user.status}</p>
                    {user.role === "developer" && (
                      <p className="mt-2 text-sm text-foreground">Категория: {user.specialization || "Не указана"}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => manageUser(user.id, "set_role", "manager")} className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">manager</button>
                      <button onClick={() => manageUser(user.id, "set_role", "developer")} className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">developer</button>
                      <button onClick={() => manageUser(user.id, "delete")} className="rounded-full border border-destructive/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive">Удалить полностью</button>
                    </div>
                    {user.role === "developer" && (
                      <select
                        value={user.specialization || ""}
                        onChange={(event) => manageUser(user.id, "set_specialization", undefined, event.target.value)}
                        className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Выберите категорию</option>
                        {developerSpecializations.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">Отзывы клиентов</h2>
              {data.reviews.length > 3 && (
                <button type="button" onClick={() => setShowAllReviews((value) => !value)} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                  {showAllReviews ? "Свернуть" : `Показать все (${data.reviews.length})`}
                </button>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {data.reviews.length ? data.reviews.slice(0, showAllReviews ? data.reviews.length : 3).map((review) => (
                <article key={review.id} className="rounded-2xl border border-border bg-background-alt p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg">{review.project_title}</p>
                    <span className="rounded-full bg-primary px-3 py-1 font-mono text-[10px] text-primary-foreground">{review.rating}/5</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">Клиент: {review.client_name || "Не указан"}</p>
                  <p className="mt-1 text-muted-foreground">Менеджер: {review.manager_name || "Не назначен"}</p>
                  <p className="mt-1 text-muted-foreground">Разработчик: {review.developer_name || "Не назначен"}</p>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl border border-border/70 bg-surface/40 p-3 text-foreground">{review.comment || "Клиент оставил только оценку без комментария."}</p>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-border bg-background-alt p-5 text-sm text-muted-foreground">Отзывов пока нет.</div>
              )}
            </div>
          </section>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-surface p-5 md:p-6">
        <h2 className="font-display text-2xl">Наблюдение за проектами</h2>
        <p className="mt-2 text-sm text-muted-foreground">Полная картина по проектам: клиент, менеджер, разработчик, статус и сколько дней проект в работе.</p>
        <div className="mt-5 grid gap-4">
          {data.projects.length ? data.projects.map((project) => (
            <article key={`${project.id}-${project.developer_name || "none"}`} className="rounded-2xl border border-border bg-background-alt p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-display text-xl">{project.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")} · Обновлён: {new Date(project.updated_at).toLocaleDateString("ru-RU")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{project.status}</span>
                  {project.status === "done" && (
                    <button type="button" onClick={() => hideDoneProject(project.id)} className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                      {loading === `hide:${project.id}` ? "..." : "Убрать"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-border/70 bg-surface/40 p-3"><p className="nb-eyebrow">Клиент</p><p className="mt-2 text-sm">{project.client_name || "Не указан"}</p></div>
                <div className="rounded-xl border border-border/70 bg-surface/40 p-3"><p className="nb-eyebrow">Менеджер</p><p className="mt-2 text-sm">{project.manager_name || "Не назначен"}</p></div>
                <div className="rounded-xl border border-border/70 bg-surface/40 p-3"><p className="nb-eyebrow">Разработчик</p><p className="mt-2 text-sm">{project.developer_name || "Не назначен"}</p></div>
                <div className="rounded-xl border border-border/70 bg-surface/40 p-3"><p className="nb-eyebrow">В работе</p><p className="mt-2 text-sm">{project.days_in_work ?? 0} дн.</p></div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Статус задачи: {project.task_status || "Задача ещё не создана"}</p>
              {project.brief_text && <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{project.brief_text}</p>}
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-border bg-background-alt p-5 text-sm text-muted-foreground">Проектов пока нет.</div>
          )}
        </div>
      </section>
    </div>
  )
}
