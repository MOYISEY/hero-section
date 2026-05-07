import { getPool } from "@/lib/db"

export async function POST() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ seeded: false, reason: "DATABASE_URL is not configured" })
  }

  return Response.json({
    seeded: false,
    reason: "CRM demo seed is disabled because the workspace should contain only real data.",
  })
}
