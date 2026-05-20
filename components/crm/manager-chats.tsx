"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { ProjectChatPanel } from "@/components/crm/project-chat-panel"

type ManagerChatItem = {
  project_id: string
  project_title: string
  project_short_id: string
  task_short_id: string
  summary: string
  repository_url: string
  project_status: string
  created_at: string
  client_name: string
  client_email: string | null
  developer_name: string | null
  developer_email: string | null
  client_last_message_at: string | null
  developer_last_message_at: string | null
}

function formatDate(value: string | null) {
  if (!value) return "сообщений нет"
  return new Date(value).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
}

export function ManagerChats() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<ManagerChatItem[]>([])
  const [loading, setLoading] = useState(true)
  const activeProjectId = searchParams.get("projectId")
  const activeChannel = searchParams.get("channel")

  useEffect(() => {
    fetch("/api/manager/chats")
      .then((response) => response.ok ? response.json() : { chats: [] })
      .then((data) => setItems(data.chats || []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading && activeProjectId) {
      document.getElementById(`project-${activeProjectId}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [loading, activeProjectId])

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="size-5 text-primary" />
        <h2 className="font-display text-2xl">Все чаты</h2>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm text-muted-foreground">
          Загрузка чатов...
        </div>
      ) : items.length ? (
        <div className="grid gap-4">
          {items.map((item) => {
            const isActiveProject = activeProjectId === item.project_id
            const openClientChat = isActiveProject && activeChannel === "manager_client"
            const openDeveloperChat = isActiveProject && activeChannel === "manager_developer"

            return (
            <article id={`project-${item.project_id}`} key={item.project_id} className={isActiveProject ? "rounded-2xl border border-primary bg-primary/5 p-5" : "rounded-2xl border border-border bg-background-alt p-5"}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Проект {item.project_short_id}{item.task_short_id ? ` · задача ${item.task_short_id}` : ""}</p>
                  <h3 className="mt-2 font-display text-xl">{item.project_title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Клиент: {item.client_name}{item.client_email ? ` · ${item.client_email}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Разработчик: {item.developer_name || "ещё не назначен"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                  <p>Статус: {item.project_status}</p>
                  <p>Клиент: {formatDate(item.client_last_message_at)}</p>
                  <p>Разработчик: {formatDate(item.developer_last_message_at)}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
                <p className="font-display text-lg">Мини-сводка проекта</p>
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {item.summary || "Описание проекта пока отсутствует."}
                </p>
                {item.repository_url && (
                  <p className="mt-3 break-words text-xs text-muted-foreground">Repo: {item.repository_url}</p>
                )}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <ProjectChatPanel projectId={item.project_id} channel="manager_client" title="Чат с клиентом" defaultOpen={openClientChat} />
                {item.developer_name && (
                  <ProjectChatPanel projectId={item.project_id} channel="manager_developer" title="Чат с разработчиком" defaultOpen={openDeveloperChat} />
                )}
              </div>
            </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm leading-6 text-muted-foreground">
          Активных чатов пока нет. Они появятся после отправки ТЗ клиентом или назначения разработчика.
        </div>
      )}
    </div>
  )
}
