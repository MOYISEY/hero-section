import { cookies } from "next/headers"
import { verifyPassword } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 })
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
    [email],
  )

  const user = result.rows[0]

  if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
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
