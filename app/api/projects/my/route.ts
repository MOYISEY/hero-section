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
        AND status <> 'rejected'
      ORDER BY created_at DESC
    `,
    [userId],
  )

  return Response.json({ projects: result.rows })
}

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId || role !== "client") {
    return Response.json({ error: "Only authenticated clients can update saved projects" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const projectId = typeof body?.projectId === "string" ? body.projectId : ""

  if (!projectId) {
    return Response.json({ error: "Project id is required" }, { status: 400 })
  }

  const result = await pool.query(
    `
      UPDATE projects
      SET archived_at = NOW(), updated_at = NOW()
      WHERE id = $1::UUID AND client_id = $2::UUID AND archived_at IS NULL
      RETURNING id
    `,
    [projectId, userId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  return Response.json({ ok: true, status: "archived" })
}

export async function DELETE(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId || role !== "client") {
    return Response.json({ error: "Only authenticated clients can delete saved projects" }, { status: 401 })
  }

  const url = new URL(req.url)
  const projectId = url.searchParams.get("projectId") || ""

  if (!projectId) {
    return Response.json({ error: "Project id is required" }, { status: 400 })
  }

  const result = await pool.query(
    `
      DELETE FROM projects
      WHERE id = $1::UUID AND client_id = $2::UUID
      RETURNING id
    `,
    [projectId, userId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  return Response.json({ ok: true, status: "deleted" })
}
