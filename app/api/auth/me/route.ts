import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const role = cookieStore.get("neuralbrief.role")?.value || null
  const userId = cookieStore.get("neuralbrief.userId")?.value || null

  if (!userId) {
    return Response.json({ role, userId })
  }

  const pool = getPool()

  if (!pool) {
    return Response.json({ role, userId })
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

  const user = result.rows[0]

  if (!user) {
    return Response.json({ role, userId })
  }

  return Response.json({
    role: user.role,
    userId: user.id,
    user,
  })
}
