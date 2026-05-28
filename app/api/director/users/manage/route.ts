import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { isRole } from "@/lib/auth"
import { parseJsonBody, rateLimitResponse, validationErrorResponse } from "@/lib/api-helpers"
import { directorUserManageSchema } from "@/lib/validation"

const actions = ["set_role", "set_specialization", "delete"] as const

type DirectorAction = (typeof actions)[number]

function isDirectorAction(value: unknown): value is DirectorAction {
  return typeof value === "string" && actions.includes(value as DirectorAction)
}

export async function PATCH(req: Request) {
  const limited = rateLimitResponse(req, "director-users-manage", 30, 60_000)
  if (limited) return limited

  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const directorId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!directorId || role !== "director") {
    return Response.json({ error: "Only director can manage users" }, { status: 403 })
  }

  let payload

  try {
    payload = await parseJsonBody(req, directorUserManageSchema)
  } catch (error) {
    return validationErrorResponse(error) || Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const userId = payload.userId
  const action = isDirectorAction(payload.action) ? payload.action : null
  const nextRole = isRole(payload.role) ? payload.role : null
  const specialization = typeof payload.specialization === "string" ? payload.specialization.trim() : ""

  if (!userId || !action) {
    return Response.json({ error: "User id and valid action are required" }, { status: 400 })
  }

  if (userId === directorId && (action === "delete" || action === "set_role")) {
    return Response.json({ error: "Director cannot restrict own account" }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    let result

    if (action === "set_role") {
      if (!nextRole || !["manager", "developer"].includes(nextRole)) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Role must be manager or developer" }, { status: 400 })
      }

      result = await client.query(
        `
          UPDATE users
          SET role = $1
          WHERE id = $2::UUID AND deleted_at IS NULL
          RETURNING id, email, name, role, is_banned
        `,
        [nextRole, userId],
      )
    } else if (action === "set_specialization") {
      result = await client.query(
        `
          UPDATE users
          SET specialization = NULLIF($1, '')
          WHERE id = $2::UUID AND deleted_at IS NULL AND role = 'developer'
          RETURNING id, email, name, role, is_banned, specialization
        `,
        [specialization, userId],
      )
    } else {
      result = await client.query(
        `
          DELETE FROM users
          WHERE id = $1::UUID AND deleted_at IS NULL AND role IN ('manager', 'developer')
          RETURNING id, email, name, role, is_banned
        `,
        [userId],
      )
    }

    if (!result.rows[0]) {
      await client.query("ROLLBACK")
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    await client.query(
      `
        INSERT INTO audit_log (actor_id, target_user_id, action, metadata)
        VALUES ($1::UUID, $2::UUID, $3, $4::JSONB)
      `,
      [
        directorId,
        result.rows[0].id,
        `user_${action}`,
        JSON.stringify({
          email: result.rows[0].email,
          role: result.rows[0].role,
          specialization: result.rows[0].specialization || null,
        }),
      ],
    )

    await client.query("COMMIT")
    return Response.json({ ok: true, user: result.rows[0] })
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    const message = error instanceof Error ? error.message : "Unknown director user management error"
    return Response.json({ error: message }, { status: 500 })
  } finally {
    client.release()
  }
}
