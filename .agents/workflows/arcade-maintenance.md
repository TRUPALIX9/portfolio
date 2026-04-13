---
description: Maintainer guide for the arcade system, individual games, leaderboard flow, admin tooling, and player-facing behavior.
---

# Arcade Maintenance Workflow

Use this workflow whenever you touch:

- `src/components/GameHub.tsx`
- `src/components/GamePreview.tsx`
- `src/components/games/*`
- `src/app/game/page.tsx`
- `src/app/playground/page.tsx`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/playground/share-link/route.ts`
- `src/app/arcade/[token]/page.tsx`
- leaderboard scripts or share-token logic

This arcade is part showcase, part engagement tool, and part systems demo. It should feel fun to play, but it also demonstrates frontend polish, mobile behavior, API integration, and product thinking.

## 1. Core Reality

For visitors, the arcade proves three things:

1. The portfolio owner can build interactive interfaces, not just static pages.
2. The site has personality and technical confidence.
3. The portfolio can support a full mini-product loop:
   - browse,
   - interact,
   - submit data,
   - administer results.

For maintainers, the arcade is really four systems:

1. Game selection and presentation.
2. Individual game implementations.
3. Leaderboard data flow.
4. Admin and share surfaces.

Treat each as separate when debugging.

## 2. End-To-End Player Journey

Primary public route:
- `src/app/game/page.tsx`

Player flow:

1. User opens `/game`.
2. `GameHub` renders six selectable game cards and public leaderboard snapshots.
3. User selects a game.
4. Game-specific onboarding overlay explains the rules and controls.
5. User plays.
6. On game over, user must enter a name, save, and optionally replay.
7. Score posts to `/api/leaderboard`.
8. `GameHub` refreshes public leaderboard data.

Admin flow:

1. Admin opens `/playground`.
2. Enters `KEY`.
3. Client fetches `GET /api/leaderboard?admin=1` with `x-admin-key`.
4. Dashboard shows insights, raw scores, delete controls, wipe action, and share link generation.

Shared arcade flow:

1. Admin generates signed link.
2. Visitor opens `/arcade/[token]`.
3. Token is verified server-side.
4. Visitor sees an arcade-only page with nav hidden.

## 3. GameHub As System Integrator

Primary file:
- `src/components/GameHub.tsx`

Responsibilities:
- Defines the canonical game list.
- Maps human-readable game cards to game components.
- Fetches the public leaderboard.
- Computes per-game high scores and hall-of-fame previews.
- Controls stage transitions between selection screen and active game.

Maintenance rules:
- Game IDs here are canonical. They must match the `game` value submitted by each game.
- If a game is renamed visually, preserve or intentionally migrate the saved ID.
- `GamePreview` must reflect the same game identity as the card and the actual component.

High-risk area:
- ID drift between hub IDs and submitted scores causes silent leaderboard corruption.

## 4. Public Leaderboard Flow

Primary file:
- `src/app/api/leaderboard/route.ts`

Current behavior:
- `GET /api/leaderboard` returns public leaderboard rows.
- `GET /api/leaderboard?admin=1` returns rows + insights only when `x-admin-key` is valid.
- `POST /api/leaderboard` inserts a score with `name`, `score`, `game`, `date`.
- `DELETE /api/leaderboard` supports one-row delete or full wipe with admin auth.

Operational reality:
- Public reads should never require admin auth.
- Admin insight reads and deletes must remain protected.
- If Supabase table setup is missing, public GET currently degrades to `[]`.

Maintenance rules:
- Preserve server-side auth checks.
- Never trust the admin key only on the client.
- When changing schema, update both create and patch scripts.

Relevant scripts:
- `scripts/create-leaderboard-table.mjs`
- `scripts/update-leaderboard-schema.mjs`

## 5. Admin Playground

Primary file:
- `src/app/playground/page.tsx`

What it does:
- Authenticates via management key.
- Loads admin leaderboard snapshot and insights.
- Deletes individual rows.
- Wipes all rows.
- Generates signed arcade-only share links.

Customer reality:
- This is an operator tool, not a portfolio marketing page.
- It should favor trust and control over visual experimentation.

Maintenance rules:
- The page should not unlock unless the server confirms the key.
- Delete and wipe actions should stay explicit and confirmed.
- Generated share links should remain signed and tamper-resistant.

## 6. Arcade Share Security

Primary files:
- `src/utils/arcade-share.ts`
- `src/app/api/playground/share-link/route.ts`
- `src/app/arcade/[token]/page.tsx`

Behavior:
- Tokens are signed with `SHARE_LINK_SECRET` or fallback `KEY`.
- Payload currently encodes mode, version, and expiry.
- Invalid or tampered tokens 404 instead of partially rendering.

Maintenance rules:
- Do not replace this with plain query params.
- If expiry or payload shape changes, keep verification backward-compatible if existing links matter.

## 7. Individual Game Reality

### Rocket

Primary file:
- `src/components/games/RocketGame.tsx`

Player promise:
- Dodge falling space debris in a looping space scene.

Input model:
- Desktop: mouse move.
- Mobile: touch drag / swipe movement.

Important behaviors:
- Score increases over time.
- Obstacles accelerate as score rises.
- Name is required before saving/retrying after game over.
- Last saved name is reused from local storage.

Maintenance watchouts:
- Background changes must preserve contrast for rocket and asteroids.
- Pointer mapping must respect canvas scaling on mobile.

### Runner

Primary file:
- `src/components/games/RunnerGame.tsx`

Player promise:
- Endless obstacle jumping with increasing pace.

Input model:
- Desktop: `Space` and `ArrowUp`.
- Mobile: on-screen jump button.

Maintenance watchouts:
- Jump timing is the core feel; physics changes are high impact.
- On-screen jump button should not block score visibility or canvas action on smaller devices.

### Reflex

Primary file:
- `src/components/games/ReflexGame.tsx`

Player promise:
- Rapid target elimination before targets expire.

Input model:
- Desktop: click targets.
- Mobile: tap targets.

Recent maintenance reality:
- This game previously suffered from stale state in the event handler, so clicks/taps could fail even when the game appeared active.
- Current logic uses refs plus explicit cleanup to avoid that failure mode.

Maintenance watchouts:
- If gameplay state is moved back into plain closure state without care, input reliability can regress.
- Hit detection must always use canvas-scaled coordinates.

### Memory

Primary file:
- `src/components/games/MemoryGame.tsx`

Player promise:
- Repeat the flashing pattern correctly.

Input model:
- Desktop: mouse click.
- Mobile: touch tap.

Maintenance watchouts:
- Pattern timing is part of the game difficulty.
- Touch support is essential; this game should never regress to mouse-only.

### Snake

Primary file:
- `src/components/games/SnakeGame.tsx`

Player promise:
- Classic grid survival with readable controls on desktop and mobile.

Input model:
- Desktop: arrow keys and `W/A/S/D`.
- Mobile: swipe or on-screen directional buttons.

Maintenance watchouts:
- Direction queueing is core logic. Avoid allowing 180-degree reversals.
- On-screen mobile controls are not decorative; they are functional input.
- The control legend must remain readable.

### Breakout

Primary file:
- `src/components/games/BreakoutGame.tsx`

Player promise:
- Paddle-and-ball brick breaking with mystery power-ups and level progression.

Input model:
- Desktop: mouse move.
- Mobile: touch drag.

Maintenance watchouts:
- Power-up timing and ball multiplication can create edge cases fast.
- Mobile drag behavior needs enough vertical safe space and should not scroll the page during play.

### Collector

Primary file:
- `src/components/games/CollectorGame.tsx`

Current reality:
- Present in the codebase but not currently wired into the main six-game hub.

Maintenance rule:
- Treat it as dormant inventory unless you intentionally reintroduce it.

## 8. Save Flow Rules

Across the current games:
- Name input is required before save or retry.
- The save button sits beside the name input.
- Local storage should reflect the last successful saved name, not every keystroke.

Why this matters:
- It keeps the UX tighter.
- It avoids storing partial or accidental names.
- It makes repeat play smoother for returning users.

## 9. Mobile Behavior Standards

The arcade must work as a real mobile experience, not just a desktop canvas scaled down.

Minimum expectations:
- Canvases fit within smaller viewports without cropping important gameplay.
- Overlay cards do not overflow vertically on common mobile screens.
- Touch controls are large and readable.
- Touch interactions do not cause accidental page scroll where gameplay depends on them.
- Score badges remain visible and do not conflict with touch buttons.

Primary shared file:
- `src/app/globals.css`

Look for classes such as:
- `.game-console`
- `.game-canvas`
- `.game-canvas-square`
- `.game-canvas-portrait`
- `.game-canvas-wide`
- `.game-overlay`
- `.game-panel`
- `.game-touch-grid`
- `.game-touch-button`

When a mobile bug appears, check shared layout CSS before rewriting an individual game.

## 10. Preview Simulations

Primary file:
- `src/components/GamePreview.tsx`

Role:
- Gives the player a quick emotional hint about each game before selection.

Maintenance rules:
- Preview logic should resemble the actual game enough to be truthful.
- It does not need full gameplay fidelity, but it should match the cabinet’s identity, motion, and palette.

## 11. Customer-Facing Quality Standard

For public users, “working” means:

- The hub loads without broken imports or missing previews.
- Every game explains controls clearly.
- The game responds immediately to expected input.
- Mobile play feels intentionally designed, not tolerated.
- Score save flow is obvious and not frustrating.
- The leaderboard reflects the correct game bucket.

For admins, “working” means:

- The dashboard only unlocks with a valid key.
- Data can be reviewed and curated quickly.
- Share links are easy to generate.
- Tampering with the share URL does not unlock arbitrary access.

## 12. Extension Guide

When adding a new game:

1. Create the game component in `src/components/games`.
2. Add or update its preview in `GamePreview`.
3. Add a canonical ID in `GameHub`.
4. Ensure submitted leaderboard `game` matches the canonical ID.
5. Add desktop and mobile controls with readable onboarding.
6. Verify mobile canvas fit.
7. Update E2E coverage if the flow changes.

## 13. Maintenance Checklist

Before shipping arcade changes:
- Run `npm run build`.
- Open `/game`.
- Launch every cabinet at least once.
- Verify desktop and mobile control copy matches real inputs.
- Verify names must be entered before save/retry.
- Verify one score save path works if Supabase is configured.
- Verify `/playground` admin auth still behaves correctly.
- Verify `/arcade/[token]` still hides nav and validates tokens.

## 14. Golden Rules

- Canonical game IDs must stay aligned across hub, game submitters, previews, and leaderboard.
- Mobile usability is a feature, not a follow-up.
- Public leaderboard and admin controls must remain clearly separated.
- Share links must remain signed and tamper-resistant.
- If a game changes its core feel, its onboarding copy and preview should change too.
