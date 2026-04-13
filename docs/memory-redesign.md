# Memory Redesign

## Core Goal
Rebuild the Memory cabinet as a cleaner, portfolio-grade game that is easy to understand in under 3 seconds on both desktop and mobile.

## Rules
- The board uses `6` tiles in a `2 x 3` portrait layout.
- The game shows a sequence by lighting tiles one at a time.
- The player must repeat the full sequence in the same order.
- Each cleared round adds one new tile to the chain.
- The run ends on a wrong tile or when the countdown reaches `0`.
- Score increases by `25` for every cleared round.

## Player Flow
1. Open the cabinet.
2. Read a short mission and see a small wireframe preview.
3. Press `START MEMORY RUN`.
4. Watch the tile pattern.
5. Repeat the sequence.
6. Survive as many rounds as possible before time expires or the chain breaks.
7. Save the score or restart.

## Wireframe
```text
+----------------------------------+
| SCORE | ROUND | TIME             |
| PHASE CHIP       STATUS CHIP     |
|                                  |
|   [ TILE ]     [ TILE ]          |
|                                  |
|   [ TILE ]     [ TILE ]          |
|                                  |
|   [ TILE ]     [ TILE ]          |
|                                  |
| PROGRESS: 2 / 4                  |
| WATCH / REPEAT MESSAGE           |
+----------------------------------+
```

## Visual Direction
- Dark atmospheric cabinet shell.
- Cyan / magenta / amber signal accents.
- Spacious tiles with strong depth and a bright active pulse.
- No planets, no labeled pads, no noisy canvas decorations.
- Clean HUD that always fits inside a phone viewport.

## Interaction States
- `READY`: intro state before the run starts.
- `WATCH`: sequence presentation; input disabled.
- `REPEAT`: player input state.
- `LOCKED`: round complete.
- `BROKEN`: wrong tile pressed.
- `TIMEOUT`: countdown ended.

## Mobile Priorities
- Keep the full cabinet visible without clipping.
- Avoid tiny corner HUD text.
- Use large, obvious tap targets.
- Preserve portrait orientation with balanced spacing.
