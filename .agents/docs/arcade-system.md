# Arcade System — Full Documentation

> Last updated: 2026-08-22  
> Scope: `src/components/GameHub.tsx`, `src/components/games/*`, `src/components/GamePreview.tsx`, `src/components/TrackedGameHub.tsx`, `src/app/game/`, `src/app/game-only/`, `src/app/arcade-only/`, `src/app/arcade/[token]/`, `src/app/api/leaderboard/`, `src/utils/arcade-player.ts`, `src/utils/arcade-share.ts`

---

## 1. Architecture Overview

```
Visitor enters /game or /game-only or /arcade/[token]
        │
        ▼
TrackedGameHub.tsx      ← analytics wrapper; fires page_view, game_open, run_complete
        │
        ▼
GameHub.tsx             ← selection screen + active game stage + leaderboard display
   ├── GamePreview.tsx  ← canvas animation previews for each game card
   └── games/
       ├── MemoryGame.tsx
       ├── RocketGame.tsx
       ├── RunnerGame.tsx
       ├── ReflexGame.tsx
       ├── SnakeGame.tsx
       └── BreakoutGame.tsx
        │
        ▼ (on game over)
submitArcadeScore()     ← src/utils/arcade-player.ts
        │
        ▼
POST /api/leaderboard   ← src/app/api/leaderboard/route.ts
        │
        ▼
Supabase `leaderboard` table
```

---

## 2. Entry Points

| Route | File | Navbar | Purpose |
|-------|------|--------|---------|
| `/game` | `src/app/game/page.tsx` | Visible | Main public arcade |
| `/game-only` | `src/app/game-only/page.tsx` | Hidden | Standalone share (no nav) |
| `/arcade-only` | `src/app/arcade-only/page.tsx` | Hidden | Standalone share (analytics source differs) |
| `/arcade/[token]` | `src/app/arcade/[token]/page.tsx` | Hidden | Signed token share link |
| `/playground` | `src/app/playground/page.tsx` | Hidden | Admin dashboard |

---

## 3. Player Journey (End-to-End)

```
1. /game loads → GameHub renders 6 game cards + Hall of Fame leaderboard
2. Player clicks a card → game component mounts with onboarding overlay
3. Player plays → score accumulates via game-internal state
4. Game over → overlay shows score + name input
5. Player enters name → submitArcadeScore(name, score, gameId) called
6. POST /api/leaderboard → Supabase insert → returns updated rankings
7. GameHub refreshes leaderboard → hall of fame updates
8. Player exits → back to selection screen
```

---

## 4. Component Reference

### `GameHub.tsx`

**Role:** System integrator. Owns the game registry, leaderboard fetch, and stage transitions.

| Prop | Type | Purpose |
|------|------|---------|
| `standalone` | `boolean` | Changes heading copy ("Arcade Mode" vs "Interactive Break") |
| `onGameOpen` | `(game) => void` | Called when a game card is selected (analytics hook) |
| `onTrackedFinish` | `({game, score}) => void` | Called when a run completes (analytics hook) |

**Game registry** (canonical IDs — must match `game` field in leaderboard):

| ID | Title | Component | Viewport | Preview Type |
|----|-------|-----------|----------|--------------|
| `rocket` | Rocket | `RocketGame` | portrait | `gravity` |
| `runner` | Runner | `RunnerGame` | landscape | `runner` |
| `shooter` | Reflex | `ReflexGame` | portrait | `shooter` |
| `pattern` | Memory | `MemoryGame` | portrait | `pattern` |
| `snake` | Snake | `SnakeGame` | square | `crawler` |
| `breakout` | Breakout | `BreakoutGame` | portrait | `breakout` |

> ⚠️ **ID drift is a silent bug.** If `GameHub` registers ID `pattern` but `MemoryGame` submits `memory`, scores go into different leaderboard buckets.

---

### `GamePreview.tsx`

**Role:** Animated canvas preview per game card. Runs a lightweight simulation of each game without any game logic.

