# NeuralBrief

NeuralBrief is a diploma web application for collecting client requirements through an LLM interview and turning the dialog into a structured technical specification. The generated brief is passed into a CRM workflow where managers assign developers, track tasks, communicate with users and control project delivery.

## Core features

- LLM interview with the client through Groq and Vercel AI SDK.
- Structured requirements extraction and completeness scoring.
- User roles: `client`, `manager`, `developer`, `director`.
- Client project cabinet with statuses, progress and review flow.
- Manager CRM for approving briefs, assigning developers and checking results.
- Developer workspace with task statuses and GitHub repository links.
- Director dashboard with statistics, users, audit log and Kanban overview.
- Internal notifications and role-based project chats.
- Trello integration for external Kanban synchronization.
- PostgreSQL schema with indexes, audit log, triggers and protective constraints.
- Docker Compose setup for reproducible local deployment.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- Radix UI / shadcn-style components
- PostgreSQL with `pg`
- Vercel AI SDK and Groq
- Vitest
- ESLint
- Docker Compose

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment variables

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/neuralbrief
RESEND_API_KEY=res_...
EMAIL_FROM=NeuralBrief <onboarding@resend.dev>
TRELLO_API_KEY=your_trello_api_key
TRELLO_TOKEN=your_trello_token
TRELLO_TASKS_LIST_ID=your_trello_list_id
```

External integrations are optional. If Trello or Resend variables are missing, the application continues working and logs a warning.

## Docker setup

```bash
docker compose up --build
```

Docker starts:

- Next.js application on `http://localhost:3000`
- PostgreSQL database `neuralbrief`
- automatic schema initialization from `database/schema.sql`

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check
```

`npm run check` runs TypeScript validation, ESLint, unit tests and production build.

## Database

Main files:

- `database/schema.sql` — full schema, indexes, triggers and constraints
- `database/README.md` — database setup instructions
- `database/migrations/README.md` — migration strategy
- `docs/database-erd.md` — ERD and relationships description

## Backup

PostgreSQL backup script:

```powershell
.\scripts\db-backup.ps1
```

The script uses `DATABASE_URL` and writes SQL dumps into `database/backups/`.

## Diploma documentation

- `docs/diploma-plan.md`
- `docs/quality-and-production-plan.md`
- `docs/database-erd.md`
