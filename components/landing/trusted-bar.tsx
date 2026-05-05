const STUDIOS = [
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
  "Astana IT University",
] as const

export function TrustedBar() {
  return (
    <section className="relative border-b border-border bg-background-alt/40 overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-10 py-8 flex items-center gap-10">
        <p className="nb-eyebrow shrink-0 hidden sm:flex items-center gap-2">
          <span aria-hidden className="size-1 rounded-full bg-primary" />
          / используют студии
        </p>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center w-max nb-marquee">
            {[...STUDIOS, ...STUDIOS].map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="font-display text-[20px] tracking-tight font-medium text-subtle-foreground/90 mx-8 whitespace-nowrap"
              >
                {s}
                <span aria-hidden className="ml-8 text-muted-foreground/50">
                  /
                </span>
              </span>
            ))}
          </div>
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background-alt to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background-alt to-transparent"
          />
        </div>
      </div>
    </section>
  )
}
