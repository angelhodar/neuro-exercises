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
- PR preview database: `preview-pr-31`.
- Production database: `production`.

This keeps editing workspaces, agent sessions, and previews from colliding when separate databases contain the same exercise IDs. Keep the value stable across deployments, and do not reuse a single value for every developer or PR.

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
