import { hashPassword } from "../lib/auth"
import { Pool } from "pg"

async function createDirector() {
  const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/neuralbrief"
  const pool = new Pool({ connectionString: databaseUrl })

  const email = "director@neuralbrief.local"
  const password = "director123"
  const name = "Director"

  const passwordHash = hashPassword(password)

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email])

    if (existing.rows.length > 0) {
      console.log("Director already exists, updating password & role...")
      await pool.query(
        "UPDATE users SET password_hash = $1, role = 'director', status = 'active' WHERE email = $2",
        [passwordHash, email]
      )
    } else {
      console.log("Creating new director...")
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status, created_at)
         VALUES ($1, $2, $3, 'director', 'active', NOW())`,
        [name, email, passwordHash]
      )
    }

    console.log("✓ Director created/updated")
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log("  Role: director")
  } catch (error) {
    console.error("Error creating director:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

createDirector()
