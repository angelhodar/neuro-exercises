# Deployment and environments

## Separate data, deliberate access

Use local PostgreSQL for development, a dedicated hosted database branch for each PR preview, and a separate production database. Configure the correct application origin and secrets in each environment.

AI, Sandbox, and media services are currently shared across environments. A preview label or separate database does not automatically isolate their assets, budgets, or permissions. Stronger production boundaries may require separate projects, storage, and scoped credentials.

## Builds and prepared environments

**The build command applies database migrations before building the app.** Review changes, verify the target database, and consider recovery before deployment. Rolling back the application does not automatically roll back its data.

Remote exercise previews start from prepared snapshots of published source code. Snapshot preparation may run during deployment or when needed later. Uncommitted local work is not automatically included.

```bash
npm run sandbox:snapshot
```

Confirm source revision and service access before invoking remote operations.

## Sandbox namespaces

Every independent database/environment needs a unique stable `SANDBOX_NAMESPACE`:

- Local developer database: `local-angel`.
- PR preview database: automatically derived from the Vercel project and Git branch when `SANDBOX_NAMESPACE` is unset; an explicit unique value remains supported.
- Production database: `production`.

This keeps editing workspaces, agent sessions, and previews from colliding when separate databases contain the same exercise IDs. Keep the value stable across deployments, and do not reuse a single value for every developer or PR.

Enable Vercel's system environment variables and leave `SANDBOX_NAMESPACE` unset in the Preview scope to use automatic derivation. It requires `VERCEL_PROJECT_ID` and `VERCEL_GIT_COMMIT_REF`; missing metadata fails closed. Each branch must correspond to one independent database environment. Namespaces do not isolate database data. Renaming a branch or moving projects changes the derived identity; switching from an explicit namespace also changes it, so follow the reference-reset procedure below if stored workspaces exist.

Stored workspace references from another namespace are rejected. Foreign preview references are replaced with a new preview of the saved version. Namespacing prevents accidental collisions; it is not access control against shared credentials or a wrongly reused namespace.

## Existing or copied databases

If workspace records are empty, configuring the namespace is enough—even if the project has never had live sandboxes. Otherwise, stale records can still point to an old environment.

For a database clone or legacy workspace records:

1. Set the target's unique namespace and verify its database URL.
2. Stop generation traffic in that target application.
3. Run `npm run sandbox:reset-references` to display the target without writing.
4. Run `npm run sandbox:reset-references -- --confirm` deliberately against that target.

The reset clears editing/session and preview references throughout the selected database. It refuses live generation locks and preserves saved checkpoints, but **loses unfinished editing/resume state**. It does not stop or delete remote sandboxes, and is not a routine deployment migration. Never reset production merely to prepare a clone.

## Before release

Verify database isolation, namespace, authentication settings, and service access. Run the project's checks and regression tests, review exercise behavior manually, and confirm media/privacy expectations. Consult [known gaps](known-gaps.md) before expanding access or using real patient data.

## Manual PR preview smoke tests

The deployed smoke suite checks authentication, permissions, built-in configuration loading, exercise execution/results, presets, templates, and synthetic patient records. It uses the deployed application without service fakes; live AI authoring, media operations, speech, and remote sandbox provisioning are excluded. PR CI runs lint, type checks, unit tests, and integration tests only. Browser tests run separately and only on manual workflow dispatch; deterministic authoring coverage remains available through local browser tests.

Before running preview tests:

1. Verify that each PR preview uses its own database branch, containing synthetic data rather than real patient records. Configure its authentication origin to match the deployed preview. Enable Vercel's system environment variables and leave Preview `SANDBOX_NAMESPACE` unset for automatic project/branch isolation, or supply an explicit unique `preview-` namespace.
2. Register the built-in exercises in the preview's catalog. Fixture setup reuses their existing names and never overwrites or deletes catalog records belonging to other users.
3. Generate `E2E_TOKEN` with `openssl rand -hex 32`. Set the same value in Vercel's **Preview** environment scope and GitHub Actions secrets. Do not configure it in Production.
4. If Deployment Protection is enabled, provide its automation bypass secret to GitHub Actions as `VERCEL_AUTOMATION_BYPASS_SECRET`.
5. Enable the Vercel GitHub deployment integration and make the **E2E Tests** workflow available on the default branch. In GitHub Actions, choose **Run workflow** and select the current head branch of an open, same-repository PR. The workflow waits for that exact commit's successful Vercel `Preview` deployment, then tests its URL. It rejects forks and non-PR targets before accessing test secrets. Only trusted repository contributors should have access to this secret-bearing workflow.

The wait action expects deployments recorded by Vercel's GitHub bot, the `Preview` environment label, and a default `*.vercel.app` origin. If your integration uses different labels or custom domains, deliberately adapt those checks. The workflow is not triggered by PR commits or deployment events and does not publish a `preview-smoke` commit status. Remove any previously required `preview-smoke` status from branch protection so it does not block merging.

For an explicitly authorized preview, set `E2E_BASE_URL` and `E2E_TOKEN` in the test runner's environment, then run `npm test -- e2e`. The runner does not start Docker or migrate a remote database. Do not set `NEUROGRANADA_E2E` in a deployment: that flag is only for the locally mocked application.

### Synthetic setup and cleanup

`POST /api/e2e/setup` and `DELETE /api/e2e/cleanup` require `Authorization: Bearer <E2E_TOKEN>` and a JSON body containing only `{ "runId": "<UUID>" }`. They are unavailable in production and when not configured. Setup creates exactly two ordinary, unverified synthetic accounts; it cannot provision administrators, choose arbitrary account identities, promote existing users, or reset passwords. This is not public sign-up or account recovery.

Each test uses a separate run ID. Account identities are bound to the run, environment namespace, and token. Cleanup is idempotent and deletes only those exact synthetic accounts, their owned exercise metadata, and dependent database records. It never performs a global reset, deletes another run's data, or removes remote media, blobs, or sandboxes. A changed/promoted account is not deleted as an ordinary fixture.

Normal test teardown cleans its run even when an assertion fails. A forcibly terminated runner may leave fixtures; recover its run ID from the test report's `e2e-run` annotation and invoke the protected cleanup endpoint against the same preview. Clean old runs before rotating the token or changing the namespace, since their identities cannot be recovered with different settings.

The privileged fixture token is sent only by the Node test runner, not browser requests. Deployed browser traces are disabled, and privileged credentials are redacted from error reports, to avoid retaining Deployment Protection credentials in artifacts; screenshots and failure reports remain available.
