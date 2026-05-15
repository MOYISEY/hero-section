import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

const actions = ["mark_as_read", "delete", "clear_all"] as const

type NotificationAction = (typeof actions)[number]

function isNotificationAction(value: unknown): value is NotificationAction {
  return typeof value === "string" && actions.includes(value as NotificationAction)
}

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const notificationId = typeof body?.notificationId === "string" ? body.notificationId : ""
  const action = isNotificationAction(body?.action) ? body.action : null

  if (!action) {
    return Response.json({ error: "Valid action is required" }, { status: 400 })
  }

  if (action !== "clear_all" && !notificationId) {
    return Response.json({ error: "Notification id is required" }, { status: 400 })
  }

  if (action === "clear_all") {
    await pool.query(
      `
        UPDATE notifications
        SET deleted_at = NOW()
        WHERE user_id = $1::UUID AND deleted_at IS NULL
      `,
      [userId],
    )

    return Response.json({ ok: true })
  }

  if (action === "mark_as_read") {
    const result = await pool.query(
      `
        UPDATE notifications
        SET read_at = COALESCE(read_at, NOW())
        WHERE id = $1::UUID AND user_id = $2::UUID AND deleted_at IS NULL
        RETURNING id
      `,
      [notificationId, userId],
    )

    if (!result.rows[0]) {
      return Response.json({ error: "Notification not found" }, { status: 404 })
    }

    return Response.json({ ok: true })
  }

  const result = await pool.query(
    `
      UPDATE notifications
      SET deleted_at = NOW()
      WHERE id = $1::UUID AND user_id = $2::UUID AND deleted_at IS NULL
      RETURNING id
    `,
    [notificationId, userId],
  )

  if (!result.rows[0]) {
    return Response.json({ error: "Notification not found" }, { status: 404 })
  }

  return Response.json({ ok: true })
}
