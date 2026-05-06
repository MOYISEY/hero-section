import { getPool } from "@/lib/db"

type SavedMessage = {
  role: string
  text: string
}

type SaveSessionBody = {
  messages?: SavedMessage[]
  briefText?: string
}

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ saved: false, reason: "DATABASE_URL is not configured" })
  }

  try {
    const body = (await req.json()) as SaveSessionBody
    const messages = Array.isArray(body.messages)
      ? body.messages.filter((message) => message.text?.trim())
      : []

    if (!messages.length) {
      return Response.json({ error: "No messages to save" }, { status: 400 })
    }

    const briefText = body.briefText?.trim() || null
    const client = await pool.connect()

    try {
      await client.query("BEGIN")

      const sessionResult = await client.query<{ id: string }>(
        "INSERT INTO chat_sessions (brief_text) VALUES ($1) RETURNING id",
        [briefText],
      )
      const sessionId = sessionResult.rows[0].id

      for (const message of messages) {
        await client.query(
          "INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)",
          [sessionId, message.role, message.text],
        )
      }

      await client.query("COMMIT")

      return Response.json({ saved: true, sessionId })
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error"

    return Response.json({ error: message }, { status: 500 })
  }
}
