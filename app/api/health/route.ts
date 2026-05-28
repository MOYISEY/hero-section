import { getPool } from "@/lib/db"

export async function GET() {
  const startedAt = Date.now()
  const pool = getPool()

  if (!pool) {
    return Response.json(
      {
        ok: false,
        service: "neuralbrief",
        database: "not_configured",
        checkedAt: new Date().toISOString(),
      },
      { status: 500 },
    )
  }

  try {
    await pool.query("SELECT 1")

    return Response.json({
      ok: true,
      service: "neuralbrief",
      database: "ready",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database healthcheck error"

    return Response.json(
      {
        ok: false,
        service: "neuralbrief",
        database: "unavailable",
        error: message,
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