| Preview type | Visual description |
|---|---|
| `gravity` | Rocket ascending past star field |
| `runner` | Character running toward red wall |
| `shooter` | Grid of targets cycling active cell |
| `pattern` | 3×3 memory tile board cycling glow |
| `crawler` | Snake moving on grid toward food |
| `breakout` | Ball bouncing off bricks + paddle |

---

### `TrackedGameHub.tsx`

**Role:** Thin analytics wrapper around `GameHub`. Fires:
- `page_view` on mount
- `game_open` when a card is selected
- `run_complete` when a game reports a score

Does not change any game logic.

---

### Individual Games

#### `MemoryGame.tsx` (ID: `pattern`)
- **Mechanic:** Simon-style tile sequence recall. 3×3 grid of 9 color-coded tiles.
- **Scoring:** +1 per completed round. Score = number of successful rounds.
- **Difficulty:** Sequence grows by 1 tile per round. Flash interval shrinks as sequence lengthens (`max(260, 500 - length * 16)`ms).
- **State flow:** `WATCH` → `REPEAT` → `LOCKED` (next round) or `BROKEN` (game over).
- **Input:** Click/tap tiles in the flashed order.
- **Save ID submitted:** `'pattern'`

#### `RocketGame.tsx` (ID: `rocket`)
- **Mechanic:** Vertical dodge runner. Rocket moves left/right to avoid falling debris.
- **Scoring:** Time-based; score increases while alive.
- **Input:** Desktop → mouse move. Mobile → touch drag.
- **Save ID submitted:** `'rocket'`

#### `RunnerGame.tsx` (ID: `runner`)
- **Mechanic:** Side-scroll obstacle jump.
- **Scoring:** Distance-based; score increases over time.
- **Input:** Desktop → Space/ArrowUp. Mobile → on-screen jump button.
- **Save ID submitted:** `'runner'`

#### `ReflexGame.tsx` (ID: `shooter`)
- **Mechanic:** Click/tap targets before they expire.
- **Scoring:** Points per hit. Misses or expiry reduce score potential.
- **Input:** Desktop → click. Mobile → tap.
- **Save ID submitted:** `'shooter'`

#### `SnakeGame.tsx` (ID: `snake`)
- **Mechanic:** Classic snake.
- **Scoring:** +1 per food eaten.
- **Input:** Desktop → arrow keys / WASD. Mobile → swipe or on-screen D-pad.
- **Save ID submitted:** `'snake'`

#### `BreakoutGame.tsx` (ID: `breakout`)
- **Mechanic:** Brick-breaking with power-ups and level progression.
- **Scoring:** Points per brick cleared + bonus on level completion.
- **Input:** Desktop → mouse move. Mobile → touch drag.
- **Save ID submitted:** `'breakout'`

#### Dormant (not wired into hub):
- `CollectorGame.tsx` — exists in codebase, not registered
- `CyberCrawler.tsx`, `GravityJump.tsx`, `NeonBreakout.tsx`, `PatternGame.tsx`, `ShooterGame.tsx` — stub files (39–42 bytes, no implementation)

---

## 5. Leaderboard API

**File:** `src/app/api/leaderboard/route.ts`  
**DB:** Supabase table `leaderboard`

### Schema

