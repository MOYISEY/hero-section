import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

const allowedStatuses = ["in_progress", "review", "done"]

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const developerId = cookieStore.get("neuralbrief.userId")?.value
  const role = cookieStore.get("neuralbrief.role")?.value

  if (!developerId || role !== "developer") {
    return Response.json({ error: "Only developer can update assigned tasks" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const taskId = typeof body?.taskId === "string" ? body.taskId : ""
  const status = typeof body?.status === "string" && allowedStatuses.includes(body.status) ? body.status : null

  if (!taskId || !status) {
    return Response.json({ error: "Task id and valid status are required" }, { status: 400 })
  }

  const result = await pool.query(
    `
      UPDATE tasks t
      SET status = $1,
          started_at = CASE WHEN $1 = 'in_progress' AND started_at IS NULL THEN NOW() ELSE started_at END,
          completed_at = CASE WHEN $1 = 'done' THEN NOW() ELSE completed_at END,
          updated_at = NOW()
      FROM task_assignments ta
      WHERE t.id = ta.task_id
        AND ta.developer_id = $2
        AND t.id = $3
      RETURNING t.id, t.title, t.status
    `,
    [status, developerId, taskId],
  )

  const task = result.rows[0]

  if (!task) {
    return Response.json({ error: "Task not found or not assigned to you" }, { status: 404 })
  }

  if (status === "review" || status === "done") {
    await pool.query(
      `
        INSERT INTO notifications (user_id, title, body, channel)
        SELECT p.manager_id, 'Статус задачи обновлён', $1, 'system'
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        WHERE t.id = $2 AND p.manager_id IS NOT NULL
      `,
      [`Разработчик обновил задачу "${task.title}" до статуса ${status}.`, task.id],
    )
  }

  return Response.json({ ok: true, task })
}
