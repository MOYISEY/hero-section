import { cookies } from "next/headers"
import { getPool } from "@/lib/db"

async function ensureProjectReviews(pool: NonNullable<ReturnType<typeof getPool>>) {
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
}

export async function POST(req: Request) {
  const pool = getPool()

  if (!pool) {
    return Response.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
  }

  const cookieStore = await cookies()
  const userId = cookieStore.get("neuralbrief.userId")?.value || null
  const role = cookieStore.get("neuralbrief.role")?.value || null

  if (!userId || role !== "client") {
    return Response.json({ error: "Only client can review project" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const projectId = typeof body?.projectId === "string" ? body.projectId : ""
  const rating = Number(body?.rating)
  const comment = typeof body?.comment === "string" ? body.comment.trim() : ""

  if (!projectId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Project id and rating 1-5 are required" }, { status: 400 })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    await ensureProjectReviews(pool)

    const project = await client.query(
      `
        UPDATE projects
        SET updated_at = NOW()
        WHERE id = $1::UUID AND client_id = $2::UUID AND status = 'done'
        RETURNING id
      `,
      [projectId, userId],
    )

    if (!project.rows[0]) {
      await client.query("ROLLBACK")
      return Response.json({ error: "Project is not ready for client review" }, { status: 404 })
    }

    const review = await client.query(
      `
        INSERT INTO project_reviews (project_id, client_id, rating, comment)
        VALUES ($1::UUID, $2::UUID, $3, $4)
        ON CONFLICT (project_id, client_id) DO UPDATE
        SET rating = EXCLUDED.rating,
            comment = EXCLUDED.comment,
            created_at = NOW()
        RETURNING id, rating, comment, created_at
      `,
      [projectId, userId, rating, comment || null],
    )

    await client.query("COMMIT")
    return Response.json({ ok: true, review: review.rows[0] })
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    const message = error instanceof Error ? error.message : "Unknown project review error"
    return Response.json({ error: message }, { status: 500 })
  } finally {
    client.release()
  }
}
