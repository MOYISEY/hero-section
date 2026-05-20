"use client"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Download, Send, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type BriefMessage = {
  role: string
  text: string
}

export function BriefActions({ briefText, messages = [], userRole, isLoggedIn, onReset }: { briefText: string; messages?: BriefMessage[]; userRole?: string | null; isLoggedIn?: boolean; onReset?: () => void }) {
  const [sent, setSent] = useState(false)

  function downloadPdf() {
    toast("Открываю печать", {
      description: "В окне печати выберите «Сохранить как PDF».",
    })
    window.print()
  }

  function clearDialog() {
    localStorage.removeItem("neuralbrief.chat")
    localStorage.removeItem("neuralbrief.updatedAt")
    setSent(false)
    onReset?.()
    toast.success("Диалог очищен", {
      description: "Теперь можно начать новый проект.",
    })
  }

  async function sendToManager() {
    if (!isLoggedIn) {
      toast.error("Войдите или зарегистрируйтесь, чтобы сохранить проект")
      return
    }

    if (userRole !== "client") {
      toast.error("Сохранение доступно только клиенту", {
        description: "Для проверки сохранения войдите под аккаунтом клиента.",
      })
      return
    }

    const response = await fetch("/api/briefs/send-to-manager", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ briefText, messages }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      toast.error("Не удалось отправить менеджеру", {
        description: data?.error || "Попробуйте ещё раз позже.",
      })
      return
    }

    setSent(true)
    localStorage.removeItem("neuralbrief.chat")
    localStorage.removeItem("neuralbrief.updatedAt")
    toast.success("Отправлено менеджеру", {
      description: "Менеджер получил уведомление и рассмотрит ТЗ.",
    })
  }

  return (
    <div className="print:hidden space-y-4">
      {!isLoggedIn && (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          <p className="font-display text-lg">Войдите или зарегистрируйтесь, чтобы сохранить проект</p>
          <p className="mt-2 text-muted-foreground">Гость может просмотреть черновик, но сохранение ТЗ в базе доступно только клиенту.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">Войти</Link>
            <Link href="/login" className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]">Регистрация</Link>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={downloadPdf}
        className="group inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-surface/60 hover:bg-surface px-5 py-2.5 text-sm font-medium transition-colors duration-300"
      >
        <Download className="size-4" />
        Скачать PDF
      </button>

      <button
        type="button"
        onClick={sendToManager}
        disabled={sent}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-full pl-5 pr-2 py-2 text-sm font-medium transition-all duration-500 disabled:cursor-default",
          sent
            ? "bg-success/15 text-success border border-success/30"
            : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {sent ? "Отправлено менеджеру" : "Отправить менеджеру"}
        <span
          className={cn(
            "grid place-items-center size-7 rounded-full transition-all duration-500",
            sent ? "bg-success/25" : "bg-background/15 group-hover:translate-x-0.5",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {sent ? <Check className="size-3.5" /> : <Send className="size-3.5" />}
        </span>
      </button>

      <button
        type="button"
        onClick={clearDialog}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        Новый проект
      </button>
      </div>
    </div>
  )
}
