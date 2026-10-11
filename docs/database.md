# Database

## What is stored

The database holds accounts and organizations, exercise descriptions and authoring history, saved drafts and configurations, templates, results, media metadata, and patient/session records.

It does not hold everything needed to run an exercise. Exercise implementations come from application code or generated checkpoints; media files are stored separately. Removing a database record does not necessarily remove every associated remote asset.

## Development and hosted data

Use local PostgreSQL with the vector-search extension for everyday development. Hosted deployments use a compatible database; PR previews should use a dedicated Neon database branch rather than production data.

Connection configuration is described in [environment variables](environment-variables.md). Use synthetic patient information while developing.

## Schema changes

Use versioned migrations so database changes can be reviewed and applied consistently:

```bash
npm run db:generate
npm run db:migrate
```

Review generated changes and verify the target database before applying them. Direct schema synchronization is intended only for deliberate work on disposable databases, not as a replacement for migration history.

**The build command also applies migrations.** Rolling back an application deployment does not automatically undo database changes.

## Isolation and copies

Organizations do not currently provide complete separation of every resource. Some information is owned by individual creators, while some catalog resources have broader read access.

When copying a database into another environment, configure a distinct `SANDBOX_NAMESPACE` and clear copied remote workspace references before generation. Otherwise, stored editing state can still belong to the source environment. Follow [deployment](deployment.md); do not modify production records merely to prepare a preview.
