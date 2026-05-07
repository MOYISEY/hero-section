import { getPool } from "@/lib/db"
import { cookies } from "next/headers"

const emptyData = {
  chats: [],
  developers: [],
  tasks: [],
  notifications: [],
  wiki: [],
}

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ source: "empty", ...emptyData })
  }

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("neuralbrief.userId")?.value || null
    const role = cookieStore.get("neuralbrief.role")?.value || null

    const [sessionsResult, developersResult, tasksResult, notificationsResult, wikiResult] = await Promise.all([
      pool.query(`
        SELECT
          cs.id,
          COALESCE(NULLIF(SPLIT_PART(cm.content, '.', 1), ''), 'Клиент') AS client,
          CASE WHEN cs.brief_text IS NULL THEN 'ИИ собирает данные для ТЗ' ELSE 'Финальное согласование ТЗ' END AS state,
          CASE WHEN cs.brief_text IS NULL THEN 'stable' ELSE 'success' END AS tone
        FROM chat_sessions cs
        LEFT JOIN LATERAL (
          SELECT content
          FROM chat_messages
          WHERE session_id = cs.id AND role = 'user'
          ORDER BY created_at ASC
          LIMIT 1
        ) cm ON true
        WHERE cs.brief_text IS NOT NULL
        ORDER BY cs.created_at DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT
          u.id,
          u.name,
          COALESCE(u.specialization, 'Web development') AS stack,
          CASE WHEN COUNT(t.id) FILTER (WHERE t.status IN ('todo', 'in_progress', 'review')) = 0
            THEN 'Свободен'
            ELSE 'В работе над задачей ' || MIN(LEFT(t.id::TEXT, 8))
          END AS load
        FROM users u
        LEFT JOIN task_assignments ta ON ta.developer_id = u.id
        LEFT JOIN tasks t ON t.id = ta.task_id
        WHERE u.role = 'developer'
          AND u.email NOT LIKE '%.demo@neuralbrief.local'
        GROUP BY u.id, u.name, u.specialization
        ORDER BY u.created_at ASC
        LIMIT 6
      `),
      pool.query(`
        SELECT
          LEFT(t.id::TEXT, 8) AS id,
          t.title,
          CASE t.status
            WHEN 'todo' THEN 'Новая'
            WHEN 'in_progress' THEN 'В работе'
            WHEN 'review' THEN 'На проверке'
            WHEN 'done' THEN 'Готово'
          END AS status,
          COALESCE(t.repository_url, p.repository_url, 'Репозиторий не прикреплён') AS repo
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        ORDER BY t.created_at DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT id, title, body, created_at
        FROM notifications
        WHERE ($1::UUID IS NULL OR user_id = $1::UUID)
        ORDER BY created_at DESC
        LIMIT 6
      `, [userId]),
      pool.query(`
        SELECT title
        FROM wiki_pages
        ORDER BY updated_at DESC
        LIMIT 6
      `),
    ])

    return Response.json({
      source: "database",
      chats: role === "manager" ? sessionsResult.rows : [],
      developers: developersResult.rows,
      tasks: tasksResult.rows,
      notifications: notificationsResult.rows,
      events: notificationsResult.rows.map((row) => ({ id: row.id, title: row.title, body: row.body })),
      wiki: wikiResult.rows.map((row) => row.title),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CRM database error"

    return Response.json({ error: message, source: "error", ...emptyData }, { status: 500 })
  }
}
