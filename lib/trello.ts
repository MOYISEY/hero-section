type CreateTrelloCardInput = {
  name: string
  description?: string | null
}

export async function createTrelloCard({ name, description }: CreateTrelloCardInput) {
  const key = process.env.TRELLO_API_KEY
  const token = process.env.TRELLO_TOKEN
  const listId = process.env.TRELLO_TASKS_LIST_ID

  if (!key || !token || !listId) {
    console.warn("[trello] skipped:", !key ? "TRELLO_API_KEY is missing" : !token ? "TRELLO_TOKEN is missing" : "TRELLO_TASKS_LIST_ID is missing")
    return { skipped: true }
  }

  const url = new URL("https://api.trello.com/1/cards")
  url.searchParams.set("key", key)
  url.searchParams.set("token", token)
  url.searchParams.set("idList", listId)
  url.searchParams.set("name", name)
  if (description) url.searchParams.set("desc", description)

  const response = await fetch(url, { method: "POST" })

  if (!response.ok) {
    const message = await response.text().catch(() => "Trello provider error")
    console.error("[trello] failed:", response.status, message)
    return { skipped: false, error: message }
  }

  const card = await response.json().catch(() => null)
  console.info("[trello] card created:", card?.shortUrl || card?.url || name)
  return { skipped: false, ok: true, card }
}
