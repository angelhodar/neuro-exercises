# Tests

- `unit/`: schemas, conversation state, and lifecycle behavior with injected dependencies.
- `integration/`: authentication, persistence, stream contracts, setup, sandbox isolation, and browser/server import boundaries. These use isolated in-memory databases or fakes, not your configured database.
- `e2e/`: Playwright application workflows using real authentication and server actions, either locally or against a deployed PR preview.
- `fixtures/`: synthetic catalog entries and approved brief data.
- `support/`: database setup, browser fixtures, and deterministic external-service adapters.

Operational scripts belong in `scripts/`, not here.

## Running

Use the repository's Node version, install dependencies with `npm ci`, and run:

```bash
npx playwright install chromium
npm test -- unit
npm test -- integration
npm test -- e2e
```

`npm test` runs everything. Pass one or more test paths (or quoted globs) to run only those files; the runner selects Node or Playwright automatically:

```bash
npm test -- tests/unit/patient-session-form.test.ts
npm test -- tests/integration/auth-security.test.ts
npm test -- tests/e2e/requirements.spec.ts
npm test -- 'tests/unit/*.test.ts'
```

To pass runner-specific options, select the suite first: `npm test -- e2e --headed tests/e2e/auth.spec.ts` or `npm test -- unit --test-name-pattern=observation tests/unit/patient-session-form.test.ts`.

On Linux, install browser system dependencies with `npx playwright install --with-deps chromium`. Local browser tests require Docker Compose and free ports 3100 and 3101. Do not invoke `playwright test` directly: the runner supplies the appropriate environment.

Each local browser run creates its own Compose project, random database credentials, and temporary PostgreSQL storage, applies the committed migrations, and removes only that project's container when it finishes. The application uses `.next-e2e/` rather than the normal development cache.

Every browser test provisions two ordinary synthetic accounts through the protected setup endpoint and cleans its run through the cleanup endpoint in fixture teardown. Setup and cleanup use Node fetch: `E2E_TOKEN` is never attached to browser requests or Playwright request traces. Run IDs are recorded as `e2e-run` annotations for recovery after forced termination. Browser contexts and accounts are isolated between tests.

Locally, test-only module aliases replace external AI, metadata/media generation, checkpoint storage, and sandbox sessions. Authentication, ownership checks, draft persistence, generation lifecycle, and resource persistence remain real. The local preview is a fixture, not generated exercise code. Browser interception tests transport failure and holds one real response to check busy controls; successful turns use the real route. Service-specific safety and failure cases remain integration/unit tests.

## Deployed smoke tests

Set `E2E_BASE_URL` to the HTTPS preview origin and provide its `E2E_TOKEN` in the runner's environment. Add `VERCEL_AUTOMATION_BYPASS_SECRET` if Deployment Protection requires it, then run `npm test -- e2e` (or select a smoke test file). In this mode, the runner does not start Docker, access the database directly, or migrate remote data. It excludes authoring/requirements tests and does not enable service fakes. The catalog must already contain the built-in exercises; setup reuses their deployed display names.

The smoke files cover authentication, configuration/runtime, patients, and reuse. Templates are verified through the UI after reload, rather than by querying the remote database. Automatic fixture logins honor bounded server rate-limit retry headers; they do not disable rate limiting or spoof IPs. Browser traces are disabled for deployed tests, and privileged tokens are redacted from error reports, to avoid retaining deployment bypass credentials; screenshots and failure reports remain enabled.

PR CI runs lint, type checks, unit tests, and integration tests without browser tests. The separate **E2E Tests** workflow runs only manually: select an open, same-repository PR's current head branch, and it waits for that exact commit's Vercel preview before running deployed smoke tests. Configure preview secrets and database isolation as described in [deployment](../docs/deployment.md). It is not an automatic merge gate. Do not expose CI secrets to fork or otherwise untrusted PR code.

Selectors should use roles, labels, and visible text. Wait for observable state rather than sleeps. Playwright saves traces and screenshots on failure in `test-results/`, with an HTML report in `playwright-report/`. CI uploads these when checks fail.

Never use `npm run build` for test setup: it has database and snapshot side effects. Test adapters are development-only, gated by `NEUROGRANADA_E2E=1`, and reject non-test targets. Do not use them in deployed environments.

## Future exercise verification

Reserve `<exercise-folder>/tests/verification.spec.ts` for exercise-specific functional verification derived from an approved brief and tied to a saved checkpoint. The current Playwright config discovers only application tests under `tests/e2e/`; it does not discover colocated exercise tests. A future reviewer will need separate discovery and isolated execution for those untrusted specs. No automated reviewer or clinical approval process is implemented by this suite.
