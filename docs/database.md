# Database

## Connections

`lib/db/index.ts` loads `.env`, imports the shared schema, and chooses a transport:

- `*.neon.tech`: Drizzle Neon HTTP driver by default, preserving the hosted behavior.
- Ordinary/local PostgreSQL: Drizzle node-postgres with a `pg.Pool`.
- `DATABASE_DRIVER=neon|postgres` overrides inference.

The local pool is cached across development module reloads. Do not infer the active database from the driver alone; inspect `DATABASE_URL`. The bootstrap CLI uses a separate PostgreSQL TCP connection for its atomic transaction, including when the application uses Neon HTTP.

`drizzle.config.ts` controls Drizzle Kit and reads the same URL. Sandbox snapshots replace the runtime DB module with `index.sandbox.ts` and use PGlite rather than the real database.

## Schema and migrations

The schema, relations, Drizzle-generated validation schemas and domain types live in `lib/db/schema.ts`. Migrations live in `drizzle/`, currently through `0010_exercise_requirement_drafts.sql`.

```bash
npm run db:generate  # after deliberate schema changes; review generated SQL
npm run db:migrate   # apply committed migrations to the intended database
```

Prefer versioned migrations for normal local/preview/production setup. `db:push` modifies schema directly and is not a substitute for maintaining deployment migration history. `npm run build` also runs migrations, so a build has database side effects.

Media search needs pgvector: migration `0003` enables the extension and adds a 768-dimensional vector column/HNSW cosine index. The server must have the extension installed and the migration role must be allowed to create it. The auth/refinement tests use isolated PGlite and skip the unrelated vector migration; this does not test the complete media database.

## Domain groups

| Tables/view | Purpose |
| --- | --- |
| `users`, `accounts`, `sessions`, `verifications`, `auth_rate_limits` | Better Auth identity, credential hashes, sessions, shared HTTP rate limits |
| `organizations`, `members`, `invitations` | Organization lifecycle and membership roles |
| `exercises` | Catalog metadata; slug links to source files, creator controls editing |
| `exercise_requirement_drafts` | Private saved refinement conversations, revision and created-exercise association |
| `exercise_chat_generation` | Prompt, status, summary, checkpoint key and preview sandbox reference |
| `exercise_workspaces` | One persistent workspace/session per exercise, locks and resume state |
| `exercise_config_presets` | Named per-user exercise configurations |
| `exercise_templates`, `exercise_template_items` | Ordered exercise/configuration sets |
| `exercise_links`, `exercise_results` | Shared assignments and per-item results |
| `medias`, `media_tags` materialized view | Blob keys, metadata, derivation and semantic search |
| `patients`, `patient_sessions`, `patient_tests` | Creator-owned patient records and clinical session/test notes |
| `speech_texts`, `transcription_results` | Reference texts, recordings and transcription comparisons |
| `waitlist_emails` | Public landing-page interest collection |

An exercise database row does not contain its React implementation; files live in the repository or a generated checkpoint. Templates link database exercises/configuration, not arbitrary uploaded React code.

## Isolation

Use local PostgreSQL for developer work and a dedicated Neon branch URL for each Vercel PR preview. These are the owner's chosen conventions; automated Neon branch provisioning is not configured in the repository.

Organizations do not own every domain table: many records have `creatorId`, and exercises/media/templates have global read paths. Do not describe this schema as comprehensive tenant isolation.

Independent databases can reuse integer exercise IDs. Sandbox identities therefore include a required `SANDBOX_NAMESPACE` that must be unique per independent database/environment. A clone can still contain the source database's stored session/resume/preview references: reset them explicitly against the clone before generation. Do not change production records to prepare a preview. See [deployment](deployment.md) for the reset command and credential-level isolation limits.
