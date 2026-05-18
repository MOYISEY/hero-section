const { Pool } = require('pg')

const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/neuralbrief' })

pool.query('SELECT id, email, name, role, password_hash FROM users LIMIT 5')
  .then(r => {
    console.log('=== USERS TABLE ===')
    r.rows.forEach(u => {
      const hashPreview = u.password_hash ? u.password_hash.substring(0, 50) + '...' : 'NULL'
      console.log(JSON.stringify({ id: u.id, email: u.email, name: u.name, role: u.role, password_hash_preview: hashPreview }))
    })
    pool.end()
  })
  .catch(e => {
    console.error(e.message)
    pool.end()
  })
