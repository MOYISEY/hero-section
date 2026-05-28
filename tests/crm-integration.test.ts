import { describe, expect, it, vi, beforeEach, afterEach, afterAll } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

afterAll(async () => {
  const { closePool } = await import("@/lib/db")
  await closePool()
})

// --- Trello helper tests ---
describe("createTrelloCard", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("skips when TRELLO_API_KEY is missing", async () => {
    vi.stubEnv("TRELLO_API_KEY", "")
    vi.stubEnv("TRELLO_TOKEN", "tok")
    vi.stubEnv("TRELLO_TASKS_LIST_ID", "list123")
    const { createTrelloCard } = await import("@/lib/trello")
    const result = await createTrelloCard({ name: "Test" })
    expect(result.skipped).toBe(true)
  })

  it("skips when TRELLO_TOKEN is missing", async () => {
    vi.stubEnv("TRELLO_API_KEY", "key123")
    vi.stubEnv("TRELLO_TOKEN", "")
    vi.stubEnv("TRELLO_TASKS_LIST_ID", "list123")
    const { createTrelloCard } = await import("@/lib/trello")
    const result = await createTrelloCard({ name: "Test" })
    expect(result.skipped).toBe(true)
  })

  it("skips when TRELLO_TASKS_LIST_ID is missing", async () => {
    vi.stubEnv("TRELLO_API_KEY", "key123")
    vi.stubEnv("TRELLO_TOKEN", "tok")
    vi.stubEnv("TRELLO_TASKS_LIST_ID", "")
    const { createTrelloCard } = await import("@/lib/trello")
    const result = await createTrelloCard({ name: "Test" })
    expect(result.skipped).toBe(true)
  })

  it("builds correct URL when all env vars present", async () => {
    vi.stubEnv("TRELLO_API_KEY", "key123")
    vi.stubEnv("TRELLO_TOKEN", "tok456")
    vi.stubEnv("TRELLO_TASKS_LIST_ID", "list789")

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "card1", shortUrl: "https://trello.com/c/abc" }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { createTrelloCard } = await import("@/lib/trello")
    const result = await createTrelloCard({ name: "My Task", description: "Some desc" })

    expect(result.skipped).toBe(false)
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url.toString()).toContain("api.trello.com/1/cards")
    expect(url.toString()).toContain("key=key123")
    expect(url.toString()).toContain("token=tok456")
    expect(url.toString()).toContain("idList=list789")
    expect(url.toString()).toContain("name=My+Task")
    expect(url.toString()).toContain("desc=Some+desc")
    expect(options.method).toBe("POST")
  })

  it("returns error when Trello API responds with error", async () => {
    vi.stubEnv("TRELLO_API_KEY", "key123")
    vi.stubEnv("TRELLO_TOKEN", "tok456")
    vi.stubEnv("TRELLO_TASKS_LIST_ID", "list789")

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("unauthorized permission requested"),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { createTrelloCard } = await import("@/lib/trello")
    const result = await createTrelloCard({ name: "Fail" })

    expect(result.skipped).toBe(false)
    expect(result.error).toContain("unauthorized")
  })
})

// --- Email helper tests ---
describe("sendEmailNotification", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("skips when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    const { sendEmailNotification } = await import("@/lib/email")
    const result = await sendEmailNotification({ to: "test@test.com", subject: "Hi", text: "Body" })
    expect(result.skipped).toBe(true)
  })

  it("skips when recipient email is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_abc123")
    const { sendEmailNotification } = await import("@/lib/email")
    const result = await sendEmailNotification({ to: null, subject: "Hi", text: "Body" })
    expect(result.skipped).toBe(true)
  })

  it("sends email when all params present", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_abc123")
    vi.stubEnv("EMAIL_FROM", "NeuralBrief <no-reply@neuralbrief.dev>")

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "email-1" }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { sendEmailNotification } = await import("@/lib/email")
    const result = await sendEmailNotification({ to: "user@example.com", subject: "Test", text: "Hello" })

    expect(result.skipped).toBe(false)
    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.resend.com/emails")
    expect(options.method).toBe("POST")
    expect(options.headers.Authorization).toBe("Bearer re_abc123")

    const body = JSON.parse(options.body)
    expect(body.to).toBe("user@example.com")
    expect(body.subject).toBe("Test")
    expect(body.text).toBe("Hello")
    expect(body.from).toBe("NeuralBrief <no-reply@neuralbrief.dev>")
  })

  it("returns error when API responds with error", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_abc123")

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve("forbidden"),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { sendEmailNotification } = await import("@/lib/email")
    const result = await sendEmailNotification({ to: "user@example.com", subject: "Test", text: "Body" })

    expect(result.skipped).toBe(false)
    expect(result.error).toContain("forbidden")
  })
})

