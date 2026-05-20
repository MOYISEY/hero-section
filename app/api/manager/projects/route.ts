import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { sendEmailNotification } from "@/lib/email"
import { createTrelloCard } from "@/lib/trello"

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
  const action = body?.action === "reject" ? "reject" : body?.action === "approve" ? "approve" : body?.action === "close_task" ? "close_task" : body?.action === "return_task" ? "return_task" : body?.action === "delete_done" ? "delete_done" : null
  const developerId = typeof body?.developerId === "string" ? body.developerId : ""
  const comment = typeof body?.comment === "string" ? body.comment.trim() : ""

  if (!projectId || !action) {
    return Response.json({ error: "Project id and action are required" }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    if (action === "delete_done") {
      const result = await client.query(
        `
          UPDATE projects
          SET archived_at = NOW(), updated_at = NOW()
          WHERE id = $1 AND manager_id = $2 AND status = 'done'
          RETURNING id
        `,
        [projectId, managerId],
      )

      if (!result.rows[0]) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Only done projects can be removed from manager list" }, { status: 404 })
      }

      await client.query("COMMIT")
      return Response.json({ ok: true, status: "archived" })
    }

    if (action === "return_task") {
      if (!comment) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Комментарий обязателен при возврате задачи" }, { status: 400 })
      }

      const result = await client.query(
        `
          UPDATE projects
          SET status = 'in_development', updated_at = NOW()
          WHERE id = $1 AND manager_id = $2 AND status = 'review'
          RETURNING id, title
        `,
        [projectId, managerId],
      )

      const project = result.rows[0]

      if (!project) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Project is not available for return" }, { status: 404 })
      }

      const tasks = await client.query(
        `
          UPDATE tasks
          SET status = 'in_progress', updated_at = NOW()
          WHERE project_id = $1
          RETURNING id, title
        `,
        [project.id],
      )

      await client.query(
        `
          INSERT INTO project_chat_messages (chat_id, sender_id, content)
          SELECT pc.id, $2::UUID, $3
          FROM project_chats pc
          WHERE pc.project_id = $1 AND pc.channel = 'manager_developer'
        `,
        [project.id, managerId, `Задача возвращена на доработку: ${comment}`],
      )

      await client.query(
        `
          INSERT INTO notifications (user_id, title, body, channel)
          SELECT ta.developer_id, 'Задача возвращена на доработку', $1, 'system'
          FROM task_assignments ta
          JOIN tasks t ON t.id = ta.task_id
          WHERE t.project_id = $2
        `,
        [`Менеджер вернул проект "${project.title}" на доработку: ${comment}`, project.id],
      )

      const developers = await client.query(
        `
          SELECT DISTINCT u.email
          FROM task_assignments ta
          JOIN tasks t ON t.id = ta.task_id
          JOIN users u ON u.id = ta.developer_id
          WHERE t.project_id = $1
        `,
        [project.id],
      )

      await client.query("COMMIT")
      await Promise.all(developers.rows.map((developer) => sendEmailNotification({
        to: developer.email,
        subject: "Задача возвращена на доработку",
        text: `Менеджер вернул проект "${project.title}" на доработку: ${comment}`,
      })))
      return Response.json({ ok: true, status: "returned", tasks: tasks.rows.length })
    }

    if (action === "close_task") {
      const result = await client.query(
        `
          UPDATE projects
          SET status = 'done', updated_at = NOW()
          WHERE id = $1 AND manager_id = $2 AND status = 'review'
          RETURNING id, title, client_id
        `,
        [projectId, managerId],
      )

      const project = result.rows[0]

      if (!project) {
        await client.query("ROLLBACK")
        return Response.json({ error: "Project is not ready to close" }, { status: 404 })
      }

      await client.query(
        `
          UPDATE tasks
          SET status = 'done', completed_at = NOW(), updated_at = NOW()
          WHERE project_id = $1
        `,
        [project.id],
      )

      if (project.client_id) {
        await client.query(
          `
            INSERT INTO notifications (user_id, title, body, channel)
            VALUES ($1, 'Проект готов', $2, 'system')
          `,
          [project.client_id, `Менеджер закрыл задачу по проекту: ${project.title}`],
        )
      }

      const projectClient = project.client_id ? await client.query("SELECT email FROM users WHERE id = $1::UUID", [project.client_id]) : { rows: [] }

      await client.query("COMMIT")
      await sendEmailNotification({
        to: projectClient.rows[0]?.email,
        subject: "Проект готов",
        text: `Менеджер закрыл задачу по проекту: ${project.title}`,
      })
      return Response.json({ ok: true, status: "done" })
    }

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

    const developer = await client.query("SELECT email FROM users WHERE id = $1::UUID", [developerId])

    await client.query(
      `
        INSERT INTO project_chats (project_id, channel, target_user_id)
        VALUES ($1::UUID, 'manager_client', NULL)
        ON CONFLICT DO NOTHING
      `,
      [projectId],
    )

    await client.query(
      `
        INSERT INTO project_chats (project_id, channel, target_user_id)
        VALUES ($1::UUID, 'manager_developer', NULL)
        ON CONFLICT DO NOTHING
      `,
      [projectId],
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
    await createTrelloCard({
      name: project.rows[0].title,
      description: [
        project.rows[0].brief_text || "Описание проекта не указано.",
        "",
        `Project ID: ${projectId}`,
        `Task ID: ${task.rows[0].id}`,
      ].join("\n"),
    })
    await sendEmailNotification({
      to: developer.rows[0]?.email,
      subject: "Новая задача назначена",
      text: `Менеджер назначил вам задачу по проекту: ${project.rows[0].title}`,
    })

    return Response.json({ ok: true, status: "approved", taskId: task.rows[0].id })
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    const message = error instanceof Error ? error.message : "Unknown manager action error"

    return Response.json({ error: message }, { status: 500 })
  } finally {
    client.release()
  }
}
