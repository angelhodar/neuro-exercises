# Environment variables

Copy [`.env.example`](../.env.example) for local setup; never copy real production secrets into documentation. Shell/deployment variables can be supplied without a local file. Standalone scripts load `.env` through `lib/load-env.ts`; Next.js additionally supports its standard environment files. Restart processes after configuration changes.

## Core

| Variable | Use |
| --- | --- |
| `DATABASE_URL` | PostgreSQL URL. Local Compose URL is provided in the example; use a separate Neon branch URL for each Vercel PR preview. Required for database operations and migrations. |
| `DATABASE_DRIVER` | Optional `postgres` (node-postgres/TCP) or `neon` (Neon HTTP). Defaults to `neon` for hosts ending in `.neon.tech`, otherwise `postgres`. Set explicitly for custom endpoints. This affects runtime, not Drizzle Kit's own driver selection. |
| `BETTER_AUTH_SECRET` | Stable, randomly generated auth secret of at least 32 characters. No committed default. |
| `BETTER_AUTH_URL` | Canonical auth origin, e.g. `http://localhost:3000` locally. Use the appropriate origin in each deployment. |
| `BETTER_AUTH_BASE_URL` | Legacy fallback when `BETTER_AUTH_URL` is unset. Prefer the canonical key. |

The example explicitly sets `DATABASE_DRIVER=postgres`. Change or remove that line when using Neon if you want the default Neon HTTP behavior.

## Feature services

| Variable | Required for |
| --- | --- |
| `AI_GATEWAY_API_KEY` | Local/API-key access to Vercel AI Gateway: requirements and implementation models, metadata, image generation, embeddings, translation, transcription. Hosted authentication may use Vercel OIDC; verify the deployment's service access. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads/deletion: library media, thumbnails, audio, generation checkpoints, speech recordings. |
| `NEXT_PUBLIC_BLOB_URL` | Public base URL of that Blob store, including `https://`. Browser-visible, not a secret. Stored keys are resolved relative to this URL. Must match the write token's store. |
| `CARTESIA_API_KEY` | Text-to-speech audio generation in `lib/ai/audio.ts`. |
| `SERPER_API_KEY` | External image search in `lib/media/serper.ts`. |

Provider-prefixed model strings in the AI code route through AI Gateway. The current source does not read `GOOGLE_GENERATIVE_AI_API_KEY`, `E2B_API_KEY`, or `E2B_TEMPLATE_ID`; those older README requirements were removed. There is no current E2B integration.

## Sandbox authentication and source

The installed Vercel Sandbox SDK resolves credentials itself; the app does not pass explicit credentials to each call.

| Variable | Use |
| --- | --- |
| `VERCEL_OIDC_TOKEN` | SDK-managed OIDC authentication, supplied by Vercel or obtained for local development. Short-lived; do not treat a pulled token as permanent. |
| `SANDBOX_BRANCH` | Override cloned Git source revision. Without it: Vercel commit SHA prefix, detected local branch, then `main`. The revision must exist in the remote repository. |
| `SANDBOX_NAME` | Optional existing sandbox to snapshot with `npm run sandbox:snapshot`; a positional name takes precedence. |
| `SANDBOX_NAMESPACE` | **Required for generation/previews.** Stable unique slug per database/developer/PR, e.g. `local-angel`, `preview-pr-31`, `production`. 1–24 lowercase letters/digits/hyphens, alphanumeric ends; no default. Namespaces workspace/harness/preview identity, not credentials or Blob assets. |

For local access, link the correct Vercel project and obtain a current OIDC token (the SDK suggests `npx vercel link` and `npx vercel env pull`); ensure standalone scripts receive it through `.env` or the shell. The SDK can also guide interactive development authentication. Linking/pulling settings is an operator action; avoid overwriting your local database URL with production values when importing environment files.

The SDK supports explicit `{ token, teamId, projectId }` parameters as another authentication method, but the current app does **not** supply them. Setting `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and `VERCEL_PROJECT_ID` alone is not a supported app credential path as currently wired.

Do not use the same namespace across independent databases or all PR previews, and do not change it every deployment. Existing/clone workspace records may need `sandbox:reset-references`; [deployment](deployment.md) documents the explicit, state-clearing procedure.

## Generated sandbox-only values

`lib/ai/exercise-workspace.ts` writes these into **preview** sandbox `.env` files; do not set them on the normal application:

- `SANDBOX_PREVIEW=1`: hide Next.js dev indicators.
- `SANDBOX_EXERCISE`: serialized exercise record.
- `SANDBOX_EXERCISE_BASE64`: base64 equivalent, preferred by the parser.
- `NEXT_PUBLIC_BLOB_URL`, `NODE_ENV=development`, `NEXT_TELEMETRY_DISABLED=1`.

The base snapshot uses `.sandbox.ts(x)` replacements and PGlite. Production database/auth/Blob write secrets are not intentionally injected into preview files. This is not a guarantee about arbitrary agent behavior; see [agents](agents.md).

## Deployment-provided values

`VERCEL`, `VERCEL_GIT_COMMIT_REF`, and `VERCEL_GIT_COMMIT_SHA` control deployment snapshot creation/source/naming and workspace provenance. Do not fake them in a normal local setup. `NODE_ENV` is managed by the runtime.

## One-time bootstrap

`BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` are only used by `scripts/bootstrap-admin.ts`. No default admin credentials exist. Remove them after provisioning; do not put them into `NEXT_PUBLIC_*` or commit them. See [authentication](authentication.md).
