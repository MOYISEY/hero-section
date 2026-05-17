import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

const channels = ["manager_client", "manager_developer", "director_user"] as const

type ChatChannel = (typeof channels)[number]

function isChatChannel(value: unknown): value is ChatChannel {
  return typeof value === "string" && channels.includes(value as ChatChannel)
}

async function canAccessChat(pool: NonNullable<ReturnType<typeof getPool>>, userId: string, role: string | null, channel: ChatChannel, projectId: string | null, targetUserId: string | null) {
  console.log("[chat:access] channel:", channel, "userId:", userId, "role:", role, "projectId:", projectId, "targetUserId:", targetUserId)

  if (channel === "director_user") {
    if (role === "director") return Boolean(targetUserId)
    return targetUserId === userId
  }

  if (!projectId) {
    console.log("[chat:access] denied: no projectId")
    return false
  }

  if (channel === "manager_client") {
    const result = await pool.query(
      `
        SELECT id, client_id, manager_id, status
        FROM projects
        WHERE id = $1::UUID
          AND (manager_id = $2::UUID OR client_id = $2::UUID OR ($3 = 'manager' AND status = 'draft'))
        LIMIT 1
      `,
      [projectId, userId, role],
    )
    console.log("[chat:access] manager_client query rows:", result.rows.length, result.rows[0])
    return Boolean(result.rows[0]) && (role === "manager" || role === "client")
  }

  const result = await pool.query(
    `
      SELECT p.id, p.manager_id, ta.developer_id
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      WHERE p.id = $1::UUID
        AND (p.manager_id = $2::UUID OR ta.developer_id = $2::UUID)
      LIMIT 1
    `,
    [projectId, userId],
  )
  console.log("[chat:access] manager_developer query rows:", result.rows.length, result.rows[0])

  return Boolean(result.rows[0]) && (role === "manager" || role === "developer")
}

async function ensureChat(pool: NonNullable<ReturnType<typeof getPool>>, channel: ChatChannel, projectId: string | null, targetUserId: string | null) {
  // PostgreSQL ON CONFLICT does not match NULL values, so we must search manually first.
  const existing = await pool.query(
    `
      SELECT id, project_id, channel, target_user_id, created_at
      FROM project_chats
      WHERE project_id = $1::UUID AND channel = $2 AND target_user_id IS NOT DISTINCT FROM $3::UUID
      LIMIT 1
    `,
    [projectId, channel, targetUserId],
  )

  if (existing.rows[0]) return existing.rows[0]

  const result = await pool.query(
    `
      INSERT INTO project_chats (project_id, channel, target_user_id)
      VALUES ($1::UUID, $2, $3::UUID)
      RETURNING id, project_id, channel, target_user_id, created_at
    `,
    [projectId, channel, targetUserId],
  )

  return result.rows[0]
}

async function ensureChatTables(pool: NonNullable<ReturnType<typeof getPool>>) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      channel TEXT NOT NULL CHECK (channel IN ('manager_client', 'manager_developer', 'director_user')),
      target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, channel, target_user_id)
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_id UUID NOT NULL REFERENCES project_chats(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

export async function GET(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  const url = new URL(req.url)
  const channel = isChatChannel(url.searchParams.get("channel")) ? url.searchParams.get("channel") as ChatChannel : null
  const projectId = url.searchParams.get("projectId")
  const targetUserId = url.searchParams.get("targetUserId")

  if (!channel) {
    return Response.json({ error: "Valid channel is required" }, { status: 400 })
  }

  await ensureChatTables(pool)
  const allowed = await canAccessChat(pool, userId, role, channel, projectId, targetUserId)

  if (!allowed) {
    return Response.json({ error: "Access denied" }, { status: 403 })
  }

  const chat = await ensureChat(pool, channel, projectId, targetUserId)
  const messages = await pool.query(
    `
      SELECT m.id, m.content, m.created_at, u.id AS sender_id, u.name AS sender_name, u.role AS sender_role
      FROM project_chat_messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.chat_id = $1::UUID
      ORDER BY m.created_at ASC
      LIMIT 100
    `,
    [chat.id],
  )

  return Response.json({ chat, messages: messages.rows })
}

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const channel = isChatChannel(body?.channel) ? body.channel : null
  const projectId = typeof body?.projectId === "string" ? body.projectId : null
  const targetUserId = typeof body?.targetUserId === "string" ? body.targetUserId : null
  const content = typeof body?.content === "string" ? body.content.trim() : ""

  console.log("[chat:post] body:", body, "channel:", channel, "projectId:", projectId, "content:", content ? "present" : "missing")

  if (!channel || !content) {
    return Response.json({ error: "Channel and message content are required" }, { status: 400 })
  }

  await ensureChatTables(pool)
  const allowed = await canAccessChat(pool, userId, role, channel, projectId, targetUserId)
  console.log("[chat:post] allowed:", allowed)

  if (!allowed) {
    return Response.json({ error: "Access denied" }, { status: 403 })
  }

  const chat = await ensureChat(pool, channel, projectId, targetUserId)
  const message = await pool.query(
    `
      INSERT INTO project_chat_messages (chat_id, sender_id, content)
      VALUES ($1::UUID, $2::UUID, $3)
      RETURNING id, chat_id, sender_id, content, created_at
    `,
    [chat.id, userId, content],
  )

  return Response.json({ ok: true, chat, message: message.rows[0] })
}

export async function DELETE(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  const url = new URL(req.url)
  const channel = isChatChannel(url.searchParams.get("channel")) ? url.searchParams.get("channel") as ChatChannel : null
  const projectId = url.searchParams.get("projectId")
  const targetUserId = url.searchParams.get("targetUserId")

  if (!channel) {
    return Response.json({ error: "Valid channel is required" }, { status: 400 })
  }

  await ensureChatTables(pool)
  const allowed = await canAccessChat(pool, userId, role, channel, projectId, targetUserId)

  if (!allowed) {
    return Response.json({ error: "Access denied" }, { status: 403 })
  }

  const chat = await ensureChat(pool, channel, projectId, targetUserId)
  await pool.query("DELETE FROM project_chat_messages WHERE chat_id = $1::UUID", [chat.id])

  return Response.json({ ok: true })
}
