import { DeveloperWorkspace } from "@/components/crm/developer-workspace"

export default function DeveloperPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-10 grid gap-6 border-b border-border pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="nb-eyebrow">/ developer workspace</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Рабочее пространство разработчика
          </h1>
        </div>
        <div className="lg:col-span-4 lg:pt-10">
          <p className="text-sm leading-7 text-muted-foreground">
            Здесь разработчик видит назначенные задачи, финальное ТЗ, командные чаты, уведомления, репозиторий и простой трекинг времени.
          </p>
        </div>
      </div>

      <DeveloperWorkspace />
    </section>
  )
}
