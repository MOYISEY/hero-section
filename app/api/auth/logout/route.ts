import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.delete("neuralbrief.role")

  return Response.json({ ok: true })
}
