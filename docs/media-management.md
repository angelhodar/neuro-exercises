# Media management

The media library provides reusable images, audio, and video that professionals can select while configuring exercises. This separates the activity's behavior from the resources used in a particular session.

## Adding and finding resources

Resources can be uploaded manually. Images can also be created or refined with AI, or imported from web search.

Names, descriptions, and tags help organize the library. Semantic search helps find resources by meaning rather than only exact keywords. Search quality depends on the available descriptions and indexing.

The original file lives in object storage; the database keeps its metadata and reference. Uploading a file and saving its metadata are separate operations, so incomplete intake can leave unused assets.

## Visibility and ownership

Current media storage uses public URLs. Application login does not make an existing public URL private, and recording an author does not imply a complete organization-sharing or licensing policy.

Some supporting assets—such as exercise images, instructions, or saved code checkpoints—use the same storage service without being ordinary library entries.

## Deletion

Deletion affects both records and remote files, but there is no complete reference audit or general cleanup process. Permissions and cleanup safety need further review before broader use.

Development and production currently share media resources. A local test using shared credentials can delete an asset that production still needs. Use separate development storage before destructive testing; a separate database alone is not sufficient.

## Responsible use

Licensing, patient-identifying uploads, consent, and retention rules remain unresolved. Web search does not establish reuse rights, and AI generation does not automatically establish ownership.

Do not upload patient-identifying media to the public library without an approved privacy and security design. See [known gaps](known-gaps.md).
