import { getPool } from "@/lib/db"
import { cookies } from "next/headers"

const emptyData = {
  requests: [],
  developers: [],
  tasks: [],
  managerTasks: [],
  notifications: [],
}

async function ensureCrmColumns(pool: NonNullable<ReturnType<typeof getPool>>) {
  await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ")
  await pool.query("ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ")
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repository_url TEXT")
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS repository_url TEXT")
}

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ source: "empty", ...emptyData })
  }

  try {
    await ensureCrmColumns(pool)

    const cookieStore = await cookies()
    const userId = cookieStore.get("neuralbrief.userId")?.value || null
    const role = cookieStore.get("neuralbrief.role")?.value || null

    const [requestsResult, developersResult, tasksResult, managerTasksResult, notificationsResult] = await Promise.all([
      pool.query(`
        SELECT
          p.id,
          p.title,
          p.brief_text,
          p.status,
          p.created_at,
          COALESCE(u.name, 'Клиент') AS client_name,
          u.email AS client_email
        FROM projects p
        LEFT JOIN users u ON u.id = p.client_id
        WHERE p.status = 'draft'
        ORDER BY p.created_at DESC
        LIMIT 12
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
      role === "developer" && userId ? pool.query(`
        SELECT
          t.id,
          LEFT(t.id::TEXT, 8) AS short_id,
          t.title,
          t.description,
          t.status AS raw_status,
          CASE t.status
            WHEN 'todo' THEN 'Новая'
            WHEN 'in_progress' THEN 'В работе'
            WHEN 'review' THEN 'На проверке'
            WHEN 'done' THEN 'Готово'
          END AS status,
          COALESCE(t.repository_url, p.repository_url, '') AS repo,
          p.id AS project_id,
          p.title AS project_title,
          p.created_at AS project_created_at,
          COALESCE(c.name, 'Клиент') AS client_name,
          c.email AS client_email
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        LEFT JOIN users c ON c.id = p.client_id
        JOIN task_assignments ta ON ta.task_id = t.id
        WHERE ta.developer_id = $1::UUID
          AND t.status <> 'done'
        ORDER BY t.created_at DESC
        LIMIT 8
      `, [userId]) : Promise.resolve({ rows: [] }),
      role === "manager" && userId ? pool.query(`
        SELECT
          t.id,
          LEFT(t.id::TEXT, 8) AS short_id,
          t.title,
          t.description,
          t.status AS raw_status,
          CASE t.status
            WHEN 'todo' THEN 'Новая'
            WHEN 'in_progress' THEN 'В работе'
            WHEN 'review' THEN 'На проверке'
            WHEN 'done' THEN 'Готово'
          END AS status,
          COALESCE(t.repository_url, p.repository_url, '') AS repo,
          u.name AS developer_name,
          p.id AS project_id,
          p.title AS project_title,
          p.status AS project_status
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        LEFT JOIN task_assignments ta ON ta.task_id = t.id
        LEFT JOIN users u ON u.id = ta.developer_id
        WHERE p.manager_id = $1::UUID
          AND p.archived_at IS NULL
        ORDER BY t.updated_at DESC
        LIMIT 10
      `, [userId]) : Promise.resolve({ rows: [] }),
      pool.query(`
        SELECT id, title, body, read_at, created_at
        FROM notifications
        WHERE ($1::UUID IS NULL OR user_id = $1::UUID)
          AND deleted_at IS NULL
        ORDER BY CASE WHEN read_at IS NULL THEN 0 ELSE 1 END, created_at DESC
        LIMIT 12
      `, [userId]),
    ])

    return Response.json({
      source: "database",
      requests: role === "manager" ? requestsResult.rows : [],
      developers: developersResult.rows,
      tasks: tasksResult.rows,
      managerTasks: managerTasksResult.rows,
      notifications: notificationsResult.rows,
      events: notificationsResult.rows.map((row) => ({ id: row.id, title: row.title, body: row.body, read_at: row.read_at, created_at: row.created_at })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CRM database error"

    return Response.json({ error: message, source: "error", ...emptyData }, { status: 500 })
  }
}
