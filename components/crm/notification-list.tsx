"use client"

import { X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type NotificationItem = {
  id: string
  title: string
  body: string | null
  read_at?: string | null
}

export function NotificationList({ items, onChanged, emptyText = "Уведомлений пока нет." }: { items: NotificationItem[]; onChanged: () => void; emptyText?: string }) {
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
        <button
          type="button"
          onClick={() => updateNotification("clear_all")}
          className="mt-4 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          Очистить все
        </button>
      )}

      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => {
          const isRead = Boolean(item.read_at)

          return (
            <div key={item.id} className={cn("rounded-2xl border p-4 transition-colors", isRead ? "border-border/60 bg-background-alt/60 opacity-70" : "border-border bg-background-alt")}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => updateNotification("mark_as_read", item.id)} className="min-w-0 text-left">
                  <p className={cn("font-display text-lg", isRead && "text-muted-foreground")}>{item.title}</p>
                  {item.body && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>}
                </button>
                <button
                  type="button"
                  aria-label="Удалить уведомление"
                  onClick={() => updateNotification("delete", item.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
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
