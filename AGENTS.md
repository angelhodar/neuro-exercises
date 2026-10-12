# Repository instructions

NeuroGranada helps rehabilitation professionals create and configure cognitive exercises through AI-assisted conversation. Read the [documentation index](docs/README.md) and relevant topic before changing behavior. Keep implemented capabilities distinct from the [product vision](docs/project-idea.md).

## Working in the project

- Use the Node version in `.nvmrc`, npm, and the committed lockfile.
- Follow nearby code and existing components, forms, validation, and exercise lifecycle conventions. Inspect the implementation rather than relying on a fixed source-location map.
- Prefer server-rendered components; keep browser-only behavior and interactivity on the client.
- Enforce authentication, ownership, and organization permissions on the server. Navigation checks are not authorization.
- Preserve support for local PostgreSQL and hosted databases, and keep previews separate from the application's production data access.
- Use versioned database migrations; do not rewrite applied history.
- Keep changes scoped. Do not overwrite unrelated user work or broadly reformat the repository.

## Validation and operational safety

- Run `npm run check`, `npm run ts-check`, and relevant regression tests listed in `package.json`.
- Apply formatting only to changed paths with `npm run fix -- <paths>`.
- **Do not use `npm run build` as routine validation:** it applies migrations and may create a remote snapshot during deployment.
- Confirm the target and authorization before database maintenance, administrator provisioning, reference resets, destructive media operations, or paid service calls.
- Public sign-up is disabled. Initial-admin provisioning is an operator action, not a public endpoint or account-recovery mechanism.
- Never place secrets in browser-visible configuration, generated exercises, logs, or documentation.
- Each independent database/environment needs a unique stable `SANDBOX_NAMESPACE`. Never bypass checks on stored workspace/session references. Shared service credentials are not an environment security boundary.

## Exercises and agents

- Preserve the exercise contract: configuration and validation, interactive execution, and results presentation. Use comparable existing exercises as examples.
- Keep requirements discovery separate from implementation. Treat an approved brief as the authoring specification.
- Preserve validated checkpoints and safe preview behavior. Generated code remains untrusted; structural checks and prompt instructions are not clinical approval or hard permission boundaries.
- Do not imply that a browser reviewer or enforced clinical review process exists until it is actually implemented.

## Documentation style

Keep `docs/` focused on concepts, user workflows, setup, and meaningful safety boundaries. Avoid inventories of source paths, internal APIs, model names, dependency versions, table names, or transient tuning values. Use the code as the reference for those details.

Retain exact commands and environment keys when people need them to operate the project safely. Update documentation when behavior, setup, permissions, or product scope changes—not merely when code moves or a model is replaced. Keep the root README a short entry point.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
