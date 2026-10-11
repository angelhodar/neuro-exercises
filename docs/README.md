# Documentation index

These pages describe the checked-in implementation, including local PostgreSQL support and the initial-admin bootstrap added with this documentation refresh. Product intent comes from the project owner; future plans are labeled explicitly. The code and `package.json` remain the source of truth as the project evolves.

| Page | Covers |
| --- | --- |
| [Project idea](project-idea.md) | Intended users, workflow, implemented scope, future direction |
| [Local development](local-development.md) | Node 24, PostgreSQL/pgvector, first admin, scripts, troubleshooting |
| [Environment variables](environment-variables.md) | Core configuration, paid services, Sandbox and deployment variables |
| [Architecture](architecture.md) | Source layout, server/client responsibilities, data flows |
| [Database](database.md) | Drivers, migrations, domain tables, local/preview data isolation |
| [Authentication](authentication.md) | Provisioning, roles, session validation, authorization boundaries |
| [Exercises](exercises.md) | Four-file contract, configuration, runtime, presets, templates/results |
| [Agents](agents.md) | Requirements refinement, Pi implementation, checkpoints and previews |
| [Media management](media-management.md) | Blob uploads, generation, metadata, semantic search and deletion |
| [Deployment](deployment.md) | Vercel build behavior, previews, snapshots, shared-resource risks |
| [Known gaps](known-gaps.md) | Missing workflows, security/operations caveats, deferred decisions |

For coding-assistant conventions, read [AGENTS.md](../AGENTS.md). For a first checkout, start with local development; for exercise changes, read exercises and agents together.
