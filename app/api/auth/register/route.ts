import { cookies } from "next/headers"
import { hashPassword } from "@/lib/auth"
import { parseJsonBody, rateLimitResponse, validationErrorResponse } from "@/lib/api-helpers"
import { getPool } from "@/lib/db"
import { registerSchema } from "@/lib/validation"

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "auth-register", 5, 60_000)
  if (limited) return limited

  let payload

  try {
    payload = await parseJsonBody(req, registerSchema)
  } catch (error) {
    return validationErrorResponse(error) || Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const role = "client"

  try {
    const result = await pool.query(
      `
        INSERT INTO users (email, name, role, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role
      `,
      [payload.email, payload.name, role, hashPassword(payload.password)],
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