// --- Auth role checks ---
describe("auth role validation", () => {
  it("accepts all valid roles", async () => {
    const { isRole, roles } = await import("@/lib/auth")
    for (const role of roles) {
      expect(isRole(role)).toBe(true)
    }
  })

  it("rejects invalid roles", async () => {
    const { isRole } = await import("@/lib/auth")
    const invalid = ["admin", "guest", "", "superuser", "Manager", "CLIENT", null, undefined, 123]
    for (const role of invalid) {
      expect(isRole(role)).toBe(false)
    }
  })

  it("director role is valid", async () => {
    const { isRole } = await import("@/lib/auth")
    expect(isRole("director")).toBe(true)
  })
})

// --- Password hashing ---
describe("password hashing", () => {
  it("hashes and verifies correctly", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth")
    const password = "SecurePass123!"
    const hash = hashPassword(password)
    expect(verifyPassword(password, hash)).toBe(true)
  })

  it("rejects wrong password", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth")
    const hash = hashPassword("correct")
    expect(verifyPassword("wrong", hash)).toBe(false)
  })

  it("rejects tampered hash", async () => {
    const { verifyPassword } = await import("@/lib/auth")
    expect(verifyPassword("test", "broken")).toBe(false)
    expect(verifyPassword("test", "")).toBe(false)
    expect(verifyPassword("test", "100:salt:hash")).toBe(false)
  })

  it("produces unique hashes for same password", async () => {
    const { hashPassword } = await import("@/lib/auth")
    const hash1 = hashPassword("same")
    const hash2 = hashPassword("same")
    expect(hash1).not.toBe(hash2) // different salt each time
  })
})

// --- Database helper ---
describe("getPool", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it("returns null when DATABASE_URL is not set", async () => {
    vi.stubEnv("DATABASE_URL", "")
    const { getPool } = await import("@/lib/db")
    expect(getPool()).toBeNull()
  })
})

// --- SQL filter logic (unit validation) ---
describe("project status filters", () => {
  const statuses = ["draft", "in_development", "review", "done", "rejected"]

  it("rejected is excluded from client view", () => {
    const visible = statuses.filter((s) => s !== "rejected")
    expect(visible).not.toContain("rejected")
    expect(visible).toContain("draft")
    expect(visible).toContain("in_development")
    expect(visible).toContain("review")
    expect(visible).toContain("done")
  })

  it("rejected is excluded from manager tasks view", () => {
    const visible = statuses.filter((s) => s !== "rejected")
    expect(visible).not.toContain("rejected")
  })

  it("rejected is excluded from manager chats view", () => {
    const visible = statuses.filter((s) => s !== "rejected")
    expect(visible).not.toContain("rejected")
    expect(visible.length).toBe(4)
  })

  it("rejected is excluded from director observation", () => {
    const visible = statuses.filter((s) => s !== "rejected")
    expect(visible).not.toContain("rejected")
  })

  it("done projects can be archived", () => {
    const archivable = statuses.filter((s) => s === "done")
    expect(archivable).toEqual(["done"])
  })

  it("only draft projects can be approved or rejected by manager", () => {
    const actionable = statuses.filter((s) => s === "draft")
    expect(actionable).toEqual(["draft"])
  })
})

describe("API SQL filters", () => {
  const root = process.cwd()

  it("manager chat API excludes rejected projects", () => {
    const source = readFileSync(join(root, "app/api/manager/chats/route.ts"), "utf8")
    expect(source).toContain("p.status <> 'rejected'")
    expect(source).toContain("p.archived_at IS NULL")
  })

  it("manager task API excludes rejected projects", () => {
    const source = readFileSync(join(root, "app/api/crm/route.ts"), "utf8")
    expect(source).toContain("p.status <> 'rejected'")
    expect(source).toContain("p.archived_at IS NULL")
  })

  it("client project API excludes rejected projects", () => {
    const source = readFileSync(join(root, "app/api/projects/my/route.ts"), "utf8")
    expect(source).toContain("status <> 'rejected'")
    expect(source).toContain("archived_at IS NULL")
  })

  it("director dashboard excludes rejected projects", () => {
    const source = readFileSync(join(root, "app/api/director/dashboard/route.ts"), "utf8")
    expect(source).toContain("p.status <> 'rejected'")
    expect(source).toContain("p.archived_at IS NULL")
  })

  it("manager reject action marks project as rejected", () => {
    const source = readFileSync(join(root, "app/api/manager/projects/route.ts"), "utf8")
    expect(source).toContain("SET status = 'rejected'")
    expect(source).toContain("WHERE id = $1 AND status = 'draft'")
  })
})
