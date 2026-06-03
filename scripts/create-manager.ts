import { Pool } from "pg"
import { pbkdf2Sync, randomBytes } from "crypto"

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function createManager() {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/neuralbrief"
  const pool = new Pool({ connectionString: databaseUrl })

  const email = "manager@neuralbrief.local"
  const password = "manager123"
  const name = "Project Manager"

  const passwordHash = hashPassword(password)

  try {
    // Check if manager already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    )

    if (existing.rows.length > 0) {
      console.log("Manager already exists, updating password...")
      await pool.query(
        "UPDATE users SET password_hash = $1, status = 'active' WHERE email = $2",
        [passwordHash, email]
      )
    } else {
      console.log("Creating new manager...")
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status, created_at)
         VALUES ($1, $2, $3, 'manager', 'active', NOW())`,
        [name, email, passwordHash]
      )
    }

    console.log(`✓ Manager created/updated`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log(`  Role: manager`)
  } catch (error) {
    console.error("Error creating manager:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

createManager()
