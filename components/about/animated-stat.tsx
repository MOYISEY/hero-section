"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedStatProps {
  to: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
}

export function AnimatedStat({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1600,
}: AnimatedStatProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration)
              // ease-out-quart
              const eased = 1 - Math.pow(1 - t, 4)
              setValue(to * eased)
              if (t < 1) requestAnimationFrame(tick)
              else setValue(to)
            }
            requestAnimationFrame(tick)
            obs.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [to, duration])

  const formatted = value.toLocaleString("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
