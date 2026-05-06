import { Pool } from "pg"

const globalForPg = globalThis as unknown as {
  neuralbriefPool?: Pool
}

export function getPool() {
  if (!process.env.DATABASE_URL) return null

  globalForPg.neuralbriefPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  return globalForPg.neuralbriefPool
}
