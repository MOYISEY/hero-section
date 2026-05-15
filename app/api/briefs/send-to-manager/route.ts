import { cookies } from "next/headers"
import { getPool } from "@/lib/db"
import { extractRequirements, type SavedDialogMessage } from "@/lib/requirements"

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
    const managers = await pool.query(`SELECT id FROM users WHERE role = 'manager' AND status = 'active' LIMIT 10`)

    if (managers.rows.length === 0) {
      return Response.json({ error: "No active managers found" }, { status: 404 })
    }

    const project = await pool.query(
      `
        INSERT INTO projects (client_id, title, brief_text, requirements_json, status)
        VALUES ($1, $2, $3, $4, 'draft')
        RETURNING id
      `,
      [userId, "Новое ТЗ из NeuralBrief", briefText, JSON.stringify(extractRequirements(messages))],
    )

    await Promise.all(
      managers.rows.map((manager) =>
        pool.query(
          `
            INSERT INTO notifications (user_id, title, body, channel)
            VALUES ($1, 'Новое ТЗ на рассмотрение', $2, 'system')
          `,
          [manager.id, `Клиент отправил ТЗ менеджеру. Project ID: ${project.rows[0].id}`],
        ),
      ),
    )

    return Response.json({ ok: true, projectId: project.rows[0].id, notifiedManagers: managers.rows.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown manager notification error"

    return Response.json({ error: message }, { status: 500 })
  }
}
