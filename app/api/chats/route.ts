import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

const channels = ["manager_client", "manager_developer", "director_user"] as const

type ChatChannel = (typeof channels)[number]

function isChatChannel(value: unknown): value is ChatChannel {
  return typeof value === "string" && channels.includes(value as ChatChannel)
}

async function canAccessChat(pool: NonNullable<ReturnType<typeof getPool>>, userId: string, role: string | null, channel: ChatChannel, projectId: string | null, targetUserId: string | null) {
  if (channel === "director_user") {
    if (role === "director") return Boolean(targetUserId)
    return targetUserId === userId
  }

  if (!projectId) return false

  if (channel === "manager_client") {
    const result = await pool.query(
      `
        SELECT id
        FROM projects
        WHERE id = $1::UUID
          AND (manager_id = $2::UUID OR client_id = $2::UUID)
        LIMIT 1
      `,
      [projectId, userId],
    )

    return Boolean(result.rows[0]) && (role === "manager" || role === "client")
  }

  const result = await pool.query(
    `
      SELECT p.id
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      WHERE p.id = $1::UUID
        AND (p.manager_id = $2::UUID OR ta.developer_id = $2::UUID)
      LIMIT 1
    `,
    [projectId, userId],
  )

  return Boolean(result.rows[0]) && (role === "manager" || role === "developer")
}

async function ensureChat(pool: NonNullable<ReturnType<typeof getPool>>, channel: ChatChannel, projectId: string | null, targetUserId: string | null) {
  const result = await pool.query(
    `
      INSERT INTO project_chats (project_id, channel, target_user_id)
      VALUES ($1::UUID, $2, $3::UUID)
      ON CONFLICT (project_id, channel, target_user_id) DO UPDATE
      SET channel = EXCLUDED.channel
      RETURNING id, project_id, channel, target_user_id, created_at
    `,
    [projectId, channel, targetUserId],
  )

  return result.rows[0]
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

  if (!channel || !content) {
    return Response.json({ error: "Channel and message content are required" }, { status: 400 })
  }

  const allowed = await canAccessChat(pool, userId, role, channel, projectId, targetUserId)

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
