const crypto = require("crypto")

const password = "demo123"
const users = [
  ["client.demo@neuralbrief.local", "Demo Client", "client", null],
  ["manager.demo@neuralbrief.local", "Demo Manager", "manager", "Project Manager"],
  ["developer.demo@neuralbrief.local", "Demo Developer", "developer", "Fullstack Developer"],
  ["director.demo@neuralbrief.local", "Demo Director", "director", "Director"],
]

function sql(value) {
  if (value === null) return "NULL"
  return `'${String(value).replaceAll("'", "''")}'`
}

const values = users
  .map(([email, name, role, specialization]) => {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex")
    const passwordHash = `120000:${salt}:${hash}`

    return `(${sql(email)}, ${sql(name)}, ${sql(role)}, ${sql(passwordHash)}, ${sql(specialization)})`
  })
  .join(",\n")

process.stdout.write(`
INSERT INTO users (email, name, role, password_hash, specialization)
VALUES
${values}
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    specialization = EXCLUDED.specialization,
    status = 'active';
`)
