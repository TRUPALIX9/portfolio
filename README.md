# Trupal Patel Portfolio

A personal portfolio built with Next.js 16, React 19, TypeScript, Framer Motion, and Supabase-backed arcade leaderboards.

This repo is not a starter anymore. It contains:

- a multi-page portfolio site
- a playable arcade with multiple mini-games
- a protected admin playground for leaderboard moderation
- signed arcade-only share links
- Playwright end-to-end coverage for the game flow

## Stack

- Next.js 16
- React 19
- TypeScript
- Framer Motion
- Supabase
- Playwright
- Three.js / React Three Fiber

## Routes

Main pages:

- `/`
- `/about`
- `/projects`
- `/experience`
- `/experience/[slug]`
- `/resume`
- `/contact`
- `/social`
- `/game`

Arcade/admin routes:

- `/game` - public arcade hub
- `/playground` - protected admin dashboard
- `/arcade/[token]` - signed arcade-only mode
- `/api/leaderboard` - leaderboard read/write/admin moderation
- `/api/playground/share-link` - signed share-link generation

## Games

The arcade currently includes:

- Rocket
- Runner
- Reflex
- Memory
- Snake
- Breakout

The game hub lives in [src/components/GameHub.tsx](/Users/trupal/Projects/portfolio/src/components/GameHub.tsx), and each game is implemented in [src/components/games](/Users/trupal/Projects/portfolio/src/components/games).

## Environment Variables

Create `.env.local` with the values you need:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
KEY=...
SHARE_LINK_SECRET=...
DATABASE_URL=...
```

Notes:

- `KEY` protects the admin playground and admin API actions.
- `SHARE_LINK_SECRET` signs arcade-only URLs. If omitted, the app falls back to `KEY`.
- `DATABASE_URL` is used by the schema scripts.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are used by the leaderboard integration.

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Start production mode locally:

```bash
npm run start
```

## Leaderboard Setup

If the Supabase `leaderboard` table does not exist yet, create or patch it with the included scripts:

```bash
node scripts/create-leaderboard-table.mjs
```

For an existing table that is missing the `game` column:

```bash
node scripts/update-leaderboard-schema.mjs
```

Optional verification:

```bash
node scripts/verify-supabase.mjs
```

## Testing

Build verification:

```bash
npm run build
```

End-to-end tests:

```bash
npm run test:e2e
```

Headed Playwright run:

```bash
npm run test:e2e:headed
```

The Playwright suite is defined in [playwright.config.ts](/Users/trupal/Projects/portfolio/playwright.config.ts) and [e2e/games.spec.ts](/Users/trupal/Projects/portfolio/e2e/games.spec.ts). It runs desktop and mobile browser profiles against the arcade flow.

## Admin Playground

The admin dashboard lives at `/playground` and currently supports:

- key-based access
- leaderboard insights
- per-score deletion
- full leaderboard wipe
- signed arcade-only share-link generation

The signed link flow is implemented through:

- [src/app/playground/page.tsx](/Users/trupal/Projects/portfolio/src/app/playground/page.tsx)
- [src/app/api/playground/share-link/route.ts](/Users/trupal/Projects/portfolio/src/app/api/playground/share-link/route.ts)
- [src/app/arcade/[token]/page.tsx](/Users/trupal/Projects/portfolio/src/app/arcade/[token]/page.tsx)
- [src/utils/arcade-share.ts](/Users/trupal/Projects/portfolio/src/utils/arcade-share.ts)

## Project Notes

- The navbar is hidden automatically on signed arcade-only routes.
- The arcade uses portrait, square, and landscape viewports depending on the game.
- Player name persistence and score submission are centralized in [src/utils/arcade-player.ts](/Users/trupal/Projects/portfolio/src/utils/arcade-player.ts).
- Compatibility wrapper files exist in `src/components/games` for older import names.

## Maintainer Docs

Internal maintenance notes live in:

- [.agents/workflows/portfolio-site-maintenance.md](/Users/trupal/Projects/portfolio/.agents/workflows/portfolio-site-maintenance.md)
- [.agents/workflows/arcade-maintenance.md](/Users/trupal/Projects/portfolio/.agents/workflows/arcade-maintenance.md)
- [.agents/workflows/game-development.md](/Users/trupal/Projects/portfolio/.agents/workflows/game-development.md)

## Current Verification Status

Verified in this workspace:

- `npm run build` passes
- `npm run test:e2e` passes with `9 passed, 3 skipped`
- Playwright needed to be rerun outside the sandbox so the local test server could bind to port `3000`

One existing framework note remains:

- Next.js warns that the `middleware.ts` convention should eventually move to `proxy`
