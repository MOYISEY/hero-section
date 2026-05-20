import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

export async function GET() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const managerId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!managerId || role !== "manager") {
    return Response.json({ error: "Only manager can view chats" }, { status: 403 })
  }

  const result = await pool.query(
    `
      SELECT
        p.id AS project_id,
        p.title AS project_title,
        LEFT(p.id::TEXT, 8) AS project_short_id,
        LEFT(COALESCE(t.id::TEXT, ''), 8) AS task_short_id,
        COALESCE(t.description, p.brief_text, '') AS summary,
        COALESCE(t.repository_url, p.repository_url, '') AS repository_url,
        p.status AS project_status,
        p.created_at,
        COALESCE(client.name, 'Клиент') AS client_name,
        client.email AS client_email,
        developer.name AS developer_name,
        developer.email AS developer_email,
        MAX(CASE WHEN pc.channel = 'manager_client' THEN pcm.created_at END) AS client_last_message_at,
        MAX(CASE WHEN pc.channel = 'manager_developer' THEN pcm.created_at END) AS developer_last_message_at
      FROM projects p
      LEFT JOIN users client ON client.id = p.client_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users developer ON developer.id = ta.developer_id
      LEFT JOIN project_chats pc ON pc.project_id = p.id
      LEFT JOIN project_chat_messages pcm ON pcm.chat_id = pc.id
      WHERE (p.manager_id = $1::UUID OR (p.status = 'draft' AND p.archived_at IS NULL))
        AND p.archived_at IS NULL
      GROUP BY p.id, p.title, t.id, t.description, t.repository_url, p.brief_text, p.repository_url, p.status, p.created_at, client.name, client.email, developer.name, developer.email
      ORDER BY GREATEST(
        COALESCE(MAX(pcm.created_at), p.created_at),
        p.created_at
      ) DESC
      LIMIT 50
    `,
    [managerId],
  )

  return Response.json({ chats: result.rows })
}
