import { cookies } from "next/headers"
import { hashPassword } from "@/lib/auth"
import { parseJsonBody, rateLimitResponse, validationErrorResponse } from "@/lib/api-helpers"
import { getPool } from "@/lib/db"
import { directorUserCreateSchema } from "@/lib/validation"

export async function POST(req: Request) {
  const limited = rateLimitResponse(req, "director-users-create", 20, 60_000)
  if (limited) return limited

  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const currentRole = cookieStore.get("neuralbrief.role")?.value
  const directorId = cookieStore.get("neuralbrief.userId")?.value || null

  if (!directorId || currentRole !== "director") {
    return Response.json({ error: "Only director can create staff accounts" }, { status: 403 })
  }

  let payload

  try {
    payload = await parseJsonBody(req, directorUserCreateSchema)
  } catch (error) {
    return validationErrorResponse(error) || Response.json({ error: "Invalid request body" }, { status: 400 })
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
      [payload.email, payload.name, payload.role, hashPassword(payload.password), payload.specialization || null],
    )

    await pool.query(
      `
        INSERT INTO audit_log (actor_id, target_user_id, action, metadata)
        VALUES ($1::UUID, $2::UUID, 'staff_account_created', $3::JSONB)
      `,
      [directorId, result.rows[0].id, JSON.stringify({ email: result.rows[0].email, role: result.rows[0].role })],
    )

    return Response.json({ ok: true, user: result.rows[0] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown staff creation error"

    return Response.json({ error: message }, { status: 500 })
  }
}
