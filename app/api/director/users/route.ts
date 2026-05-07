import { cookies } from "next/headers"
import { hashPassword, isRole } from "@/lib/auth"
import { getPool } from "@/lib/db"

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const currentRole = cookieStore.get("neuralbrief.role")?.value

  if (currentRole !== "director") {
    return Response.json({ error: "Only director can create staff accounts" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  const role = isRole(body?.role) ? body.role : null
  const specialization = typeof body?.specialization === "string" ? body.specialization.trim() : null

  if (!email || !name || !password || !role) {
    return Response.json({ error: "Name, email, password and role are required" }, { status: 400 })
  }

  if (role === "client") {
    return Response.json({ error: "Clients should register themselves" }, { status: 400 })
  }

  if (password.length < 6) {
    return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO users (email, name, role, password_hash, specialization)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name,
            role = EXCLUDED.role,
            password_hash = EXCLUDED.password_hash,
            specialization = EXCLUDED.specialization,
            status = 'active'
        RETURNING id, email, name, role, specialization
      `,
      [email, name, role, hashPassword(password), specialization],
    )

    return Response.json({ ok: true, user: result.rows[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown staff creation error"

    return Response.json({ error: message }, { status: 500 })
  }
}
