const tasks = [
  { id: "NB-104", title: "Лендинг для SaaS-продукта", status: "В работе", repo: "github.com/studio/project" },
  { id: "NB-118", title: "Кабинет клиента и история заказов", status: "На проверке", repo: "gitlab.com/studio/crm" },
]

const events = [
  "Менеджер назначил задачу NB-104",
  "Новое сообщение в командном чате",
  "Статус NB-118 изменён на проверку",
]

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

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-3xl border border-border bg-surface p-5 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{task.id}</p>
                  <h2 className="mt-3 font-display text-3xl leading-tight">{task.title}</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                    Финальное техническое задание доступно только для чтения. Изменения вносит менеджер после согласования с клиентом.
                  </p>
                </div>
                <span className="rounded-full border border-primary/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  {task.status}
                </span>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {['В работе', 'На проверке', 'Готово'].map((status) => (
                  <button key={status} className="rounded-2xl border border-border bg-background-alt px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary">
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="nb-eyebrow">repository</p>
                  <p className="mt-3 break-words text-sm text-muted-foreground">{task.repo}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="nb-eyebrow">time tracker</p>
                  <button className="mt-3 rounded-full bg-primary px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary-foreground">
                    Начать работу
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <p className="nb-eyebrow">notifications</p>
            <h2 className="mt-2 font-display text-2xl">Лента событий</h2>
            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <div key={event} className="rounded-2xl border border-border bg-background-alt p-4 text-sm leading-6 text-muted-foreground">
                  {event}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <p className="nb-eyebrow">wiki</p>
            <h2 className="mt-2 font-display text-2xl">База знаний</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Здесь менеджер сможет закреплять ссылки, доступы к хостингам, правила Code Style и внутренние инструкции студии.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
