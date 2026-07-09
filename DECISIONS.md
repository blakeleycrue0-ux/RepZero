# Decisions

Choices made where the build brief left something open, and why.

## Naming and legacy content

The repo previously held a static-HTML prototype called "RepZero" (`index.html`, `home.html`,
etc.). That prototype doesn't match the brief (no Next.js, no server-side AI proxy, no design
system) and the brief calls for a from-scratch, website-first rebuild, initially under the
working title "Repsette." Rather than delete the old prototype outright, it's preserved under
`legacy-static/` for reference; the live app is the new Next.js codebase at the repo root.

Once the real product name and logo were provided, the app was rebranded to **RepZero** (its
original name) via `lib/brand.ts` and the provided logo mark (`public/logo-mark.png`, plus
generated app icons). IndexedDB database names also moved from `repsette-*` to `repzero-*`,
which resets local data for anyone who used the app during the brief Repsette-named window —
an acceptable one-time cost this early, with no migration path built for it.

## Fonts

Display: **Fraunces** (variable, opsz/SOFT/WONK axes) — a serif with real character, avoiding
the generic-template grotesque look. Body: **Public Sans** — a clean neutral grotesque, not
Inter, per the brief's explicit steer away from an all-Inter feel.

## Theming

Class-based (`.light`/`.dark` on `<html>`), defaulting to system preference on first visit,
persisted in `localStorage`, applied via an inline `beforeInteractive` script to avoid a
light-flash-then-dark on load. Tailwind v4's CSS-first `@theme` config, not a JS config file.

## Data layer

IndexedDB via `idb-keyval`, one database per collection (`repsette-profile`,
`repsette-scans`, etc.) rather than one shared database with multiple object stores —
`idb-keyval`'s `createStore()` only creates an object store during that database's *initial*
upgrade, so reusing one database name across several `createStore()` calls silently drops
every store after the first. Separate databases sidestep that entirely. All access goes
through a `DataStore` interface (`lib/store/interface.ts`) so a Supabase/Postgres
implementation can be swapped in later for accounts + sync without touching UI code.

## Streaming

The brief asks for SSE for both the coach/nutrition chat and plan generation. Chat streams
token-by-token as plain `text/plain` chunks (simpler than re-implementing full SSE framing on
both ends, and the client only ever needs a running text buffer, not distinct event types).
Plan and nutrition generation call the non-streaming Anthropic endpoint and return one JSON
payload — token-streaming a partial JSON object into a progressively-rendered structured plan
is a meaningfully larger UI problem than the couple-of-seconds latency it would save, so a
loading state is used instead, matching the brief's explicit allowance ("non-streaming is fine
for the body-scan JSON") extended to the other structured-JSON endpoints.

## Rate limiting and abuse control

In-memory, per-IP, best-effort (`lib/ai/ratelimit.ts`) — resets on cold start and isn't shared
across serverless instances. Sufficient as an MVP backstop; a real account system would move
this to persistent, per-account storage.

## Gym reminders

True push notifications that fire when the app isn't open require a Web Push subscription plus
a server that sends at the right time (VAPID keys + a scheduled dispatcher) — infrastructure
beyond a serverless Next.js app without a persistent worker. Implemented instead: (1)
best-effort local reminders via the Notification API, scheduled client-side for the next 7
days, which only fire while the tab/installed app is alive, and (2) `.ics` calendar export,
which is unconditionally reliable and works with any calendar app. The UI is explicit about
this distinction rather than promising guaranteed delivery it can't back up.

## Share cards

Rendered to `<canvas>` client-side and exported via `canvas.toBlob` + the Web Share API (with
a download fallback), per the brief. Canvas text uses system/serif font stacks rather than the
loaded Fraunces/Public Sans font objects, since those are scoped inside `next/font`-generated
class names not easily reachable from a plain `lib/` module — a reasonable simplification that
keeps the visual character (serif display + sans body) without wiring font-loading into the
canvas path.

## Body map illustration

A hand-built, stylized geometric SVG (front + back), not a licensed anatomical illustration —
matches the "custom iconography, editorial, not templated" bar in the brief better than a stock
body-map asset, and keeps the whole app dependency-free for this feature.

## Auth

Not implemented. The brief explicitly scopes accounts as sync/sharing on top of a fully-usable
local mode; local mode is what's built. `DataStore` is already interface-based so accounts can
be added later without a UI rewrite.
