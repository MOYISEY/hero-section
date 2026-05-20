export async function POST() {
  return Response.json({ error: "Project cleanup is disabled" }, { status: 410 })
}
