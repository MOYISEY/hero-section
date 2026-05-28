import { cookies } from "next/headers"
import { verifyPassword } from "@/lib/auth"
import { parseJsonBody, rateLimitResponse, validationErrorResponse } from "@/lib/api-helpers"
import { getPool } from "@/lib/db"
import { loginSchema } from "@/lib/validation"

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "auth-login", 10, 60_000)
  if (limited) return limited

  let payload

  try {
    payload = await parseJsonBody(req, loginSchema)
  } catch (error) {
    return validationErrorResponse(error) || Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const result = await pool.query(
    `
      SELECT id, email, name, role, password_hash, is_banned
      FROM users
      WHERE email = $1 AND status = 'active' AND deleted_at IS NULL
      LIMIT 1
    `,
    [payload.email],
  )

  const user = result.rows[0]

  if (!user?.password_hash || !verifyPassword(payload.password, user.password_hash)) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 })
  }

  if (user.is_banned) {
    return Response.json({ error: "Аккаунт заблокирован", banned: true }, { status: 403 })
  }

  const cookieStore = await cookies()

  cookieStore.set("neuralbrief.role", user.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  cookieStore.set("neuralbrief.userId", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
}
