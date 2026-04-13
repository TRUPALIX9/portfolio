# Arcade QA Matrix

This project now has two layers of verification:

- `npm run test:e2e` for fast mocked end-to-end coverage across desktop Chrome, mobile Safari, and mobile Chrome.
- Manual device checks for the canvas-heavy input paths that are still best validated on real hardware.

## Automated Coverage

The Playwright suite currently verifies:

- `/game` renders all six cabinets and each cabinet can be opened from the hub.
- Desktop smoke interactions for click and keyboard driven gameplay flows.
- Mobile smoke interactions for swipe and tap driven gameplay flows.
- `/playground` rejects invalid keys and unlocks only after a successful server-validated admin fetch.

These tests intentionally mock `/api/leaderboard` so they do not mutate the real Supabase leaderboard during CI or local runs.

## Manual Device Matrix

### Snake

- Desktop Chrome on macOS:
  Verify both arrow keys and `W/A/S/D` move the snake reliably.
- iPhone Safari:
  Swipe in each direction and confirm the page does not scroll, zoom, or trigger browser pull-to-refresh.
- Android Chrome:
  Swipe quickly near the canvas edge and confirm the gesture still changes direction.

### Reflex

- Desktop Chrome:
  Confirm rapid clicks register without text selection or focus glitches.
- iPhone Safari:
  Tap targets repeatedly and confirm no double-tap zoom occurs.

### Memory

- Desktop Chrome:
  Confirm mouse clicks register only after the preview sequence finishes.
- iPhone Safari and Android Chrome:
  Confirm touch taps now register on the colored quadrants and incorrect taps end the run immediately.

### Runner

- Desktop Chrome:
  Verify both `Space` and `ArrowUp` jump.
- iPad or Android tablet:
  Confirm the on-screen `JUMP` control is responsive while the page remains scroll-locked during play.

### Rocket

- Desktop Chrome:
  Move the mouse edge-to-edge and confirm ship steering tracks smoothly.
- iPhone Safari and Android Chrome:
  Drag across the screen and confirm the rocket follows finger movement without noticeable lag.

### Breakout

- Desktop Chrome:
  Move the mouse left and right and confirm paddle tracking stays aligned with the pointer.
- iPhone Safari and Android Chrome:
  Drag across the playfield and confirm paddle movement remains precise near both edges.

## Admin Playground Checks

- Wrong key:
  `/playground` should stay on the login form and show an access error.
- Valid key:
  The dashboard should render totals, top games, top dates, and the score table.
- Delete one row:
  Confirm the entry disappears after refresh.
- Wipe leaderboard:
  Confirm the table becomes empty and the insight cards reset cleanly.

## Build And Schema Checks

- Run `npm run build` to catch route, type, and Next.js integration issues.
- Run `node scripts/update-leaderboard-schema.mjs` with `DATABASE_URL` set when upgrading an older Supabase table that was created before the `game` column existed.
