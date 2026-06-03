import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { sendEmailNotification } from "@/lib/email"
import { extractRequirements, type SavedDialogMessage } from "@/lib/requirements"

async function ensureProjectColumns(pool: NonNullable<ReturnType<typeof getPool>>) {
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS requirements_json JSONB")
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_released BOOLEAN NOT NULL DEFAULT FALSE")
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ")
  await pool.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ")
}

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const briefText = typeof body?.briefText === "string" ? body.briefText.trim() : ""
  const messages: SavedDialogMessage[] = Array.isArray(body?.messages)
    ? body.messages.filter((message: SavedDialogMessage) => typeof message?.role === "string" && typeof message?.text === "string")
    : []

  if (!briefText) {
    return Response.json({ error: "Brief text is required" }, { status: 400 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId || role !== "client") {
    return Response.json({ error: "Войдите или зарегистрируйтесь, чтобы сохранить проект" }, { status: 401 })
  }

  try {
    await ensureProjectColumns(pool)

    const managers = await pool.query(`SELECT id, email, name, status FROM users WHERE role = 'manager' LIMIT 10`)

    console.log("[send-to-manager] Found managers:", managers.rows.length)
    if (managers.rows.length === 0) {
      console.error("[send-to-manager] No managers found in database")
      return Response.json({ error: "No managers found in database" }, { status: 404 })
    }

    const activeManagers = managers.rows.filter((m) => m.status === 'active')
    console.log("[send-to-manager] Active managers:", activeManagers.length)

    if (activeManagers.length === 0) {
      console.error("[send-to-manager] No active managers found. All managers:", managers.rows)
      return Response.json({ error: "No active managers found. Please contact administrator." }, { status: 404 })
    }

    const assignedManager = activeManagers[0]
    console.log("[send-to-manager] Assigned manager:", assignedManager.email)

    const project = await pool.query(
      `
        INSERT INTO projects (client_id, manager_id, title, brief_text, requirements_json, status)
        VALUES ($1, $2, $3, $4, $5, 'draft')
        RETURNING id
      `,
      [userId, assignedManager.id, "Новое ТЗ из NeuralBrief", briefText, JSON.stringify(extractRequirements(messages))],
    )

    console.log("[send-to-manager] Project created:", project.rows[0].id)

    await pool.query(
      `
        INSERT INTO notifications (user_id, title, body, channel)
        VALUES ($1, 'Новое ТЗ на рассмотрение', $2, 'system')
      `,
      [assignedManager.id, `Клиент отправил ТЗ менеджеру. Project ID: ${project.rows[0].id}`],
    )

    await sendEmailNotification({
      to: assignedManager.email,
      subject: "Новое ТЗ на рассмотрение",
      text: `Клиент отправил новое ТЗ. Откройте панель менеджера: проект ${project.rows[0].id}`,
    })

    console.log("[send-to-manager] Notification sent to:", assignedManager.email)

    return Response.json({ ok: true, projectId: project.rows[0].id, managerId: assignedManager.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown manager notification error"

    return Response.json({ error: message }, { status: 500 })
  }
}
