# Exercise Preview Investigation

## Current Status

Exercise generation, checkpointing, and preview-sandbox creation work. The
generated `adivina-palabra-secreta` exercise rendered its initial screen in a
preview sandbox, but its React event handlers did not attach: the `Empezar`
button did not change state either in the dashboard iframe or when opened
directly at the sandbox URL.

This is not an iframe-permissions issue. The same behavior occurred when the
preview URL was opened in its own browser tab.

## Fixes Already Applied

- `SANDBOX_PROJECT_DIR` is `/vercel/neuro-exercises`. Git-sourced Vercel
  sandboxes clone the repository there, not under `/vercel/sandbox`.
- `createSnapshot()` now fails when `npm ci` fails, rather than snapshotting an
  environment without dependencies.
- The preview waits to emit the AI SDK `finish` event until the generation
  checkpoint has been uploaded and its database status is `COMPLETED`.
- The chat UI does not try to initialize preview after an aborted, disconnected,
  or errored stream.
- The sandbox page uses the generated exercise's `defaultConfig` if preview is
  opened without a `config` query parameter. This avoids redirecting preview to
  the configuration route, which cannot load newly generated client modules.

## Known Failure Modes

### No completed exercise version

`initializeExercisePreview()` reports `No se encontró una versión completa del
ejercicio` when the latest generation has no `codeBlobKey`. Inspect the latest
generation and its workspace error before retrying preview. The preview error is
a symptom; the workspace `lastError` identifies the underlying failure.

Previously observed root causes:

- Invalid sandbox working directory:
  `chdir /vercel/sandbox/neuro-exercises: no such file or directory`.
- Dependency installation failure because `package-lock.json` was out of sync.
- Checkpoint validation failure because the agent was asked not to create an
  exercise, so the required exercise directory did not exist.

### Generated UI renders but is not interactive

The generated exercise screen is visible, but client handlers do not run. The
following observations were verified against a completed generation:

- The preview route returns `200` and includes the generated exercise client
  module in its RSC payload.
- All required JavaScript chunks load successfully.
- React DevTools reports renderers, but no committed component tree is exposed.
- DOM buttons have no React event properties, and both browser clicks and
  `element.click()` leave the initial screen unchanged.
- Browser console does not show a hydration exception.

The likely area is Next's client-reference or hydration behavior for client
components dynamically loaded from checkpoint files in a sandbox. Do not treat
the iframe `sandbox` attribute as the cause until direct-preview interaction is
shown to work.

## Useful Commands

Run local checks before changing snapshot or preview code:

```bash
npm run check
npm run ts-check
```

Create a fresh base snapshot after the sandbox source is available from Git:

```bash
npm run sandbox:snapshot
```

The snapshot source is the configured Git repository and revision in
`lib/sandbox.ts`. Local uncommitted changes are not included when a new base
sandbox is created from Git. Commit and push the relevant sandbox files before
refreshing a snapshot intended for shared use.

Inspect sandbox state with the SDK from the project root:

```bash
npx tsx -e 'import { Sandbox } from "@vercel/sandbox"; void (async () => { const sandbox = await Sandbox.get({ name: "<sandbox-name>" }); const result = await sandbox.runCommand({ args: ["-lc", "pwd; ls -la"], cmd: "sh" }); console.log(await result.stdout()); })();'
```

Inspect a preview directly in the browser, rather than only through the
dashboard iframe:

```bash
agent-browser open "https://<sandbox-domain>/exercises/<slug>"
agent-browser snapshot -i
agent-browser screenshot --annotate
agent-browser console
agent-browser errors
```

Capture requests while reloading a preview:

```bash
agent-browser network requests --clear
agent-browser reload
agent-browser wait 5000
agent-browser network requests
```

## Recommended Next Investigation

1. Create a fresh completed generation and a fresh preview sandbox from the
   latest base snapshot. Do not reuse a prior preview sandbox for this test.
2. Compare it with a checked-in exercise opened through the same sandbox and
   browser session. Determine whether hydration fails for all sandbox pages or
   only checkpoint-restored exercise modules.
3. Capture the complete RSC response for both cases and compare client module
   references and chunk lists. The key question is whether a restored generated
   client module has a usable entry in the Next client manifest.
4. Add a minimal static client component with a stateful button to the sandbox
   page. If it hydrates while the generated component does not, focus on the
   dynamic import/client-reference boundary in `app/exercises/loader.tsx`.
5. If the static component also does not hydrate, investigate the sandbox dev
   server configuration and the Next client bootstrap before changing generated
   exercise code.
6. Keep server-side checkpoint validation in place. A successful type check does
   not prove that a dynamically restored client component can hydrate.

## Relevant Files

- `app/api/chat/route.ts`: generation stream completion and checkpoint timing.
- `app/actions/sandbox.ts`: generation selection and preview initialization.
- `hooks/use-sandbox.tsx`: client preview initialization lifecycle.
- `app/dashboard/exercises/[slug]/chat.tsx`: preview trigger after chat stream.
- `lib/sandbox.ts`: Git-sourced base sandbox and snapshot preparation.
- `lib/ai/exercise-workspace.ts`: workspace and preview sandbox creation.
- `app/exercises/[slug]/page.sandbox.tsx`: preview route and default config.
- `app/exercises/loader.tsx`: dynamic generated-exercise module loading.
