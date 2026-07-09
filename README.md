# Repsette

An AI-powered fitness companion: scan your physique for an honest per-muscle-group readout,
get an AI-generated workout plan and weekly schedule, nutrition guidance, a habit tracker,
gym reminders, and an ask-me-anything gym coach.

"Repsette" is a working title — swap it in `lib/brand.ts`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4
- Local-first data layer (IndexedDB via `idb-keyval`) behind a swappable `DataStore` interface
  (`lib/store/`) — no account or server database required to use the app
- Server-only API routes (`app/api/*/route.ts`) proxy to the Anthropic API; the browser never
  sees the API key
- PWA: installable, offline shell, best-effort local reminders + `.ics` calendar export

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Onboarding walks you through a profile,
then the app is fully usable in local mode — everything is stored in your browser's
IndexedDB.

### Environment variables

| Variable            | Required | Notes                                                   |
| -------------------- | -------- | -------------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | Yes      | Server-only. Powers body scan, plan, nutrition, and chat. |

## AI routes

All AI calls go through server-side route handlers, never directly from the client:

- `POST /api/body-scan` — vision analysis of up to 3 photos → muscle-group ratings JSON. Photos
  are held in memory only for the duration of the request and are never written to disk or a
  database.
- `POST /api/plan` — structured weekly workout plan JSON
- `POST /api/nutrition` — structured daily nutrition guidance JSON
- `POST /api/coach` — streamed gym-coach chat
- `POST /api/nutrition-chat` — streamed nutrition swap chat

Each route rate-limits per client IP (best-effort, in-memory) and logs request metadata only
(never photo or message content) — see `lib/ai/ratelimit.ts`.

## Project layout

```
app/                  routes (App Router)
  api/                 server-only AI proxy routes
  onboarding/          profile setup
  scan/                body scan capture + results
  plan/                workout plan + weekly schedule
  coach/, nutrition/    AI chat surfaces
  habits/              habit tracker
  progress/            scan history + shareable progress cards
  legal/               privacy, terms, how-the-AI-works
  settings/            export/delete data, theme, install
lib/
  store/                DataStore interface + IndexedDB implementation + shared types
  ai/                   Anthropic client, prompts, rate limiting
components/            shared UI, nav, body map SVG, chat
```

See `DECISIONS.md` for choices made where the brief left something open.

## Build

```bash
npm run build
npm run lint
```

## Deploy

Any Next.js host works (Vercel, Netlify, etc.) — set `ANTHROPIC_API_KEY` in the environment.
There's no database to provision; data lives in each user's browser.
