import { Suspense } from "react"
import { ManagerChats } from "@/components/crm/manager-chats"

export default function ManagerChatsPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
          Чаты
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Все переписки менеджера собраны отдельно, чтобы основная панель оставалась простой: заявки и задачи — в панели, общение — здесь.
        </p>
      </div>

      <Suspense fallback={<div className="rounded-2xl border border-dashed border-border bg-background-alt p-6 text-sm text-muted-foreground">Загрузка чатов...</div>}>
        <ManagerChats />
      </Suspense>
    </section>
  )
}
