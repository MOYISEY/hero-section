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

  const [stats, usersByRole, users, auditLog, projects] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('draft', 'in_development', 'review'))::INT AS active_projects,
        COUNT(*) FILTER (WHERE status = 'done')::INT AS done_projects,
        (SELECT COUNT(*)::INT FROM tasks WHERE status IN ('todo', 'in_progress', 'review')) AS active_tasks,
        COALESCE((SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM project_reviews), 0) AS average_rating
      FROM projects
    `),
    pool.query(`
      SELECT role, COUNT(*)::INT AS count
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY role
      ORDER BY role
    `),
    pool.query(`
      SELECT id, email, name, role, status, is_banned, specialization, created_at
      FROM users
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 50
    `),
    pool.query(`
      SELECT a.id, a.action, a.metadata, a.created_at, actor.name AS actor_name, target.name AS target_name
      FROM audit_log a
      LEFT JOIN users actor ON actor.id = a.actor_id
      LEFT JOIN users target ON target.id = a.target_user_id
      ORDER BY a.created_at DESC
      LIMIT 30
    `),
    pool.query(`
      SELECT p.id, p.title, p.status, p.is_released, p.created_at, c.name AS client_name, m.name AS manager_name
      FROM projects p
      LEFT JOIN users c ON c.id = p.client_id
      LEFT JOIN users m ON m.id = p.manager_id
      ORDER BY p.created_at DESC
      LIMIT 30
    `),
  ])

  return Response.json({
    stats: stats.rows[0],
    usersByRole: usersByRole.rows,
    users: users.rows,
    auditLog: auditLog.rows,
    projects: projects.rows,
  })
}
