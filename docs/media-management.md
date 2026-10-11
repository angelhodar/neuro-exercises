# Media management

## Storage and data model

`lib/storage.ts` wraps Vercel Blob. Uploads are **public** by default and normally add random suffixes. PostgreSQL stores object pathnames rather than full URLs; `createBlobUrl` resolves them against `NEXT_PUBLIC_BLOB_URL`.

`medias` stores author, name, description, tags, MIME type, Blob key, optional thumbnail key, metadata, optional `derivedFrom` parent, and a 768-dimensional embedding. It does not define organization-level visibility or a licensing/consent/retention model.

Library objects use `library/`; exercise thumbnails use `thumbnails/`; generated instructions use `audio/`; code checkpoints use `generations/`. They share the Blob service but are not all media library rows. Speech recording paths are handled by speech actions.

## Intake paths

1. **Manual image/audio/video upload:** client `uploadBlobFromFile` requests a token through `/api/media/upload`; the handler authenticates the user and permits image/audio/video MIME families. The client then submits metadata/pathname through `uploadManualMedia`. A description can generate an embedding.
2. **AI image generation/editing:** `app/actions/media.ts` translates prompts to English, uses `spacexai/grok-imagine-image-2.0`, and optimizes output to WebP. Preview generation returns base64; committing persists it to Blob and the library. Derived images can retain the parent ID.
3. **Web image search/import:** Serper finds images; selected results are fetched/optimized/uploaded. AI generates Spanish name/description/tags; import metadata records the original image URL. Individual imports may fail independently.

Metadata generation currently uses `google/gemini-3.8-flash` through Gateway. Successful upload and successful metadata/database insertion are separate operations; failures can leave orphaned public objects. There is no general transactional reconciliation job.

## Search and exercise use

`lib/ai/embedding.ts` uses `google/gemini-embedding-001` with 768 dimensions and retrieval-document/query task types. The main `getMedias` path computes cosine similarity for text queries, filters above 0.3 and orders by similarity; an empty query sorts newest-first. The UI supports paginated/infinite-scroll browsing. Query embeddings are cached in-process, not in a shared durable cache.

Tag lookup and API search/tags endpoints support selectors and sandbox variants. Exercise config forms select assets; generated exercises should reuse those conventions instead of hard-coding inaccessible URLs.

```bash
npm run db:backfill-embeddings
```

The backfill writes missing embeddings for rows with descriptions, in batches of ten. It needs Gateway access, can incur costs, and modifies the configured database. The older `generate-media-metadata` npm script points at an absent file and is not a working maintenance command.

## Deletion and shared resources

`deleteMedia` deletes the supplied row, then its main/thumbnail Blob paths. There is no atomic transaction across PostgreSQL and Blob, unused-asset scan, or complete reference audit. The action currently lacks its own auth/ownership guard. This is a known gap, not an intended permission policy.

Gateway, Sandbox and Blob are currently shared between development/preview/production. Deleting a Blob from a local test can break a production reference even with a local database. Never run cleanup against shared credentials casually. A separate development Blob store is recommended before destructive testing; it is not configured by this change.

## Unresolved policy

Media licensing, patient-identifying uploads, privacy/consent and unused-asset retention have not been defined. Search results are not automatically licensed for reuse; AI generation does not establish rights. Do not upload patient-identifying media to the public library without an approved privacy/security design. Application login is not access control for a public Blob URL.
