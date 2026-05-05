"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Download, Send, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function BriefActions({ briefText }: { briefText: string }) {
  const [sent, setSent] = useState(false)

  function downloadPdf() {
    toast("Открываю печать", {
      description: "В окне печати выберите «Сохранить как PDF».",
    })
    window.print()
  }

  function sendToDevs() {
    const subject = encodeURIComponent("Техническое задание NeuralBrief")
    const body = encodeURIComponent(briefText)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setSent(true)
    toast.success("Открываю почтовый клиент", {
      description: "Выберите получателей и отправьте письмо.",
    })
  }

  return (
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
        onClick={sendToDevs}
        disabled={sent}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-full pl-5 pr-2 py-2 text-sm font-medium transition-all duration-500 disabled:cursor-default",
          sent
            ? "bg-success/15 text-success border border-success/30"
            : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        {sent ? "Отправлено разработчикам" : "Отправить разработчикам"}
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
    </div>
  )
}
