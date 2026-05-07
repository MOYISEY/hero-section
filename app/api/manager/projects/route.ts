import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function PATCH(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const managerId = cookieStore.get("neuralbrief.userId")?.value
  const role = cookieStore.get("neuralbrief.role")?.value

  if (!managerId || role !== "manager") {
    return Response.json({ error: "Only manager can review projects" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const projectId = typeof body?.projectId === "string" ? body.projectId : ""
  const action = body?.action === "reject" ? "reject" : body?.action === "approve" ? "approve" : null
  const developerId = typeof body?.developerId === "string" ? body.developerId : ""

  if (!projectId || !action) {
    return Response.json({ error: "Project id and action are required" }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    if (action === "reject") {
      const result = await client.query(
        `
          UPDATE projects
          SET status = 'rejected', manager_id = $2, updated_at = NOW()
          WHERE id = $1 AND status = 'draft'
          RETURNING id
        `,
        [projectId, managerId],
      )

      if (!result.rows[0]) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Project is not available for review" }, { status: 404 })
      }

      await client.query(
        `
          UPDATE notifications
          SET read_at = NOW()
          WHERE user_id = $1
            AND read_at IS NULL
            AND (body LIKE '%' || $2::TEXT || '%' OR title = 'Новое ТЗ на рассмотрение')
        `,
        [managerId, projectId],
      )

      await client.query("COMMIT")
      return Response.json({ ok: true, status: "rejected" })
    }

    if (!developerId) {
      await client.query("ROLLBACK")
      return Response.json({ error: "Developer is required for approval" }, { status: 400 })
    }

    const project = await client.query(
      `
        UPDATE projects
        SET status = 'in_development', manager_id = $2, updated_at = NOW()
        WHERE id = $1 AND status = 'draft'
        RETURNING id, title, brief_text
      `,
      [projectId, managerId],
    )

    if (!project.rows[0]) {
      await client.query("ROLLBACK")
      return Response.json({ error: "Project is not available for review" }, { status: 404 })
    }

    const task = await client.query(
      `
        INSERT INTO tasks (project_id, title, description, status)
        VALUES ($1, $2, $3, 'todo')
        RETURNING id
      `,
      [projectId, project.rows[0].title, project.rows[0].brief_text],
    )

    await client.query(
      `
        INSERT INTO task_assignments (task_id, developer_id, assigned_by)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `,
      [task.rows[0].id, developerId, managerId],
    )

    await client.query(
      `
        INSERT INTO notifications (user_id, title, body, channel)
        VALUES ($1, 'Новая задача назначена', $2, 'system')
      `,
      [developerId, `Менеджер назначил задачу по проекту: ${project.rows[0].title}`],
    )

    await client.query(
      `
        UPDATE notifications
        SET read_at = NOW()
        WHERE user_id = $1
          AND read_at IS NULL
          AND (body LIKE '%' || $2::TEXT || '%' OR title = 'Новое ТЗ на рассмотрение')
      `,
      [managerId, projectId],
    )

    await client.query("COMMIT")

    return Response.json({ ok: true, status: "approved", taskId: task.rows[0].id })
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    const message = error instanceof Error ? error.message : "Unknown manager action error"

    return Response.json({ error: message }, { status: 500 })
  } finally {
    client.release()
  }
}
