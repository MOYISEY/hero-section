import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const role = cookieStore.get("neuralbrief.role")?.value

  if (role !== "director") {
    return Response.json({ error: "Only director can manage projects" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const projectId = typeof body?.projectId === "string" ? body.projectId : ""
  const action = body?.action === "hide_done" ? "hide_done" : null

  if (!projectId || !action) {
    return Response.json({ error: "Project id and valid action are required" }, { status: 400 })
  }

  const result = await pool.query(
    `
      UPDATE projects
      SET archived_at = NOW(), updated_at = NOW()
      WHERE id = $1::UUID
        AND archived_at IS NULL
        AND status = 'done'
      RETURNING id
    `,
    [projectId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "Only done projects can be hidden" }, { status: 404 })
  }

  return Response.json({ ok: true, status: "hidden" })
}
