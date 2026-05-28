# PostgreSQL setup

## Docker setup

1. Install Docker Desktop.
2. Run from the project root:

```bash
docker compose up --build
```

3. Open `http://localhost:3000`.

Docker creates PostgreSQL automatically and applies `database/schema.sql` on the first start.

## Manual Windows setup

1. Install PostgreSQL for Windows from the official installer: https://www.postgresql.org/download/windows/
2. During installation, keep pgAdmin 4 selected.
3. Set a password for the `postgres` user and remember it.
4. Open pgAdmin 4 and create a database named `neuralbrief`.
5. Open Query Tool for the `neuralbrief` database.
6. Run the SQL from `database/schema.sql`.
7. Add this line to `.env.local` and replace the password:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/neuralbrief
```

8. Restart the Next.js dev server.

The app keeps working without PostgreSQL, but sessions are stored only in the browser until `DATABASE_URL` is configured.
