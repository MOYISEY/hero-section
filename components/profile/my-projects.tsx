"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { ProjectChatPanel } from "@/components/crm/project-chat-panel"

type ClientProject = {
  id: string
  title: string
  brief_text: string | null
  status: string
  archived_at?: string | null
  created_at: string
}

const steps = [
  { key: "draft", label: "ТЗ принято" },
  { key: "in_development", label: "В разработке" },
  { key: "review", label: "На проверке" },
  { key: "done", label: "Готово" },
]

export function MyProjects() {
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/projects/my")
      .then((response) => response.ok ? response.json() : { projects: [] })
      .then((data) => {
        console.log("[my-projects] loaded:", data.projects?.length || 0, data.projects)
        setProjects(data.projects || [])
      })
      .finally(() => setLoading(false))
  }, [])

  function downloadProject(project: ClientProject) {
    const content = project.brief_text || "ТЗ пока пустое"
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${project.title || "neuralbrief-project"}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function reviewProject(projectId: string) {
    const response = await fetch("/api/projects/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, rating: ratings[projectId] || 5, comment: comments[projectId] || "" }),
    })
    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Не удалось отправить оценку", { description: result?.error || "Проект должен быть готов." })
      return
    }

    toast.success("Спасибо за оценку")
    setComments((current) => ({ ...current, [projectId]: "" }))
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
      <div className="mb-5">
        <h2 className="mt-2 font-display text-2xl">Мои проекты</h2>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-border bg-background-alt p-5 text-sm text-muted-foreground">Загрузка проектов...</div>
      ) : projects.length ? (
        <div className="grid gap-4">
          {projects.map((project) => {
            const currentIndex = Math.max(0, steps.findIndex((item) => item.key === project.status))

            return (
              <article key={project.id} className="rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-display text-xl">{project.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Создано: {new Date(project.created_at).toLocaleDateString("ru-RU")} · Статус: {project.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => downloadProject(project)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-surface">
                      <Download className="size-4" />
                      Скачать ТЗ
                    </button>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{project.brief_text || "ТЗ без текста"}</p>
                <ProjectChatPanel projectId={project.id} channel="manager_client" title="Чат с менеджером" />
                <div className="mt-5 grid gap-2 md:grid-cols-4">
                  {steps.map((step, index) => (
                    <div key={step.key} className={index <= currentIndex ? "rounded-full bg-primary px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground" : "rounded-full border border-border px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"}>{step.label}</div>
                  ))}
                </div>
                {project.status === "done" && (
                  <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
                    <p className="nb-eyebrow">Оценка результата</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-[120px_1fr_auto]">
                      <select value={ratings[project.id] || 5} onChange={(event) => setRatings((current) => ({ ...current, [project.id]: Number(event.target.value) }))} className="rounded-full border border-border bg-background-alt px-4 py-2 text-sm">
                        {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                      </select>
                      <input value={comments[project.id] || ""} onChange={(event) => setComments((current) => ({ ...current, [project.id]: event.target.value }))} placeholder="Комментарий" className="rounded-full border border-border bg-background-alt px-4 py-2 text-sm outline-none focus:border-primary" />
                      <button onClick={() => reviewProject(project.id)} className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">Подтвердить</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background-alt p-5 text-sm leading-6 text-muted-foreground">
          Сохранённых проектов пока нет. Сгенерируйте ТЗ и отправьте его менеджеру.
        </div>
      )}
    </div>
  )
}