```sql
CREATE TABLE leaderboard (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  game  TEXT NOT NULL DEFAULT 'unknown',
  date  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Endpoints

| Method | Auth | Body | Returns |
|--------|------|------|---------|
| `GET /api/leaderboard` | None | — | `LeaderboardEntry[]` (top 200, all games) |
| `GET /api/leaderboard?admin=1` | `x-admin-key` header | — | `{ scores, insights }` |
| `POST /api/leaderboard` | None | `{ name, score, game }` | Updated leaderboard for that game |
| `DELETE /api/leaderboard` | `x-admin-key` | `{ id }` or `{ deleteAll: true }` | `{ success }` |
| `PATCH /api/leaderboard` | `x-admin-key` | `{ id?, playerName?, name }` | `{ success }` |

### `submitArcadeScore()` utility
**File:** `src/utils/arcade-player.ts`

```ts
submitArcadeScore(name: string, score: number, game: string)
// → POST /api/leaderboard with { name, score, game }
// → Also saves name to localStorage('arcade-player-name')
```

---

## 6. Admin Playground

**File:** `src/app/playground/page.tsx`

- Requires management key (env: `KEY`)
- Key validated server-side on every admin action
- Features: view insights, delete individual rows, wipe all, generate share links

---

## 7. Arcade Share Security

**Files:** `src/utils/arcade-share.ts`, `src/app/api/playground/share-link/route.ts`, `src/app/arcade/[token]/page.tsx`

- Tokens are HMAC-signed with `SHARE_LINK_SECRET` (falls back to `KEY`)
- Payload: `{ mode, version, expiry }`
- Invalid/tampered/expired tokens → 404, never partial render
- Navbar is always hidden on `/arcade/[token]` routes

---

## 8. CSS Game Classes

Defined in `src/app/globals.css`:

| Class | Purpose |
|-------|---------|
| `.game-console` | Outer game container shell |
| `.game-canvas` | Base canvas sizing |
| `.game-canvas-portrait` | Portrait layout variant |
| `.game-canvas-wide` | Landscape variant |
| `.game-canvas-square` | Square variant |
| `.game-overlay` | Full-panel overlay (start / game over) |
| `.game-panel` | Inner content card inside overlay |
| `.game-start-button` | CTA start button |
| `.game-score-badge` | Score/round indicator badge |
| `.game-touch-grid` | Mobile D-pad button grid |
| `.game-touch-button` | Individual mobile control button |
| `.arcade-grid` | Game card selection grid |
| `.arcade-card` | Individual game card |
| `.arcade-preview` | Preview canvas container |
| `.arcade-leaderboard` | Leaderboard panel |
| `.arcade-kicker` | Section eyebrow label |
| `.arcade-score` | High score numeric display |
| `.hall-of-fame-grid` | 3-column leaderboard grid |

---

## 9. Mobile Standards

- All canvases must fit within viewport without cropping gameplay
- Touch targets ≥ 44px
- No accidental page scroll during active gameplay
- Score badges stay visible, never under touch buttons
- `isTouch` detection via `matchMedia('(pointer: coarse)')` in game components

---

## 10. Golden Rules

1. Canonical game IDs (`rocket`, `runner`, `shooter`, `pattern`, `snake`, `breakout`) must stay aligned across: hub registry → game component submit call → leaderboard filter.
2. Public leaderboard reads need no auth. Admin reads, deletes, patches always require `x-admin-key`.
3. Share tokens are always signed server-side. Never plain query params.
4. Name input is required before any score save or retry.
5. `localStorage('arcade-player-name')` persists between sessions for returning players.
6. Mobile usability is non-optional. Every game must be playable without a mouse.

---

## 11. Migration: Memory-Only Arcade

> See implementation plan below for the specific changes required.

**What's being removed:**
- `RocketGame`, `RunnerGame`, `ReflexGame`, `SnakeGame`, `BreakoutGame` — components and their hub registrations
- `GamePreview` types: `gravity`, `runner`, `shooter`, `crawler`, `breakout`
- Multi-game hub selection screen, 3×3 hall of fame grid

**What stays / changes:**
- `MemoryGame.tsx` — unchanged, game ID remains `'pattern'`
- Leaderboard API — unchanged, `game = 'pattern'` filter used
- `submitArcadeScore` utility — unchanged
- Supabase schema — unchanged
- Admin playground — unchanged
- Share token security — unchanged
- `TrackedGameHub` → replaced by direct `MemoryArcade` wrapper

**New components:**
- `MemoryArcade.tsx` — replaces `GameHub`, renders only Memory + its leaderboard
- Leaderboard panel shows only `game = 'pattern'` entries

**Game ID stays `'pattern'`** — all existing leaderboard entries are preserved.
