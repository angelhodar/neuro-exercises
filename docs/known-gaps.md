# Known gaps

The project has useful working foundations, but should not be presented as a complete clinical or operational system.

## Product and review

- Generated previews do not automatically become published catalog exercises.
- Automated browser review and enforced clinical approval are not implemented.
- Deliberate cross-organization exercise and template sharing remains a future direction.
- Share links exist, but independent patient use is ahead of the current release focus.
- Exercise results and patient session records are not a unified outcomes workflow.

## Access and privacy

- Organization membership does not provide comprehensive isolation of every resource.
- Media operations, sharing, and result access need further authorization review.
- Some ad-hoc execution information appears in URLs; avoid sensitive data.
- Media URLs are public. Licensing, consent, privacy, retention, and deletion policies are unresolved.
- Invitation delivery, verification, and account recovery need a complete operational setup.

## Operations

- Generated code is untrusted; prompt constraints and code checks are not a complete security boundary.
- Sandbox namespaces prevent accidental collisions only when configured uniquely. Shared credentials remain a broader access risk.
- Separate databases do not isolate shared media assets or service budgets.
- Database records and remote files are not updated as one atomic operation; reconciliation and cleanup need work.
- Builds apply migrations, and application rollback does not undo database changes.
- Preview provisioning and shared-resource cleanup are not fully automated.

Tests cover selected regressions, not every workflow or security boundary. Check the current code and operational configuration before expanding use with real patients or additional organizations.
