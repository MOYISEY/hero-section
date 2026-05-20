"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  content: string
  created_at: string
  sender_id: string | null
  sender_name: string | null
  sender_role: string | null
}

export function ProjectChatPanel({ projectId, channel, title, defaultOpen = false }: { projectId: string; channel: "manager_client" | "manager_developer"; title: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  function loadMessages() {
    if (!open) return
    fetch(`/api/chats?projectId=${projectId}&channel=${channel}`)
      .then(async (response) => {
        const data = response.ok ? await response.json() : { messages: [], error: "load failed" }
        console.log("[chat:panel] loadMessages response:", response.status, data)
        return data
      })
      .then((data) => setMessages(data.messages || []))
      .catch((error) => console.error("[chat:panel] loadMessages error:", error))
  }

  useEffect(() => { setOpen(defaultOpen) }, [defaultOpen, projectId, channel])
  useEffect(() => { loadMessages() }, [open, projectId, channel])

  async function sendMessage() {
    if (!content.trim()) return
    setLoading(true)
    console.log("[chat:panel] sendMessage projectId:", projectId, "channel:", channel)
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, channel, content }),
    })
    const result = await response.json().catch(() => null)
    console.log("[chat:panel] sendMessage response:", response.status, result)
    setLoading(false)

    if (!response.ok) {
      toast.error("Не удалось отправить сообщение", { description: result?.error || "Проверьте доступ к чату." })
      return
    }

    setContent("")
    loadMessages()
  }

  async function clearChat() {
    console.log("[chat:panel] clearChat projectId:", projectId, "channel:", channel)
    const response = await fetch(`/api/chats?projectId=${projectId}&channel=${channel}`, { method: "DELETE" })
    const result = await response.json().catch(() => null)
    console.log("[chat:panel] clearChat response:", response.status, result)

    if (!response.ok) {
      toast.error("Не удалось очистить чат", { description: result?.error || "Проверьте доступ к чату." })
      return
    }

    setMessages([])
    toast.success("Чат очищен")
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-surface/60 p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
        <MessageCircle className="size-4" />
        {open ? "Скрыть чат" : title}
      </button>

      {open && (
        <div className="mt-4">
          <div className="mb-3 flex justify-end">
            <button type="button" onClick={clearChat} className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive">
              Очистить чат
            </button>
          </div>
          <div className="max-h-64 space-y-3 overflow-auto rounded-2xl border border-border bg-background-alt p-3">
            {messages.length ? messages.map((message) => (
              <div key={message.id} className={cn("rounded-xl border border-border/60 p-3", message.sender_role === "manager" ? "bg-primary/10" : "bg-surface") }>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{message.sender_name || "Пользователь"} · {message.sender_role || "role"}</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{message.content}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Сообщений пока нет.</p>
            )}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage() } }}
              placeholder="Написать сообщение..."
              className="rounded-full border border-border bg-background-alt px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="button" onClick={sendMessage} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60">
              <Send className="size-4" />
              {loading ? "..." : "Отправить"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
