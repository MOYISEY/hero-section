type CreateTrelloCardInput = {
  name: string
  description?: string | null
  status?: TrelloTaskStatus
}

export type TrelloTaskStatus = "todo" | "in_progress" | "review" | "done"

export const trelloStatusLists: Record<TrelloTaskStatus, string> = {
  todo: "Задачи",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
}

function getCredentials() {
  const key = process.env.TRELLO_API_KEY
  const token = process.env.TRELLO_TOKEN
  const listId = process.env.TRELLO_TASKS_LIST_ID

  if (!key || !token || !listId) {
    console.warn("[trello] skipped:", !key ? "TRELLO_API_KEY is missing" : !token ? "TRELLO_TOKEN is missing" : "TRELLO_TASKS_LIST_ID is missing")
    return null
  }

  return { key, token, listId }
}

async function trelloFetch(path: string, params: Record<string, string>, init?: RequestInit) {
  const credentials = getCredentials()
  if (!credentials) return { skipped: true as const }

  const url = new URL(`https://api.trello.com/1/${path}`)
  url.searchParams.set("key", credentials.key)
  url.searchParams.set("token", credentials.token)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

  const response = await fetch(url, init)
  const body = typeof response.text === "function" ? await response.text().catch(() => "") : ""

  if (!response.ok) {
    console.error("[trello] failed:", response.status, body)
    return { skipped: false as const, error: body || "Trello provider error", status: response.status }
  }

  const data = body ? JSON.parse(body) : typeof response.json === "function" ? await response.json().catch(() => null) : null
  return { skipped: false as const, ok: true as const, data }
}

export async function getTrelloListIdForStatus(status: TrelloTaskStatus) {
  const credentials = getCredentials()
  if (!credentials) return { skipped: true as const }

  if (status === "todo") return { skipped: false as const, ok: true as const, listId: credentials.listId }

  const baseList = await trelloFetch(`lists/${credentials.listId}`, {})
  if ("skipped" in baseList && baseList.skipped) return baseList
  if (!baseList.ok) return baseList

  const boardId = baseList.data?.idBoard
  if (!boardId) return { skipped: false as const, error: "Trello board id was not found for configured list" }

  const listsResult = await trelloFetch(`boards/${boardId}/lists`, { filter: "open" })
  if ("skipped" in listsResult && listsResult.skipped) return listsResult
  if (!listsResult.ok) return listsResult

  const name = trelloStatusLists[status]
  const existing = Array.isArray(listsResult.data) ? listsResult.data.find((list: { name: string }) => list.name === name) : null
  if (existing?.id) return { skipped: false as const, ok: true as const, listId: existing.id }

  const created = await trelloFetch("lists", { idBoard: boardId, name }, { method: "POST" })
  if ("skipped" in created && created.skipped) return created
  if (!created.ok) return created

  return { skipped: false as const, ok: true as const, listId: created.data?.id }
}

export async function createTrelloCard({ name, description, status = "todo" }: CreateTrelloCardInput) {
  const list = await getTrelloListIdForStatus(status)
  if ("skipped" in list && list.skipped) return list
  if (!list.ok || !list.listId) return { skipped: false, error: list.error || "Trello list was not resolved" }

  const result = await trelloFetch("cards", { idList: list.listId, name, ...(description ? { desc: description } : {}) }, { method: "POST" })
  if ("skipped" in result && result.skipped) return result
  if (!result.ok) return { skipped: false, error: result.error }

  const card = result.data
  console.info("[trello] card created:", card?.shortUrl || card?.url || name)
  return { skipped: false, ok: true, card }
}

export async function moveTrelloCard(cardId: string | null | undefined, status: TrelloTaskStatus) {
  if (!cardId) return { skipped: true }

  const list = await getTrelloListIdForStatus(status)
  if ("skipped" in list && list.skipped) return list
  if (!list.ok || !list.listId) return { skipped: false, error: list.error || "Trello list was not resolved" }

  const result = await trelloFetch(`cards/${cardId}`, { idList: list.listId }, { method: "PUT" })
  if ("skipped" in result && result.skipped) return result
  if (!result.ok) return { skipped: false, error: result.error }

  console.info("[trello] card moved:", cardId, status)
  return { skipped: false, ok: true, card: result.data }
}
