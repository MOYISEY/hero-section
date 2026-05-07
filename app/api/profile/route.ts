import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await pool.query(
    `
      SELECT id, email, name, role, specialization, avatar_url
      FROM users
      WHERE id = $1 AND status = 'active'
      LIMIT 1
    `,
    [userId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  return Response.json({ user: result.rows[0] })
}

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : ""

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 })
  }

  if (avatarUrl && !/^https?:\/\//.test(avatarUrl)) {
    return Response.json({ error: "Avatar URL must start with http:// or https://" }, { status: 400 })
  }

  const result = await pool.query(
    `
      UPDATE users
      SET name = $1,
          avatar_url = NULLIF($2, '')
      WHERE id = $3 AND status = 'active'
      RETURNING id, email, name, role, specialization, avatar_url
    `,
    [name, avatarUrl, userId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  return Response.json({ ok: true, user: result.rows[0] })
}
