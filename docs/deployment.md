# Deployment and environments

## Vercel build behavior

`npm run build` executes:

1. `drizzle-kit migrate` against `DATABASE_URL`.
2. `next build`.
3. `scripts/deploy-snapshot.ts`.

Therefore builds are **not read-only**. Check the target database, migration SQL and backup/rollback plan before production deployment. A migration failure stops the build. The snapshot helper only runs on Vercel's `main` branch; snapshot errors are logged but do not intentionally fail deployment, since later requests can lazily create a base snapshot.

The repository PR workflow runs Node 24, `npm ci`, lint/format and TypeScript checks. It does not run the regression suites, a production build, browser tests or a reviewer agent.

## Database environments

- Local: PostgreSQL/pgvector via Compose, synthetic data.
- Vercel PR preview: set a dedicated Neon branch's `DATABASE_URL`; use the appropriate auth origin/secret and verify migrations target that branch.
- Production: production Neon database and stable canonical auth configuration.

This is the agreed setup direction, not an automated environment provisioning system. The repository has no Neon preview-branch lifecycle workflow. Do not accidentally carry `DATABASE_DRIVER=postgres` from the local example if you intend Neon HTTP inference.

## Snapshot operations

`lib/sandbox.ts` clones `https://github.com/angelhodar/neuro-exercises.git` at `SANDBOX_BRANCH`, else deployment SHA prefix, detected branch, or `main`. It uses Node 24, installs with `npm ci`, replaces all sandbox variants, then snapshots the environment.

```bash
npm run sandbox:snapshot
npm run sandbox:snapshot -- <existing-sandbox-name>
```

Snapshot lookup uses the name from `getBaseSandboxName`, considers status/expiry, and recreates lazily when absent. Expiration comes from the SDK/API response; do not rely on the former documentation's fixed seven-day claim. Workspace snapshot retention configuration is separate from base-snapshot expiration.

Local/uncommitted code is not uploaded by this command; the chosen revision must be accessible remotely. Publishing a branch is a deliberate operator step, not part of the local setup script.

## Shared services: current reality

The owner reports that AI Gateway, Sandbox and Blob resources are currently shared across environments. Service scope is not the same as database environment isolation; a Vercel Preview label does not automatically isolate application-created names, assets or deletion permissions.

## Sandbox namespace configuration

Set a unique, stable **`SANDBOX_NAMESPACE` per database/environment** before using generation or previews:

| Environment | Example |
| --- | --- |
| Developer's local database | `local-angel` |
| PR 31's Neon database branch | `preview-pr-31` |
| Production database | `production` |

The value must be 1–24 lowercase letters/digits/hyphens, with a letter or digit at each end. There is **no fallback or automatic normalization**. Each developer/PR needs its own value; a shared `preview` value is not sufficient. Keep it stable across deployments; do not use a commit SHA. If one developer has multiple independently seeded local databases, each also needs a different value.

Workspace names become `<namespace>-exercise-workspace-<exerciseId>`, harness sessions `<namespace>-exercise-<exerciseId>`, and preview names `<namespace>-exercise-preview-<generationId>-<random>`. Namespace tags aid attribution. Workspace lock writes are scoped to the expected session identity. Legacy/foreign workspace references fail closed before resuming a harness or accessing its sandbox. Preview references are only reused when the namespace and generation match exactly; foreign/legacy previews are recreated from checkpoints.

Base snapshots remain revision-based and may be shared; they are source/dependency templates, not exercise-specific editing/session state.

### Existing databases and database clones

Having no live sandboxes does not guarantee that database references are empty. If there are no workspace rows, setting the namespace is enough. If legacy references exist, or after cloning a database into another environment:

1. Set the clone/target's unique `SANDBOX_NAMESPACE` and verify `DATABASE_URL`.
2. Stop generation traffic in the **target application**. Back up the target database if needed.
3. Run `npm run sandbox:reset-references` to print the target without writing (the command exits with an error until confirmed).
4. Run `npm run sandbox:reset-references -- --confirm` deliberately against that target.
5. Restart generation/preview usage; new workspaces can recover source files from completed checkpoint ZIPs.

The reset transaction rewrites all workspace session identities for the configured namespace, clears sandbox names/resume state/locks/provenance, and clears generation preview references. It refuses unexpired active locks (also active locks with unknown expiry); stop traffic and wait for expiry if necessary. Stale `GENERATING` rows become `ERROR`. Prompts, summaries and checkpoint ZIP references remain. A completed checkpoint—not an incomplete editing session—is the source-recovery boundary.

**The reset affects the entire selected database and loses harness resume state**, even if the namespace stays the same. It never stops or deletes remote sandboxes, which may belong to the source/production database. It is not an automatic deployment migration. Do not run it on production simply to prepare a clone. Old remote resources, if present, need a separate intentional cleanup after ownership is verified.

Namespacing prevents accidental collisions; it is **not access control** against a full-project credential or an incorrectly reused namespace.

Recommended follow-up, **not implemented here**:

- Use separate Vercel projects/scoped credentials where production/non-production requires stronger boundaries.
- Use a separate development Blob store for deletion/upload tests, or design enforceable environment prefixes and cleanup rules. Prefixes alone do not restrict a full-store token.
- Attribute/cap Gateway and Sandbox spending; shared budgets and model access should be explicit.
- Keep production secrets out of previews where possible; validate auth origins and real service permissions independently.

## Release checklist

- Verify isolated preview DB, auth origin, migrations, and service access.
- Run lint, types and all four regression commands from [local development](local-development.md).
- Review generated exercise interaction manually; type/lint success is not clinical or browser approval.
- Check media usage/public exposure and avoid real patient data until policies are established.
- Confirm source/snapshot revision and a unique stable Sandbox namespace before exercising AI generation.
- Review [known gaps](known-gaps.md), especially share links and publication/review expectations.
