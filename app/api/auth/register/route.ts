import { cookies } from "next/headers"
import { hashPassword, isRole } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  const role = isRole(body?.role) ? body.role : null

  if (!email || !name || !password || !role) {
    return Response.json({ error: "Name, email, password and role are required" }, { status: 400 })
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO users (email, name, role, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role
      `,
      [email, name, role, hashPassword(password)],
    )

    const cookieStore = await cookies()

    cookieStore.set("neuralbrief.role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    cookieStore.set("neuralbrief.userId", result.rows[0].id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return Response.json({ ok: true, user: result.rows[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown registration error"

    if (message.includes("duplicate key")) {
      return Response.json({ error: "User with this email already exists" }, { status: 409 })
    }

    return Response.json({ error: message }, { status: 500 })
  }
}
