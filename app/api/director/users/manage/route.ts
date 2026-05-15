import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { isRole } from "@/lib/auth"

const actions = ["set_role", "ban", "unban", "soft_delete"] as const

type DirectorAction = (typeof actions)[number]

function isDirectorAction(value: unknown): value is DirectorAction {
  return typeof value === "string" && actions.includes(value as DirectorAction)
}

export async function PATCH(req: Request) {
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

  const body = await req.json().catch(() => null)
  const userId = typeof body?.userId === "string" ? body.userId : ""
  const action = isDirectorAction(body?.action) ? body.action : null
  const nextRole = isRole(body?.role) ? body.role : null

  if (!userId || !action) {
    return Response.json({ error: "User id and valid action are required" }, { status: 400 })
  }

  if (userId === directorId && (action === "ban" || action === "soft_delete" || action === "set_role")) {
    return Response.json({ error: "Director cannot restrict own account" }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    let result
    let metadata = {}

    if (action === "set_role") {
      if (!nextRole || nextRole === "director") {
        await client.query("ROLLBACK")
        return Response.json({ error: "Role must be client, manager or developer" }, { status: 400 })
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
      metadata = { role: nextRole }
    } else if (action === "ban" || action === "unban") {
      result = await client.query(
        `
          UPDATE users
          SET is_banned = $1
          WHERE id = $2::UUID AND deleted_at IS NULL
          RETURNING id, email, name, role, is_banned
        `,
        [action === "ban", userId],
      )
      metadata = { is_banned: action === "ban" }
    } else {
      result = await client.query(
        `
          UPDATE users
          SET deleted_at = NOW(), status = 'inactive'
          WHERE id = $1::UUID AND deleted_at IS NULL
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
        VALUES ($1::UUID, $2::UUID, $3, $4)
      `,
      [directorId, userId, action, JSON.stringify(metadata)],
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
