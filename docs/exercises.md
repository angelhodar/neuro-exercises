# Exercise system

## Module contract

Each checked-in exercise lives at `app/exercises/<slug>/`:

| File | Role and required exports |
| --- | --- |
| `<slug>.schema.ts` | `configSchema`, `resultSchema`, `defaultConfig`; may also define built-in presets/types |
| `<slug>.exercise.tsx` | Client-side `Exercise` component accepting `config` |
| `<slug>.config.tsx` | `ConfigFields`, optionally nested with `basePath` |
| `<slug>.results.tsx` | `Results` display |

`app/exercises/loader.tsx` imports those exact names dynamically. `loadClientAssets` loads configuration/schema assets only. A missing/invalid module yields no assets. `app/exercises/scanner.ts` discovers checked-in implementations for the registration UI.

Existing slugs: `color-sequence`, `odd-one-out`, `reaction-time-grid`, `stimulus-count`, `stroop-color-interference`, `syllables`, `visual-recognition`, and `word-matching`. Follow the most comparable module when adding one; difficulty presets and media selections vary by exercise.

## Configuration and execution

Exercise schemas extend `baseExerciseConfigSchema` in `lib/schemas/base-schemas.ts`. Shared fields cover question/time termination, total questions, time limit, and automatic/manual question advancement. Use react-hook-form/Zod and existing shared configuration fields; validate cross-field constraints in the exercise schema.

`hooks/use-exercise-execution.tsx` exports `ExerciseProvider` and `useExerciseExecution`. It coordinates ready/executing/finished state, question index, collected results, start/reset, timeout and manual advancement. Exercises call `addResult`, `nextQuestion`, and `finishExercise` instead of inventing incompatible lifecycle handling. A `paused` state is in the type; this does not mean a complete pause/resume implementation exists.

Routes under `app/exercises/[slug]/` load the database record and module. Config/results URL parsers validate serialized JSON against schemas. In ad-hoc mode, configuration/results travel in query parameters; avoid sensitive information in them. Link mode loads template-item configuration and stores results through the link actions.

## Presets, templates and sharing

- Built-in presets belong to the module; user-created named configurations live in `exercise_config_presets`.
- Templates contain ordered exercise items with saved configurations (`exercise_templates` / `exercise_template_items`).
- Share links target a **user account**, reference a template, and expose `/s/[token]`. They are separate from creator-owned patient records.
- Link results enforce a unique link/item pair at the schema level; this is not a complete statement about endpoint authorization.

Share links are implemented but premature relative to the current clinician-led product focus. Their permission/expiry/results behavior needs review before promoting unsupervised use. Do not equate saved exercise results with automatic attachment to a patient session/test.

## Generated versus checked-in exercises

AI creation stores metadata and an initial generation row. The implementation agent writes source into a Sandbox; completed files are archived as a Blob ZIP. A separate preview sandbox renders that checkpoint with sandbox-specific routes.

This does not automatically add the implementation to the deployed repository/module catalog. There is no completed publish/clinical approval flow in the current code. A `prNumber` field is not evidence that publishing is available. See [agents](agents.md) for checkpoint validation and [known gaps](known-gaps.md) for publication/review work.
