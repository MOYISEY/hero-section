import { getPool } from "@/lib/db"

const fallbackData = {
  chats: [
    { id: "demo-1", client: "Клиент A", state: "ИИ уточняет функции", tone: "stable" },
    { id: "demo-2", client: "Клиент B", state: "Нужен перехват менеджера", tone: "warning" },
    { id: "demo-3", client: "Клиент C", state: "Финальное согласование ТЗ", tone: "success" },
  ],
  developers: [
    { id: "dev-1", name: "Frontend developer", stack: "React / UI", load: "Свободен" },
    { id: "dev-2", name: "Backend developer", stack: "Node.js / PostgreSQL", load: "В работе" },
  ],
  tasks: [
    { id: "NB-104", title: "Лендинг для SaaS-продукта", status: "В работе", repo: "github.com/studio/project" },
  ],
  events: ["Менеджер назначил задачу NB-104", "Новое сообщение в командном чате"],
  wiki: ["Code Style", "Доступы к хостингам", "Правила деплоя"],
}

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ source: "fallback", ...fallbackData })
  }

  try {
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
        SELECT title
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT title
        FROM wiki_pages
        ORDER BY updated_at DESC
        LIMIT 6
      `),
    ])

    return Response.json({
      source: "database",
      chats: sessionsResult.rows.length ? sessionsResult.rows : fallbackData.chats,
      developers: developersResult.rows.length ? developersResult.rows : fallbackData.developers,
      tasks: tasksResult.rows.length ? tasksResult.rows : fallbackData.tasks,
      events: notificationsResult.rows.length ? notificationsResult.rows.map((row) => row.title) : fallbackData.events,
      wiki: wikiResult.rows.length ? wikiResult.rows.map((row) => row.title) : fallbackData.wiki,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CRM database error"

    return Response.json({ error: message, source: "error", ...fallbackData }, { status: 500 })
  }
}
