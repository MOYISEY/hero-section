import { getPool } from "@/lib/db"

export async function POST() {
  const pool = getPool()

  if (!pool) {
    return Response.json({ seeded: false, reason: "DATABASE_URL is not configured" })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    await client.query(`
      INSERT INTO users (email, name, role, specialization)
      VALUES
        ('manager@neuralbrief.local', 'Manager NeuralBrief', 'manager', 'Project management'),
        ('frontend@neuralbrief.local', 'Frontend developer', 'developer', 'React / UI'),
        ('backend@neuralbrief.local', 'Backend developer', 'developer', 'Node.js / PostgreSQL'),
        ('client@neuralbrief.local', 'Demo client', 'client', NULL)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          role = EXCLUDED.role,
          specialization = EXCLUDED.specialization
    `)

    await client.query(`
      WITH client_user AS (
        SELECT id FROM users WHERE email = 'client@neuralbrief.local'
      ), manager_user AS (
        SELECT id FROM users WHERE email = 'manager@neuralbrief.local'
      ), project_row AS (
        INSERT INTO projects (client_id, manager_id, title, brief_text, status, repository_url)
        SELECT client_user.id, manager_user.id, 'CRM для веб-студии', 'Система ролей, задач, чатов и контроля разработки.', 'in_development', 'github.com/MOYISEY/hero-section'
        FROM client_user, manager_user
        WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'CRM для веб-студии')
        RETURNING id
      ), existing_project AS (
        SELECT id FROM projects WHERE title = 'CRM для веб-студии'
      ), target_project AS (
        SELECT id FROM project_row UNION SELECT id FROM existing_project LIMIT 1
      ), first_task AS (
        INSERT INTO tasks (project_id, title, description, status, repository_url)
        SELECT id, 'Ролевая модель и интерфейсы', 'Добавить роли Client, Manager и Developer.', 'in_progress', 'github.com/MOYISEY/hero-section'
        FROM target_project
        WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Ролевая модель и интерфейсы')
        RETURNING id
      ), second_task AS (
        INSERT INTO tasks (project_id, title, description, status, repository_url)
        SELECT id, 'Рабочее пространство разработчика', 'Задачи, статусы, wiki, уведомления и time-tracker.', 'review', 'github.com/MOYISEY/hero-section'
        FROM target_project
        WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Рабочее пространство разработчика')
        RETURNING id
      )
      INSERT INTO task_assignments (task_id, developer_id, assigned_by)
      SELECT tasks.id, developers.id, managers.id
      FROM tasks
      CROSS JOIN users developers
      CROSS JOIN users managers
      WHERE developers.email IN ('frontend@neuralbrief.local', 'backend@neuralbrief.local')
        AND managers.email = 'manager@neuralbrief.local'
        AND tasks.title IN ('Ролевая модель и интерфейсы', 'Рабочее пространство разработчика')
      ON CONFLICT DO NOTHING
    `)

    await client.query(`
      INSERT INTO notifications (user_id, title, body, channel)
      SELECT id, 'Новое назначение в проект CRM', 'Менеджер назначил задачу в рабочее пространство.', 'system'
      FROM users
      WHERE role = 'developer'
      ON CONFLICT DO NOTHING
    `)

    await client.query(`
      INSERT INTO wiki_pages (title, content, created_by)
      SELECT 'Code Style студии', 'Единый UI-kit, аккуратные отступы, адаптивность и читаемые состояния.', id
      FROM users
      WHERE email = 'manager@neuralbrief.local'
        AND NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Code Style студии')
    `)

    await client.query("COMMIT")

    return Response.json({ seeded: true })
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    const message = error instanceof Error ? error.message : "Unknown seed error"

    return Response.json({ seeded: false, error: message }, { status: 500 })
  } finally {
    client.release()
  }
}
