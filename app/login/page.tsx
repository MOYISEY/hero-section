import { Suspense } from "react"
import { RoleLogin } from "@/components/auth/role-login"

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
          <Suspense fallback={<div className="rounded-3xl border border-border bg-surface p-8 text-sm text-muted-foreground">Загрузка доступа...</div>}>
            <RoleLogin />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
