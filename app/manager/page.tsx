const chats = [
  { client: "Клиент A", state: "ИИ уточняет функции", tone: "stable" },
  { client: "Клиент B", state: "Нужен перехват менеджера", tone: "warning" },
  { client: "Клиент C", state: "Финальное согласование ТЗ", tone: "success" },
  { client: "Клиент D", state: "Сбор сроков и бюджета", tone: "stable" },
]

const developers = [
  { name: "Frontend developer", stack: "React / UI", load: "Свободен" },
  { name: "Backend developer", stack: "Node.js / PostgreSQL", load: "В работе над задачей NB-104" },
  { name: "Fullstack developer", stack: "Next.js / API", load: "Свободен" },
]

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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="nb-eyebrow">active ai chats</p>
              <h2 className="mt-2 font-display text-2xl">Сетка активных чатов</h2>
            </div>
            <button className="self-start rounded-full bg-primary px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary-foreground md:self-auto">
              Отправить разработчикам
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {chats.map((chat) => (
              <article key={chat.client} className="min-h-56 rounded-2xl border border-border bg-background-alt p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-xl">{chat.client}</p>
                  <span className={chat.tone === "warning" ? "rounded-full border border-warning/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-warning" : "rounded-full border border-primary/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary"}>
                    live
                  </span>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">{chat.state}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">Открыть</button>
                  <button className="rounded-full border border-destructive/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-destructive">Остановить ИИ</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-5 md:p-6">
            <p className="nb-eyebrow">team resources</p>
            <h2 className="mt-2 font-display text-2xl">Разработчики</h2>
            <div className="mt-5 space-y-4">
              {developers.map((developer) => (
                <div key={developer.name} className="rounded-2xl border border-border bg-background-alt p-4">
                  <p className="font-display text-lg">{developer.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{developer.stack}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">{developer.load}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
