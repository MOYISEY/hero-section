import { MyProjects } from "@/components/profile/my-projects"

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-12 lg:px-10 lg:py-16">
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
          Проекты
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Здесь хранятся ваши сохранённые ТЗ, статусы проектов и чат с менеджером.
        </p>
      </div>

      <MyProjects />
    </section>
  )
}
