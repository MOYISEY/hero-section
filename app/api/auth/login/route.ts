import { cookies } from "next/headers"

const roles = new Set(["client", "manager", "developer"])

export async function POST(req: Request) {
  const { role } = await req.json().catch(() => ({ role: "" }))

  if (typeof role !== "string" || !roles.has(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 })
  }

  const cookieStore = await cookies()

  cookieStore.set("neuralbrief.role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ ok: true, role })
}
