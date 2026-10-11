# Architecture

NeuroGranada is a web application with a few connected areas:

- **Professional workspace:** authoring, exercise browsing, media, patients, and administration.
- **Exercise runtime:** configuration, interactive execution, and results.
- **AI authoring:** requirements discovery followed by implementation and iterative refinement.
- **Data and storage:** structured records in a database; media and generated exercise checkpoints in object storage.
- **Identity and permissions:** accounts, organizations, and server-side access checks.

The application uses a React-based framework with server-side operations and browser interactivity. Exact libraries, versions, and source organization are maintained in the code and package manifest.

## Authoring and execution are different flows

Authoring turns an approved idea into a generated exercise and a saved checkpoint. A preview lets the professional try that version and request changes.

Execution combines an available exercise with a chosen configuration. It manages the interaction and presents results. Reusable presets and templates make configurations easier to repeat across sessions.

A generated preview is not automatically a published catalog exercise. Making a generated implementation available in the deployed catalog remains a separate concern.

## Isolated previews

Generated code runs in remote sandboxes rather than on the application host. An implementation workspace supports ongoing editing; a separate preview runs a saved version. Base snapshots provide a prepared starting environment.

Preview-specific behavior avoids relying on the production database. Sandboxing helps isolate execution, but does not establish clinical validity or remove the need for careful handling of generated code and credentials.

## Data boundaries

Authentication and resource permissions are enforced on the server. Database records and remote assets have different lifecycles: separating development data does not automatically isolate shared media or service access. See [database](database.md), [authentication](authentication.md), and [deployment](deployment.md).
