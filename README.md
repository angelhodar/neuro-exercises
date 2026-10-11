# NeuroGranada

[neurogranada.com](https://neurogranada.com) · Cognitive rehabilitation exercises created and refined through natural-language chat.

The goal is to let non-technical rehabilitation professionals describe an interactive exercise, refine it with AI, preview it alongside the chat, and configure it for a rehabilitation session. A media library supplies reusable images, audio, and video.

## Current implementation

- Two exercise agents: requirements refinement and code implementation with persistent Vercel Sandbox workspaces.
- Saved, user-private requirements drafts and ZIP checkpoints of generated exercises.
- Eight checked-in exercise implementations, configuration forms, built-in and user-created presets.
- Media uploads, image generation/editing, web image search, and pgvector semantic search.
- Patient records, sessions/tests, exercise templates, share links, results, and speech workflows.
- Email/password authentication, administrator-provisioned accounts, and organization management.

Share links already exist but are ahead of the intended clinician-led release scope. A browser reviewer agent and cross-organization exercise/template sharing are **future direction**, not implemented guarantees. See [project idea and scope](docs/project-idea.md).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/Base UI · Drizzle/PostgreSQL + pgvector · Better Auth · AI SDK 7 + Pi harness · Vercel AI Gateway, Blob, and Sandbox · Cartesia · Serper.

## Local development

Use Node.js **24** (`.nvmrc`) and Docker Compose for the local PostgreSQL database.

```bash
nvm use
npm ci
cp .env.example .env  # only if you do not already have a .env
docker compose up -d --wait
```

Set `BETTER_AUTH_SECRET` to a freshly generated secret (`openssl rand -base64 32`). Verify that `DATABASE_URL` points to your local database, then:

```bash
npm run db:migrate
# Set BOOTSTRAP_ADMIN_EMAIL / NAME / PASSWORD in .env first.
npm run db:bootstrap-admin -- --confirm
npm run dev
```

Open <http://localhost:3000/login>. Remove bootstrap credentials after provisioning. AI/media/sandbox features require additional service credentials; basic login and database-backed development do not require all external services.

**Warning:** `npm run build` applies database migrations before building. Never run it with an unintended production database URL.

## Documentation

Start with the [documentation index](docs/README.md):

- [Local setup](docs/local-development.md) and [environment variables](docs/environment-variables.md)
- [Architecture](docs/architecture.md), [database](docs/database.md), and [authentication](docs/authentication.md)
- [Exercises](docs/exercises.md), [agents](docs/agents.md), and [media management](docs/media-management.md)
- [Deployment](docs/deployment.md) and [known gaps](docs/known-gaps.md)

Repository instructions for coding assistants live in [AGENTS.md](AGENTS.md).
