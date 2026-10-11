# Architecture

## Runtime stack

Next.js 16 App Router and React 19 serve the application. TypeScript, Tailwind 4, shadcn components backed by Base UI (`base-vega`), Lucide, Motion, and Sonner supply the UI. React Hook Form/Zod validate forms; React Query manages client async state; `nuqs` manages URL state.

Drizzle targets PostgreSQL with pgvector. Better Auth supplies credentials, sessions, admin and organization plugins. AI SDK 7 handles structured outputs, tool-driven refinement and streaming; the Pi harness implements code generation inside Vercel Sandbox. Vercel Blob stores assets/checkpoints. AI Gateway routes model requests; Cartesia supplies TTS and Serper supplies image search.

## Source map

| Path | Responsibility |
| --- | --- |
| `app/(landing)/` | Landing, login and public-facing pages |
| `app/dashboard/` | Exercise authoring/catalog, media, patients, organizations, users, templates, links and speech UI |
| `app/exercises/` | Checked-in exercise modules and dynamic config/execution/results routes |
| `app/s/[token]/` | Shared template/exercise entry point |
| `app/actions/` | Server actions for domain data and service operations |
| `app/api/` | Auth handlers, chat/refinement streams and media endpoints |
| `components/exercises/` | Shared exercise UI |
| `components/ui/` | Reusable shadcn/Base UI components |
| `hooks/` | Exercise execution, preview lifecycle, media search and general UI hooks |
| `lib/ai/` | Requirements agent, Pi agent, workspaces, checkpoints, embeddings, speech helpers |
| `lib/auth/` | Better Auth config, guards, roles, bootstrap and ownership checks |
| `lib/db/` | Driver selection, schema/relations, sandbox PGlite variant |
| `lib/schemas/` | Shared validation contracts |
| `lib/media/`, `lib/storage.ts`, `lib/zip.ts` | Media optimization/search, Blob wrappers, archive handling |
| `drizzle/` | Generated SQL migrations and metadata |
| `scripts/` | Snapshots, embeddings, bootstrap and regression suites |
| `proxy.ts` | Cookie-presence redirect for dashboard navigation |

## Main flows

**Authoring:** requirements UI → `/api/exercise-refinement` → private draft/approved brief → `createExercise` → exercise metadata + initial generation → `/api/chat` → Pi workspace → validated Blob ZIP → preview iframe.

**Execution:** database exercise record + dynamically imported module → config schema/form → `ExerciseProvider` → exercise-specific result records → results route. Ad-hoc results may travel in URL query parameters; link-based results are persisted separately. See [exercises](exercises.md).

**Media:** browser upload or server generation/search import → public Blob object → `medias` row → optional 768-dimensional embedding → semantic search → exercise configuration selects assets.

**Identity:** Better Auth route → database session → server-side guard → resource-specific authorization. A dashboard redirect is not an authorization boundary.

## Sandbox variants

Snapshot preparation discovers `*.sandbox.ts` and `*.sandbox.tsx` and copies each over its normal counterpart. These variants avoid the production database and adapt pages/actions for preview use. `lib/db/index.sandbox.ts` uses PGlite. Preview metadata is provided through sandbox environment variables.

The base snapshot, implementation workspace and preview sandbox are distinct layers; see [agents](agents.md) and [deployment](deployment.md). Generated code is not dynamically installed into the deployed application's module tree just because its metadata exists in PostgreSQL.
