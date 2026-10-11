# Known gaps and deferred decisions

This is a factual boundary map, not a claim that the listed areas are the only remaining risks. Documentation refresh, PostgreSQL support and bootstrap do not remediate unrelated application behavior.

## Product workflow

- No third browser reviewer agent; current automated generation checks are types, lint and file structure.
- No enforced clinical approval lifecycle or completed generated-exercise publication pipeline. Metadata/checkpoints are not automatically checked-in/deployed implementations.
- Cross-organization catalog/template sharing is a product goal, not a complete implemented permissions system.
- Share links exist but are considered premature by the owner. They have not been disabled; independent patient execution should not be the release's main promise.
- Patient notes/sessions/tests and link-based exercise results are different data paths, not a unified patient outcome system.

## Authorization and privacy

- Organization membership does not isolate all catalog/media/template reads. Many resources are creator-scoped or globally read.
- Media deletion lacks an action-level auth/ownership guard. Fix before exposing broader access or testing destructive operations.
- Templates and share-link lookup/execution/results need an explicit authorization/expiry/integrity review. Do not infer safety from an authenticated dashboard alone.
- Ad-hoc results/configuration are serialized into URLs and can enter browser history/logs. Do not include sensitive patient data.
- Blob objects are public. Licensing, patient-identifying uploads, consent, retention/deletion and audit expectations are unresolved.
- Email invitation delivery, verification delivery and self-service password reset are not configured. Initial-admin bootstrap does not solve account recovery or verification.

## Agent/operations boundaries

- Pi runs with `permissionMode: "allow-all"`; folder restrictions are prompt-level. Checkpoint validation does not prove that the agent changed nothing outside the folder.
- Sandbox namespacing prevents ID collisions only when each independent database/environment uses a distinct `SANDBOX_NAMESPACE`. Shared project credentials are still not a security boundary. Cloned databases need explicit reference resets; automated preview provisioning/namespace assignment is not implemented.
- Shared Blob credentials allow cross-environment asset deletion; DB isolation does not prevent it.
- Database/Blob writes are not one distributed transaction; orphaned uploads and dangling references need reconciliation.
- Vercel build runs DB migrations; deployment rollback does not automatically roll back data/schema.
- Neon PR branches and shared-service budgets/cleanup are not provisioned automatically by repository CI.
- Base snapshots clone remote revisions and do not include unpushed local changes.

## Tooling

- `agent:generate-exercise` and `generate-media-metadata` point to missing source files.
- PR CI checks lint/types only. Regression commands exist but are not enabled there, and full browser coverage is absent.
- Auth/refinement/setup tests are targeted and isolated; they are not a comprehensive security, clinical or integration certification.

## New setup capabilities in this branch

Local PostgreSQL/pgvector runtime support, an example env file, Compose configuration and safe one-time administrator bootstrap are implemented in this branch. They should be considered part of the documented setup once merged, not functionality already deployed to production.
