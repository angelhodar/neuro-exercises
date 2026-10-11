# Local development

## Prerequisites

- Node.js **24**, as specified in `.nvmrc`, and npm.
- Docker with Compose, or an existing PostgreSQL installation with **pgvector** available.
- Optional external-service access for the features you need: [environment variables](environment-variables.md).

Use synthetic patients and a dedicated development database. Never point a local checkout or PR preview at the production database.

## First checkout

```bash
nvm use
npm ci
cp .env.example .env
docker compose up -d --wait
```

Do not overwrite an existing `.env`; copy missing keys manually instead. The Compose service is PostgreSQL 17 with pgvector, bound to loopback on port 5432. Its development-only credentials match `.env.example`; data persists in the `postgres-data` volume.

Set `BETTER_AUTH_SECRET` in `.env` using a fresh `openssl rand -base64 32` value, and keep `BETTER_AUTH_URL=http://localhost:3000`. Confirm `DATABASE_URL` is local before running:

```bash
npm run db:migrate
```

Migrations create the vector extension and schema. A plain PostgreSQL image without pgvector is insufficient. For an existing local installation, use an equivalent isolated database/user with permission to apply the migrations.

## Provision the first administrator

Public sign-up is disabled. In the ignored `.env`, set:

- `BOOTSTRAP_ADMIN_EMAIL`: administrator login email.
- `BOOTSTRAP_ADMIN_NAME`: display name.
- `BOOTSTRAP_ADMIN_PASSWORD`: unique password, 12–128 characters; never a committed default.

```bash
npm run db:bootstrap-admin             # prints target, refuses to write
npm run db:bootstrap-admin -- --confirm
npm run dev
```

Sign in at <http://localhost:3000/login>. Remove the three bootstrap values from `.env` afterward. The script does not create an organization, media, or exercise catalog rows. Create further accounts through `/dashboard/users`. See [authentication](authentication.md) for the bootstrap safety rules.

Checked-in exercise folders are not automatically seeded into the database. Use the dashboard's existing-exercise registration flow, supplying the corresponding slug. Registering without a thumbnail file/prompt avoids image-generation dependencies.

## Feature-specific setup

- Database/auth development needs the database and auth settings, not every paid API.
- AI creation/refinement needs Gateway credentials; media/checkpoints need Blob; implementation/preview needs Sandbox access.
- Set a unique stable `SANDBOX_NAMESPACE`, e.g. `local-angel`, before generation/preview. The example leaves it blank intentionally; each independent local DB/developer and PR must choose its own value. No namespace is needed for ordinary database/auth development.
- Generated previews clone a **remote** Git revision. `SANDBOX_BRANCH=main` in the example deliberately avoids an unpushed local branch. It also means previews use main's snapshot code, not your uncommitted changes.
- Native `lib/load-env.ts` loads `.env` for scripts. Next.js has its own environment-file loading. Keeping common local values in `.env` avoids `.env.local`-only values being absent from standalone scripts.

## Commands

| Command | Behavior |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run check` / `npm run fix -- <paths>` | Check / fix lint and formatting |
| `npm run ts-check` | TypeScript checking |
| `npm run test:auth` | PGlite-backed authentication/authorization regressions |
| `npm run test:refinement` | Requirements state and endpoint regressions |
| `npm run test:setup` | Driver selection and atomic/idempotent bootstrap regressions |
| `npm run test:sandbox` | Namespaced identity, clone rejection, preview reuse and reference reset regressions; mocked SDK, no remote resources |
| `npm run db:generate` / `db:migrate` | Generate / apply versioned migrations |
| `npm run db:studio` | Browse configured database; check the target first |
| `npm run db:push` | Direct schema synchronization; use only deliberately on disposable databases |
| `npm run db:bootstrap-admin -- --confirm` | One-time initial admin provisioning |
| `npm run db:backfill-embeddings` | Write missing media embeddings; incurs Gateway usage |
| `npm run sandbox -- <command>` | Official Vercel Sandbox CLI |
| `npm run sandbox:snapshot` | Create a base snapshot from a remotely available Git revision |
| `npm run sandbox:reset-references -- --confirm` | Reset all workspace/resume/preview DB references to the namespace; stop traffic and verify the target first |
| `npm run build` | **Migrate DB**, build Next.js, then run deployment snapshot helper |
| `npm run start` | Serve a completed production build |

`agent:generate-exercise` and `generate-media-metadata` remain in `package.json`, but their target files (`scripts/agent/run.ts` and `scripts/populate-media-metadata.ts`) are absent. They are not working setup commands.

The regression suites use isolated PGlite engines and mocks; they do not require your configured Neon database or real AI services. They do not cover the full browser UI or all application permissions.

## Stop and troubleshoot

```bash
docker compose stop  # preserves local database data
```

- Port 5432 occupied: stop the conflicting local service, or change the Compose host port and `DATABASE_URL` together.
- `extension "vector" is not available`: use the provided pgvector image or install pgvector in your PostgreSQL server.
- Unexpected remote database calls: verify `DATABASE_URL` and `DATABASE_DRIVER`; Neon URLs use HTTP by default, ordinary PostgreSQL URLs use TCP.
- Cannot register/login: apply migrations and bootstrap first; there is no public sign-up page.
- Missing media URLs: ensure `NEXT_PUBLIC_BLOB_URL` corresponds to the store selected by `BLOB_READ_WRITE_TOKEN`.
- Sandbox cannot clone branch: publish the revision first or select a known remote branch with `SANDBOX_BRANCH`.
- Legacy/foreign workspace configuration error: verify the namespace and follow the explicit target-database reset procedure in [deployment](deployment.md). No live sandboxes does not imply no stored references.
- Local DB but shared remote services: read [deployment](deployment.md); namespacing prevents accidental Sandbox identity collisions, not shared-credential access or Blob deletion.
