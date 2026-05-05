"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: keyof React.JSX.IntrinsicElements
}

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = setTimeout(() => {
              ;(e.target as HTMLElement).dataset.shown = "true"
            }, delay)
            obs.unobserve(e.target)
            return () => clearTimeout(t)
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const Tag = as as keyof React.JSX.IntrinsicElements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp: any = Tag
  return (
    <Comp ref={ref as never} className={cn("nb-reveal", className)}>
      {children}
    </Comp>
  )
}
