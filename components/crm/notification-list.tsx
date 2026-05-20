"use client"

import { Bell, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type NotificationItem = {
  id: string
  title: string
  body: string | null
  read_at?: string | null
}

export function NotificationList({ items, onChanged, emptyText = "Уведомлений пока нет." }: { items: NotificationItem[]; onChanged: () => void; emptyText?: string }) {
  const unreadCount = items.filter((item) => !item.read_at).length

  async function updateNotification(action: "mark_as_read" | "delete" | "clear_all", notificationId?: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notificationId }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Не удалось обновить уведомления", { description: result?.error || "Попробуйте ещё раз." })
      return
    }

    toast.success(action === "clear_all" ? "Лента очищена" : action === "delete" ? "Уведомление удалено" : "Уведомление прочитано")
    onChanged()
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm", unreadCount ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border text-muted-foreground")}>
            <Bell className="size-4" />
            {unreadCount ? `Новых: ${unreadCount}` : "Новых нет"}
          </div>
          <button
            type="button"
            onClick={() => updateNotification("clear_all")}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            Очистить все
          </button>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => {
          const isRead = Boolean(item.read_at)

          return (
            <div key={item.id} className={cn("rounded-2xl border p-4 transition-colors", isRead ? "border-border/60 bg-background-alt/60 opacity-70" : "border-destructive/40 bg-destructive/10 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]")}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!isRead && <span aria-hidden className="size-2 rounded-full bg-destructive" />}
                    <p className={cn("font-display text-lg", isRead ? "text-muted-foreground" : "text-foreground")}>{item.title}</p>
                  </div>
                  {item.body && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>}
                  {!isRead && (
                    <button type="button" onClick={() => updateNotification("mark_as_read", item.id)} className="mt-3 rounded-full bg-destructive px-3 py-1.5 text-sm text-destructive-foreground transition-opacity hover:opacity-90">
                      Прочитано
                    </button>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Удалить уведомление"
                    onClick={() => updateNotification("delete", item.id)}
                    className="grid size-8 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="rounded-2xl border border-dashed border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">{emptyText}</div>
        )}
      </div>
    </div>
  )
}
