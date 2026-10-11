# Repository instructions

NeuroGranada is a Next.js 16 / React 19 cognitive rehabilitation application. Read [docs/README.md](docs/README.md) and the relevant subsystem documentation before changing behavior. [docs/project-idea.md](docs/project-idea.md) separates implemented features from product direction.

## Development and validation

- Use Node.js 24 and npm with the committed `package-lock.json`.
- `npm run dev`: development server.
- `npm run check`: Ultracite/Biome lint and formatting checks.
- `npm run ts-check`: TypeScript checks.
- `npm run test:auth`, `npm run test:refinement`, `npm run test:setup`, `npm run test:sandbox`: isolated regression tests; no production DB or paid services needed.
- Run targeted formatting with `npm run fix -- <changed-paths>` rather than rewriting unrelated work.
- **Do not use `npm run build` as a routine validation command:** it migrates the configured database and, on Vercel main deployments, attempts a Sandbox snapshot.
- Do not run migrations, schema pushes, admin bootstrap, media backfills, or paid AI/Sandbox commands against shared resources without confirming the target and authorization.

## Architecture and style

- Prefer server components; add `"use client"` only for interactivity/browser APIs.
- Database operations generally live in `app/actions/` server actions; streaming and upload handlers live in `app/api/`.
- Use existing React Query, react-hook-form/Zod, `nuqs`, Sonner, and shared UI conventions.
- UI components come from `components/ui/` (shadcn/Base UI, currently `base-vega`); styling uses Tailwind 4 and `app/globals.css`.
- Files use kebab-case; component exports use PascalCase; hooks live in `hooks/`.
- Use `@/` imports for project modules and let Biome enforce import ordering.
- Schema and relations live in `lib/db/schema.ts`; migration history is in `drizzle/`. Generate migrations deliberately; never rewrite applied migration history.
- `lib/db/index.ts` selects Neon HTTP or node-postgres. Keep both transports working. Sandbox previews use the separate `lib/db/index.sandbox.ts` PGlite variant.

## Authorization and data safety

- Use `requireAuth` / `requireAdmin` from `lib/auth/require-auth.ts`; these bypass stale cookie-cache data. For route authentication, use `withAuth` where appropriate or explicitly revalidate sessions.
- Cookie presence in `proxy.ts` is only a navigation check, not authorization.
- Check ownership/organization permissions server-side. Exercise editing and previews use `assertCanEditExercise`; patient data is creator-scoped.
- Public sign-up stays disabled. Bootstrap is a one-time operator CLI, not a public route or password-reset mechanism.
- Never expose secrets through `NEXT_PUBLIC_*`, generated exercise code, sandbox environment files, logs, or documentation.
- Gateway, Blob, and Sandbox resources are currently shared across environments. A unique stable `SANDBOX_NAMESPACE` per database/developer/PR is mandatory for workspace/session/preview identity. Never reuse foreign stored workspace state or bypass its namespace checks. `sandbox:reset-references` is a confirmed operator action that clears target DB resume state, not a routine migration. Shared credentials/Blob assets remain unisolated; see [deployment risks](docs/deployment.md).
- Do not assume organization-wide data isolation, private Blob storage, clinical approval, or complete security coverage. Existing gaps are tracked in [docs/known-gaps.md](docs/known-gaps.md).

## Exercise contract

Every `app/exercises/<slug>/` module must provide:

| File | Required exports |
| --- | --- |
| `<slug>.schema.ts` | `configSchema`, `resultSchema`, `defaultConfig` |
| `<slug>.exercise.tsx` | `Exercise` |
| `<slug>.config.tsx` | `ConfigFields` |
| `<slug>.results.tsx` | `Results` |

Use `hooks/use-exercise-execution.tsx` and extend `lib/schemas/base-schemas.ts`. Read comparable checked-in exercises rather than inventing a new runtime convention. Preserve validation and sandbox variants when changing exercise routes.

The requirements agent lives in `lib/ai/refinement/`; the implementation agent lives in `lib/ai/agent/`. Checkpoint validation is in `lib/ai/exercise-checkpoint.ts`. There is **no browser reviewer agent yet**. The implementation agent's folder-only prompt is not a hard filesystem permission boundary (`permissionMode: "allow-all"`).

## Documentation maintenance

Update the relevant `docs/` page alongside changes to setup, environment variables, permissions, exercise contracts, media, agents, or deployment. Keep the root README a concise entry point and this file focused on contributor instructions. Document actual behavior, explicitly label proposals, and never copy real `.env` values.
