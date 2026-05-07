"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const labels: Record<string, string> = {
  client: "Client",
  manager: "Manager",
  developer: "Developer",
  director: "Director",
}

export function AuthStatus() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setRole(data.role))
      .catch(() => undefined)
  }, [pathname])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setRole(null)
    router.push("/login")
    router.refresh()
  }

  if (!role) {
    return (
      <Link href="/login" className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
        Войти
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="whitespace-nowrap rounded-full border border-border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive lg:text-[10px]"
    >
      {labels[role] || role} · выйти
    </button>
  )
}
