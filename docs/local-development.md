# Local development

Use the Node version specified in `.nvmrc`, npm, and Docker Compose. The local database includes PostgreSQL and the extension needed for semantic media search.

Keep development data separate from production and use synthetic patient information.

## First setup

```bash
nvm use
npm ci
cp .env.example .env
docker compose up -d --wait
```

Do not overwrite an existing `.env`; add missing settings manually instead. Set `BETTER_AUTH_SECRET` to a fresh value generated with `openssl rand -base64 32`. Verify that `DATABASE_URL` points to your development database, then run:

```bash
npm run db:migrate
```

The example configuration matches the local database service. If using your own PostgreSQL installation, it must support the vector-search extension.

## First administrator

Public sign-up is disabled. Set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` (12–128 characters) in the ignored environment file:

```bash
npm run db:bootstrap-admin -- --confirm
npm run dev
```

Sign in at <http://localhost:3000/login> and remove the bootstrap credentials afterward. Create subsequent accounts through the administration UI. Bootstrap does not seed organizations, exercises, or media; existing exercise implementations can be registered through the dashboard.

## External features

Basic account/database work does not need every external service. AI authoring, media, speech, and remote previews require the corresponding [environment variables](environment-variables.md).

Before using generation or previews, choose a unique stable `SANDBOX_NAMESPACE` for your database, such as `local-angel`. Never share it with production or another independent development database.

Remote previews use a published source revision, not your uncommitted local changes. The example selects `main`; choose another published revision deliberately when needed.

## Everyday commands

```bash
npm run dev
npm run check
npm run ts-check
npm run fix -- <changed-paths>
```

## Regression tests

```bash
npx playwright install chromium
npm test -- unit
npm test -- integration
npm test -- e2e
```

`npm test` runs all three suites. Unit and integration tests run without a development database. Browser tests require Docker Compose and start a separate temporary PostgreSQL database, an application server, and a local preview fixture. They never migrate or reset your configured development database. Keep ports 3100 and 3101 available.

The browser suite uses real authentication and persistence, but replaces paid AI, storage, and remote sandbox operations with deterministic local adapters. It verifies application workflows, not the quality of generated exercise code or clinical suitability. Failure reports include browser traces and screenshots; use synthetic data only.

The runner provides `NEUROGRANADA_E2E=1` and an isolated database/environment automatically. Do not set this flag for ordinary development or deployment. Test adapters refuse production mode and non-test database targets. Pass a test file directly to run only that file, for example `npm test -- tests/e2e/auth.spec.ts` or `npm test -- tests/unit/patient-session-form.test.ts`.

Contributor testing conventions are in [the test guide](../tests/README.md).

**Do not treat `npm run build` as a harmless check:** it applies migrations to the configured database. Confirm targets before maintenance, backfills, or reset commands.

## Stopping and troubleshooting

`docker compose stop` preserves local database data. If the database port is occupied, change the host port and connection URL together. Missing vector support usually means the database image or installation lacks the required extension.

Standalone scripts load `.env`; keep shared local settings there rather than only in a Next.js-specific environment file. For legacy/copied workspace references or shared-service concerns, follow [deployment](deployment.md).
