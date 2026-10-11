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

The regression commands are `test:auth`, `test:refinement`, `test:setup`, and `test:sandbox`. They run in isolation without production data or paid service calls. Consult `package.json` and the scripts themselves for the current command inventory.

**Do not treat `npm run build` as a harmless check:** it applies migrations to the configured database. Confirm targets before maintenance, backfills, or reset commands.

## Stopping and troubleshooting

`docker compose stop` preserves local database data. If the database port is occupied, change the host port and connection URL together. Missing vector support usually means the database image or installation lacks the required extension.

Standalone scripts load `.env`; keep shared local settings there rather than only in a Next.js-specific environment file. For legacy/copied workspace references or shared-service concerns, follow [deployment](deployment.md).
