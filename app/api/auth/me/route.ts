import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const role = cookieStore.get("neuralbrief.role")?.value || null

  return Response.json({ role })
}
