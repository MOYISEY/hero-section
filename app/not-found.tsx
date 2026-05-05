import Link from "next/link"

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 nb-mesh-soft" />
      <div aria-hidden className="absolute inset-0 nb-grid opacity-50" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-10 py-24 text-center">
        <p className="nb-eyebrow mb-6">страница не найдена</p>

        <h1 className="font-display text-[28vw] sm:text-[200px] lg:text-[260px] leading-[0.85] tracking-[-0.05em] font-medium select-none">
          <span className="nb-glitch" data-text="404">
            404
          </span>
        </h1>

        <p className="mt-8 font-display text-2xl sm:text-3xl tracking-tight text-balance max-w-2xl mx-auto">
          Эта страница потерялась
          <span className="text-primary"> в нейронной сети</span>.
        </p>
        <p className="mt-4 text-subtle-foreground max-w-md mx-auto leading-relaxed">
          Возможно, мы её ещё не обучили. А может, вы перешли по устаревшей
          ссылке. Давайте вернёмся к началу.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground pl-6 pr-2 py-2.5 text-[15px] font-medium hover:bg-primary-soft transition-colors duration-500"
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            На главную
            <span className="grid place-items-center size-9 bg-primary-foreground/15 group-hover:translate-x-1 transition-transform duration-500">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[15px] text-subtle-foreground hover:text-foreground transition-colors duration-300"
          >
            <span aria-hidden className="text-primary-soft">→</span>
            Открыть демо-диалог
          </Link>
        </div>

        <p className="mt-12 font-mono text-[11px] text-muted-foreground">
          ERR / NEURAL · 0x0404 · {"{"}path_not_in_training_set{"}"}
        </p>
      </div>
    </section>
  )
}
