# Environment variables

Use [`.env.example`](../.env.example) as a starting point. Never commit real secrets. Standalone scripts load `.env`; deployment settings can be supplied directly. Restart processes after changes.

## Application and database

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Connection to the intended database. Use local development data or a separate preview database, not production data. |
| `DATABASE_DRIVER` | Optional `postgres` or `neon` override; otherwise inferred from the database host. The local example uses `postgres`. |
| `BETTER_AUTH_SECRET` | Stable random authentication secret of at least 32 characters. |
| `BETTER_AUTH_URL` | The application's canonical authentication origin, including protocol. |
| `BETTER_AUTH_BASE_URL` | Legacy fallback; prefer `BETTER_AUTH_URL`. |

## Feature services

| Variable | Purpose |
| --- | --- |
| `AI_GATEWAY_API_KEY` | AI service access for authoring and supporting features; hosted deployments may use provider-managed authentication. |
| `BLOB_READ_WRITE_TOKEN` | Uploading and deleting assets/checkpoints in the configured storage service. |
| `NEXT_PUBLIC_BLOB_URL` | Public base URL matching that storage account. Browser-visible, not a secret. |
| `CARTESIA_API_KEY` | Generated speech audio. |
| `SERPER_API_KEY` | Web image search. |

Only configure services needed for the features you use. Shared credentials do not imply isolated development/production resources.

## Remote workspaces and previews

| Variable | Purpose |
| --- | --- |
| `VERCEL_OIDC_TOKEN` | Remote Sandbox authentication, supplied by the platform or obtained for local development. Local tokens are short-lived. |
| `SANDBOX_NAMESPACE` | Required unique, stable identifier per independent database/environment, e.g. `local-angel`, `preview-pr-31`, or `production`. Use 1–24 lowercase letters/digits/hyphens with alphanumeric ends. |
| `SANDBOX_BRANCH` | Optional published source revision for creating the prepared preview environment. |
| `SANDBOX_NAME` | Optional existing sandbox to use when creating a snapshot. |

Use the platform's project-linking/authentication flow for local Sandbox access. Importing remote environment settings can overwrite local database configuration; verify the result carefully.

Do not use a single namespace for all previews or change it on every deployment. Existing/copied workspace references may need an explicit reset; see [deployment](deployment.md).

Preview-specific and deployment-provided settings are managed by the runtime. Do not copy them into ordinary local configuration without understanding their purpose. Never inject application secrets into generated exercises or browser-visible variables.

## One-time provisioning

`BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` are used only for initial administrator provisioning. There are no default administrator credentials. Remove these values after use; see [local development](local-development.md).
