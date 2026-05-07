import Link from "next/link"

const roles = [
  { title: "Client", text: "Личный профиль, история заказов и чат с ИИ для генерации ТЗ.", href: "/chat" },
  { title: "Manager", text: "Мониторинг активных чатов, перехват диалога и отправка ТЗ разработчикам.", href: "/manager" },
  { title: "Developer", text: "Назначенные задачи, командные чаты, уведомления и статусы разработки.", href: "/developer" },
]

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="nb-eyebrow">/ access control</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Вход в рабочую систему студии
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            Демонстрационный экран авторизации показывает будущую RBAC-логику: клиент, менеджер и разработчик получают разные интерфейсы и разные права.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border bg-surface p-5 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              {roles.map((role) => (
                <Link
                  key={role.title}
                  href={role.href}
                  className="flex min-h-56 flex-col justify-between rounded-2xl border border-border bg-background-alt p-5 transition-colors hover:border-primary"
                >
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">role</p>
                    <h2 className="mt-3 font-display text-2xl">{role.title}</h2>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{role.text}</p>
                  </div>
                  <span className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-foreground">Открыть →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
