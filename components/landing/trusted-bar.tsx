import { Reveal } from "@/components/reveal"

const STUDIOS = [
  "STUDIO NORD",
  "Lumen Lab",
  "Praktika.web",
  "Кириллица",
  "BasaltUI",
  "Зеркало",
] as const

export function TrustedBar() {
  return (
    <section className="relative border-y border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <p className="nb-eyebrow shrink-0">
              Используют студии
            </p>
            <div className="flex-1 flex flex-wrap items-center gap-x-10 gap-y-4">
              {STUDIOS.map((s) => (
                <span
                  key={s}
                  className="font-display text-lg tracking-tight text-subtle-foreground/80 hover:text-foreground transition-colors duration-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
