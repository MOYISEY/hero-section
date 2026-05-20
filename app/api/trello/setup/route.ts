export async function GET() {
  const apiKey = process.env.TRELLO_API_KEY
  const token = process.env.TRELLO_TOKEN

  if (!apiKey || !token) {
    return Response.json(
      {
        error: "TRELLO_API_KEY и TRELLO_TOKEN не найдены",
        instruction:
          "Добавь TRELLO_API_KEY и TRELLO_TOKEN в .env.local, перезапусти сервер (pnpm dev) и обнови эту страницу.",
      },
      { status: 400 }
    )
  }

  try {
    // 1. Получить все доски пользователя
    const boardsRes = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}`
    )
    const boardsRaw = await boardsRes.text()

    if (!boardsRes.ok) {
      return Response.json(
        { error: "Trello отклонил запрос", status: boardsRes.status, body: boardsRaw, instruction: "Проверь TRELLO_API_KEY и TRELLO_TOKEN. Возможно, токен устарел или ключ неверный." },
        { status: 400 }
      )
    }

    const boards = JSON.parse(boardsRaw)

    if (!Array.isArray(boards)) {
      return Response.json(
        { error: "Неверный ответ от Trello", body: boardsRaw, instruction: "Проверь TRELLO_API_KEY и TRELLO_TOKEN." },
        { status: 400 }
      )
    }

    // 2. Найти доску "NeuralBrief Tasks" или создать
    let board = boards.find((b: any) => b.name === "NeuralBrief Tasks")

    if (!board) {
      const createBoardRes = await fetch(
        `https://api.trello.com/1/boards?key=${apiKey}&token=${token}&name=NeuralBrief Tasks&defaultLists=false`,
        { method: "POST" }
      )
      const boardRaw = await createBoardRes.text()
      board = JSON.parse(boardRaw)
      if (!board?.id) {
        return Response.json({ error: "Не удалось создать доску в Trello", status: createBoardRes.status, body: boardRaw }, { status: 500 })
      }
    }

    // 3. Получить списки в доске
    const listsRes = await fetch(
      `https://api.trello.com/1/boards/${board.id}/lists?key=${apiKey}&token=${token}`
    )
    const listsRaw = await listsRes.text()
    const lists = JSON.parse(listsRaw)

    // 4. Найти список "Задачи" или создать
    let list = lists.find((l: any) => l.name === "Задачи")

    if (!list) {
      const createListRes = await fetch(
        `https://api.trello.com/1/lists?key=${apiKey}&token=${token}&idBoard=${board.id}&name=Задачи`,
        { method: "POST" }
      )
      const listRaw = await createListRes.text()
      list = JSON.parse(listRaw)
      if (!list?.id) {
        return Response.json({ error: "Не удалось создать список в Trello", status: createListRes.status, body: listRaw }, { status: 500 })
      }
    }

    return Response.json({
      ok: true,
      message: "Скопируй значение ниже и добавь в .env.local",
      boardName: board.name,
      boardUrl: board.shortUrl || `https://trello.com/b/${board.shortLink || board.id}`,
      listName: list.name,
      TRELLO_TASKS_LIST_ID: list.id,
      envLine: `TRELLO_TASKS_LIST_ID=${list.id}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trello setup error"
    return Response.json({ error: message }, { status: 500 })
  }
}
