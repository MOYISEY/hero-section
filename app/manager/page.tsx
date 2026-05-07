import { ManagerDashboard } from "@/components/crm/manager-dashboard"

export default function ManagerPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-10 grid gap-6 border-b border-border pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="nb-eyebrow">/ manager monitoring</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Панель контроля диалогов и ресурсов
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-10">
          <p className="text-sm leading-7 text-muted-foreground">
            Эта страница предназначена только для менеджера: мониторинг чатов, ручной перехват ИИ, отправка ТЗ в разработку и контроль загрузки команды.
          </p>
        </div>
      </div>

      <ManagerDashboard />
    </section>
  )
}
