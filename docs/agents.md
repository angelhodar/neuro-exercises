# Agents and previews

Two agents support exercise authoring. Their responsibilities are deliberately separate.

## Requirements agent

This agent helps turn an initial idea into an agreed brief. It asks for missing information, proposes a specification, and allows the author to revise it before implementation.

Submitted conversations are saved as private drafts so the author can return later. Unsubmitted text is not saved. Saved drafts support continuing the work, not replaying an interrupted live response exactly.

## Implementation agent

This agent builds and refines the exercise from the approved brief. It follows the project's existing exercise conventions and produces a short user-facing summary of changes.

An editing workspace preserves continuity between iterations. Completed work is checked and saved as a checkpoint before being offered for preview. These checks catch structural and code problems; they do not establish functional or clinical correctness.

Other AI features support media, descriptions, search, and speech. Model choices and tooling are implementation details and may change without changing these responsibilities.

## Preview lifecycle

- A **base snapshot** provides a prepared starting environment.
- An **implementation workspace** supports ongoing edits.
- A **preview** lets the author try a saved version separately from editing.

Each independent database/environment needs a unique stable `SANDBOX_NAMESPACE`. Stored editing state from another environment is rejected rather than silently resumed. Existing or copied database references may need an explicit reset; see [deployment](deployment.md).

Generated code remains untrusted. Isolated execution helps protect the application host, but prompt instructions are not a hard permission boundary, and shared service credentials still need careful handling.

## Future reviewer

The intended third agent would run an exercise in a browser and report functional problems alongside human review. It is **not implemented yet**. Even once available, functional checking should remain distinct from clinical approval.
