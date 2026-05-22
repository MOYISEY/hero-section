import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const role = cookieStore.get("neuralbrief.role")?.value

  if (role !== "director") {
    return Response.json({ error: "Only director can view dashboard" }, { status: 403 })
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      client_id UUID REFERENCES users(id) ON DELETE SET NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS project_reviews_project_client_idx ON project_reviews(project_id, client_id)")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS trello_card_id TEXT")
  await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS trello_card_url TEXT")

  const [stats, users, reviews, projects, board, boardStats] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE archived_at IS NULL
            AND status IN ('draft', 'in_development', 'review')
            AND NOT EXISTS (SELECT 1 FROM project_reviews pr WHERE pr.project_id = projects.id)
        )::INT AS active_projects,
        COUNT(*) FILTER (
          WHERE status = 'done'
            OR EXISTS (SELECT 1 FROM project_reviews pr WHERE pr.project_id = projects.id)
        )::INT AS done_projects,
        COALESCE((SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM project_reviews), 0) AS average_rating
      FROM projects
    `),
    pool.query(`
      SELECT id, email, name, role, status, is_banned, specialization, created_at
      FROM users
      WHERE deleted_at IS NULL AND role IN ('manager', 'developer')
      ORDER BY role, created_at DESC
    `),
    pool.query(`
      SELECT
        pr.id,
        pr.rating,
        NULLIF(TRIM(pr.comment), '') AS comment,
        pr.created_at,
        p.title AS project_title,
        client.name AS client_name,
        manager.name AS manager_name,
        developer.name AS developer_name
      FROM project_reviews pr
      JOIN projects p ON p.id = pr.project_id
      LEFT JOIN users client ON client.id = pr.client_id
      LEFT JOIN users manager ON manager.id = p.manager_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users developer ON developer.id = ta.developer_id
      ORDER BY pr.created_at DESC
      LIMIT 50
    `),
    pool.query(`
      SELECT
        p.id,
        p.title,
        p.status,
        p.is_released,
        p.created_at,
        p.updated_at,
        p.brief_text,
        c.name AS client_name,
        m.name AS manager_name,
        developer.name AS developer_name,
        t.status AS task_status,
        t.trello_card_url,
        t.repository_url,
        t.created_at AS task_created_at,
        t.updated_at AS task_updated_at,
        t.completed_at AS task_completed_at,
        EXTRACT(DAY FROM NOW() - COALESCE(t.created_at, p.created_at))::INT AS days_in_work
      FROM projects p
      LEFT JOIN users c ON c.id = p.client_id
      LEFT JOIN users m ON m.id = p.manager_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users developer ON developer.id = ta.developer_id
      WHERE p.archived_at IS NULL
        AND p.status <> 'rejected'
      ORDER BY p.created_at DESC
      LIMIT 30
    `),
    pool.query(`
      SELECT
        t.id,
        LEFT(t.id::TEXT, 8) AS short_id,
        t.title,
        t.description,
        t.status,
        t.repository_url,
        t.trello_card_url,
        t.created_at,
        t.updated_at,
        p.id AS project_id,
        p.title AS project_title,
        p.status AS project_status,
        client.name AS client_name,
        manager.name AS manager_name,
        developer.name AS developer_name
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN users client ON client.id = p.client_id
      LEFT JOIN users manager ON manager.id = p.manager_id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users developer ON developer.id = ta.developer_id
      WHERE p.archived_at IS NULL
        AND p.status <> 'rejected'
      ORDER BY t.updated_at DESC
      LIMIT 100
    `),
    pool.query(`
      SELECT status, COUNT(*)::INT AS count
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      WHERE p.archived_at IS NULL
        AND p.status <> 'rejected'
      GROUP BY status
    `),
  ])

  return Response.json({
    stats: stats.rows[0],
    users: users.rows,
    reviews: reviews.rows,
    projects: projects.rows,
    board: board.rows,
    boardStats: boardStats.rows,
  })
}
