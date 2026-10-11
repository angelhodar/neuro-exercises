# Agents and sandbox execution

There are two agents in the **exercise authoring pipeline**. Other AI calls handle metadata, translation, images, embeddings and speech; they are supporting services rather than additional exercise workflow agents.

## 1. Requirements refinement

Source: `lib/ai/refinement/`, `app/api/exercise-refinement/route.ts`, `app/actions/exercise-requirement-drafts.ts`, and the creation UI.

The AI SDK `ToolLoopAgent` currently uses `anthropic/claude-sonnet-5.5` through Gateway. Tools are `askUserQuestion` and `proposeExerciseBrief`; active tools/tool choice depend on the refinement state. It gathers missing information and proposes a structured brief instead of generating React code.

Submitted ideas, questions/answers, revisions and proposals persist in private `exercise_requirement_drafts` rows. Unsubmitted text is not saved. Users reopen drafts through “Mis borradores” or `?draft=`; interrupted refinements can be retried with “Continuar borrador”, but live streams are not resumed. Revision checks reject stale/foreign draft requests. Pending questions, active streams and errors block premature approval.

`createExercise` uses the approved brief as the source of truth, creates metadata and the first generation, then hands that specification to the implementation workflow.

## 2. Exercise implementation

Source: `lib/ai/agent/agent.ts`, `prompts.ts`, `/api/chat`, workspace/checkpoint helpers.

`HarnessAgent` runs Pi (`createPi`, `auth: "ai-gateway"`, medium thinking) with `anthropic/claude-sonnet-5.5`. Its prompt asks it to inspect comparable existing exercises, work only under `app/exercises/<slug>/`, preserve the four-file contract, run type/lint checks, and return a brief Spanish summary for non-technical users.

The harness has `permissionMode: "allow-all"`. Folder-only instructions are **prompt constraints**, not a filesystem sandbox permission policy. The hosted sandbox isolates code from the app host, but the current configuration should not be described as a complete defense against malicious generated code/network activity.

### Request lifecycle

1. `/api/chat` revalidates the session and checks exercise creator/admin permission.
2. It identifies/creates a generation and claims the exercise workspace. A conflicting active generation returns HTTP 409.
3. A workspace lock expires after 30 minutes and is refreshed every minute while the request runs.
4. A persistent Vercel Sandbox is created/resumed from a base snapshot; a completed checkpoint can restore files on creation.
5. The harness resumes its saved session state, streams, and edits the workspace.
6. On completion, the app collects/validates files, runs checks and uploads a ZIP checkpoint. It stores the summary, completion state and harness resume state and releases the lock.
7. The UI receives the completion event only after checkpoint persistence, then initializes a separate preview. Intermediate tool events/commentary are filtered from the user-facing stream.

Failures record `ERROR` and workspace error state; recoverable harness state may be retained. Persistent editing state is not a promise that an interrupted browser stream can be resumed verbatim.

### Checkpoint validation

`lib/ai/exercise-checkpoint.ts` requires all four files, rejects symlinks/invalid paths/extensions, limits the folder to 50 files and 2 MiB total, and permits only `.ts`, `.tsx`, `.json`, and `.md`. It runs project TypeScript checking and scoped lint before uploading `generations/<uuid>.zip`.

These are structural/code checks, not browser execution or clinical review. They validate the collected exercise folder, not an audited diff of every workspace change.

## Three Sandbox layers

- **Base snapshot:** remote Git checkout, Node 24 dependencies installed, `.sandbox.*` files copied over normal files. Name/source depend on branch/deployment revision.
- **Implementation workspace:** persistent `<namespace>-exercise-workspace-<exerciseId>`, harness session `<namespace>-exercise-<exerciseId>`, 30-minute runtime timeout, configured last-snapshot retention. Stored in `exercise_workspaces`.
- **Generation preview:** `<namespace>-exercise-preview-<generationId>-<random>`, checkpoint ZIP restored into a separate non-persistent sandbox, port 3000/dev server and preview `.env`. Only matching namespace/generation previews can be reused and timeout extended; a new preview has a 15-minute timeout.

Previews use PGlite/sandbox routes rather than production DB credentials, and receive the public Blob URL and serialized exercise metadata. Generated code remains untrusted. `SANDBOX_NAMESPACE` is mandatory and must differ per database/developer/PR. Legacy/foreign workspaces are rejected rather than silently resumed; the operator reset command is needed for existing or cloned workspace records. See [deployment](deployment.md) for rollout and shared-credential limitations.

## Future reviewer

The owner intends a third agent using `agent-browser` to run exercises and check their interactive behavior, alongside human review. **No such reviewer exists today.** A future design needs testable acceptance criteria, representative configurations, accessible controls, failure artifacts, and an explicit boundary between functional checks and clinical approval. This documentation does not install or invoke a reviewer.
