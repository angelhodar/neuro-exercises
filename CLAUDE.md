# CLAUDE.md

## Project Overview

NeuroGranada — a neurological rehabilitation platform built with Next.js 16, featuring AI-powered cognitive exercises, speech recognition, and media management. Professionals can define exercises via natural language through a chat agent; the generated code runs in an isolated Vercel Sandbox for preview.

When starting work on a Next.js project, ALWAYS call the `init` tool from next-devtools-mcp FIRST to set up proper context.   

## Commands

```bash
npm run dev                    # Dev server (Turbopack)
npm run build                  # Production build
npm run check                  # Lint & format check (Ultracite/Biome)
npm run fix                    # Auto-fix lint & format issues
npm run db:push                # Push schema to database
npm run db:generate            # Generate Drizzle migrations
npm run db:migrate             # Run Drizzle migrations
npm run db:studio              # Open Drizzle Studio
npm run sandbox <command>      # Manage Vercel Sandbox (snapshot, start, stop, list, info)
```

## Architecture & Conventions

### Server-First Components

Default to server components. Only add `"use client"` when browser APIs or interactivity are needed.

### Data Fetching

- **Server actions** (`app/actions/`) for database operations
- **API routes** (`app/api/`) for streaming and file uploads
- **React Query** (`@tanstack/react-query`) for client-side async state

### Forms

Always use `react-hook-form` + `zod` + ShadCN `Form` components.

### Database

- Drizzle ORM with PostgreSQL (Neon)
- Schema defined in `lib/db/schema.ts` with relations alongside tables
- Shared `timestamps` helper for `createdAt`/`updatedAt` columns
- Use `createSelectSchema` / `createInsertSchema` from `drizzle-zod` for type-safe validation

### Auth

- Better Auth configured in `lib/auth/`
- **Server-side**: `auth.api.getSession({ headers: await headers() })`
- **API routes**: Use `withAuth` wrapper from `lib/auth/with-auth.ts`
- **Client-side**: `useSession()` from `lib/auth/auth.client.ts`

### Error Handling

- Server actions: try-catch with `console.error`
- Client-side: toast notifications via `sonner`

### State Management

- URL state via `nuqs`
- Exercise runtime state via `ExerciseProvider` context
- Local UI state via `useState`

## File Naming & Organization

- **Files**: `kebab-case.tsx` (e.g., `create-organization-button.tsx`)
- **Components**: PascalCase exports (e.g., `export function CreateOrganizationButton`)
- **Hooks**: `use-*.tsx` in `/hooks/`
- **Server actions**: `/app/actions/*.ts` with `"use server"` directive
- **Schemas**: `/lib/schemas/` for shared Zod schemas

## Exercise System

Each exercise lives in `/app/exercises/<slug>/` with 4 files:

| File | Purpose |
|------|---------|
| `<slug>.schema.ts` | Config + result Zod schemas, presets, `defaultConfig` |
| `<slug>.exercise.tsx` | Client component using `useExerciseExecution()` hook |
| `<slug>.config.tsx` | Form fields for exercise configuration |
| `<slug>.results.tsx` | Results display component |

- Dynamic loading via `loadExerciseAssets()` in `/app/exercises/loader.tsx`
- Base config schema extended per exercise via `.merge()` + `.superRefine()`

### AI Exercise Generation

Exercises can be generated/modified via a chat agent (`app/api/chat/route.ts`):

1. Agent uses Vercel AI SDK (`streamText`) with tools: `getCodeContext`, `readFiles`, `writeFiles`
2. Generated files are stored as ZIPs in Vercel Blob (`lib/storage.ts`, `lib/zip.ts`)
3. Generations tracked in `exerciseChatGeneration` DB table
4. Chat UI in `app/dashboard/exercises/[slug]/chat.tsx`

### Sandbox Preview

Generated exercises are previewed in an isolated Vercel Sandbox:

- **Snapshot-based**: A base snapshot has the project pre-installed with sandbox page variants
- **Per-exercise**: Sandbox created from snapshot, exercise files injected, dev server started
- **Sandbox pages** (`*.sandbox.tsx`): DB-free variants using `pglite` and `SANDBOX_EXERCISE` env var
- **Flow**: `SandboxProvider` → `createOrConnectToSandbox()` → iframe preview
- **Refresh snapshot**: `npm run sandbox snapshot` (snapshots expire after 7 days)

## UI Patterns

- ShadCN components (Base UI / `base-nova` style) from `@/components/ui/`
- Tailwind CSS v4 with `@theme inline` configuration
- Icons from `lucide-react`
- Notifications via `toast` from `sonner`
- Animations via `motion` library
- Responsive design with Tailwind breakpoints (`md:`, `lg:`)

## Import Order

1. Next.js imports
2. React imports
3. Third-party libraries
4. UI components (`@/components/ui/`)
5. Local libs (`@/lib/`)
6. Actions and hooks
7. Local components
