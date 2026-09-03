# Exercise Preview Investigation

## Current Status

Exercise generation, checkpointing, preview-sandbox creation, and client-side
hydration work. The generated `adivina-palabra-secreta` exercise was verified
in a direct sandbox preview: `Empezar` starts the countdown and the generated
exercise mounts afterward.

The hydration failure was caused by bundling `@electric-sql/pglite` into the
Next.js webpack server runtime. Initializing the sandbox database through the
`saveExerciseResults` server action caused PGlite's WASM asset `URL` to cross a
webpack VM realm. Node rejected it with `ERR_INVALID_ARG_TYPE` (`Received an
instance of URL`), aborting the RSC stream after the initial HTML had rendered.
React therefore never committed the client tree or attached event handlers.

`@electric-sql/pglite` is now listed in `serverExternalPackages`, so Node loads
it outside the webpack VM. `*.vercel.run` is also listed in
`allowedDevOrigins`, allowing the sandbox's HMR and development font requests.

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

### Generated UI renders but is not interactive (resolved)

The generated exercise screen was visible, but client handlers did not run.
The following observations were verified against a completed generation:

- The preview route returns `200` and includes the generated exercise client
  module in its RSC payload.
- All required JavaScript chunks load successfully.
- React DevTools reports renderers, but no committed component tree is exposed.
- DOM buttons have no React event properties, and both browser clicks and
  `element.click()` leave the initial screen unchanged.
- Browser console did not show a hydration exception.
- The Next.js server log showed an unhandled `ERR_INVALID_ARG_TYPE` from the
  PGlite initialization for every exercise request.
- A checked-in exercise failed in the same sandbox, ruling out generated module
  discovery and client-reference manifests.

The server-side rejection aborted the streamed response without surfacing a
browser hydration exception. Externalizing PGlite fixed both the checked-in and
generated exercise paths. The iframe `sandbox` attribute was not involved.

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

## Verification

1. Opened a generated exercise through the sandbox's direct preview URL.
2. Confirmed the RSC response completed and the initial screen hydrated.
3. Confirmed the HMR client connected without a cross-origin rejection.
4. Clicked `Empezar`, observed the countdown, and reached the generated exercise
   controls.
5. Repeated the test with the repository's server-rendered sandbox page rather
   than the temporary client-side loader used during investigation.

## Relevant Files

- `app/api/chat/route.ts`: generation stream completion and checkpoint timing.
- `app/actions/sandbox.ts`: generation selection and preview initialization.
- `hooks/use-sandbox.tsx`: client preview initialization lifecycle.
- `app/dashboard/exercises/[slug]/chat.tsx`: preview trigger after chat stream.
- `lib/sandbox.ts`: Git-sourced base sandbox and snapshot preparation.
- `lib/ai/exercise-workspace.ts`: workspace and preview sandbox creation.
- `app/exercises/[slug]/page.sandbox.tsx`: preview route and default config.
- `app/exercises/loader.tsx`: dynamic generated-exercise module loading.
