# NeuroGranada

A neurological rehabilitation platform with AI-powered cognitive exercises, speech recognition, and media management.

**[neurogranada.com](https://neurogranada.com)**

## Features

- **AI-powered exercise generation** — Create cognitive exercises via a natural language chat interface using AI (Google Gemini, Together AI, Groq)
- **Speech recognition & text-to-speech** — Cartesia-based Spanish TTS and speech transcription via Groq
- **Media management** — Upload and manage images, audio, and video via Vercel Blob
- **Exercise templates** — Configurable presets (easy/medium/hard) with shareable exercise links
- **Results tracking** — Record and review exercise results per patient
- **Organization & user management** — Role-based auth with organizations via Better Auth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS, ShadCN / Radix UI |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Better Auth (email/password, organizations, admin) |
| AI | Vercel AI SDK (Google Gemini, Together AI, Groq) |
| Media Storage | Vercel Blob |
| TTS | Cartesia |
| Sandboxed Execution | E2B |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

### Install & Run

```bash
npm install
npm run dev
```

### Database Setup

```bash
npm run db:push
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `BETTER_AUTH_SECRET` | Auth secret for Better Auth |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key |
| `GROQ_API_KEY` | Groq API key (speech transcription) |
| `CARTESIA_API_KEY` | Cartesia TTS API key |
| `SERPER_API_KEY` | Serper image search API key |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `NEXT_PUBLIC_BLOB_URL` | Public blob base URL |
| `E2B_API_KEY` | E2B API key (sandboxed execution) |
| `E2B_TEMPLATE_ID` | E2B sandbox template ID (optional) |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:push` | Push schema to database |
| `npm run agent:generate-exercise` | AI agent to generate a new exercise |
| `npm run generate-media-metadata` | Populate media metadata |

## Project Structure

```
app/
  (landing)/          # Public landing page
  actions/            # Server actions (exercises, media, templates, etc.)
  api/                # API routes (auth, chat, media)
  dashboard/          # Dashboard pages
  exercises/          # Exercise modules (one folder per exercise)
    [slug]/           # Dynamic exercise routes
    loader.tsx        # Dynamic exercise asset loading
components/
  exercises/          # Shared exercise components
  ui/                 # ShadCN UI components
hooks/                # Custom React hooks
lib/
  ai/                 # AI provider configuration
  auth/               # Better Auth setup (server, client, middleware)
  db/                 # Drizzle ORM schema & connection
  schemas/            # Shared Zod schemas
scripts/              # CLI scripts (e2B sandbox, media metadata)
```
