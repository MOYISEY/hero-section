import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ projects: [] })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId || role !== "client") {
    return Response.json({ error: "Only authenticated clients can view saved projects" }, { status: 401 })
  }

  const result = await pool.query(
    `
      SELECT id, title, brief_text, requirements_json, status, archived_at, created_at, updated_at
      FROM projects
      WHERE client_id = $1::UUID
        AND archived_at IS NULL
      ORDER BY created_at DESC
    `,
    [userId],
  )

  return Response.json({ projects: result.rows })
}
