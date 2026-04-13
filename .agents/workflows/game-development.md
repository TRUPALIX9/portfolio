---
description: Standardized workflow for adding high-fidelity arcade modules to the suite.
---

# High-Fidelity Game Development Workflow

Follow these steps to create a new game module that integrates seamlessly with the Arcade Hub.

## 1. Foundations
- Create a new component in `src/components/games/[GameName].tsx`.
- Use the `onFinished` prop to handle game exits and leaderboard submission.
- Implement a `containerRef` for full-screen support.

## 2. Visual Identity & Contrast
- **Theme Selection**: Choose a distinct palette (e.g., Green for Crawler, Red for Rocket).
- **Legibility**:
    - If using a light background, force text colors to `#000000`.
    - If using a dark background, use `#FFFFFF`.
    - Avoid inheriting global theme colors to prevent invisibility issues.

## 3. Mission Briefing (Onboarding)
- Implement a pre-game overlay with:
    - **Header**: High-weight, skewed title block.
    - **Mission Card**: Premium rounded borders with a subtle background.
    - **Visual Legend**: Use an animated icon or SVG showing control mechanics (e.g., pulsing mouse/touch indicators).
    - **Input Guide**: Clear emojis for ⌨️ (Keyboard) and 👆 (Touch).

## 4. Progressive Difficulty
- Use a `frames` counter to scale:
    - `Spawn Frequency`: Decrease interval as score/time increases.
    - `Movement Speed`: Gradually increase world/entity velocity.
    - `Clamping`: Ensure the game remains beatable at high scores (Fair Play Logic).

## 5. Mobile Optimization
- **Swipe Detection**: Use `touchstart` and `touchend` for directional games.
- **Large Targets**: Use 80px+ touch buttons for tap-heavy mechanics (like Jumping).
- **Control Lock**: Call `e.preventDefault()` on all game-related touch events to prevent page scrolling.

## 6. Simulation (Hub Preview)
- Update `src/components/GamePreview.tsx` to include an automated simulation of the new game.
- Ensure the simulation correctly reflects the game's palette and core movement.

## 7. Integration
- Add the new game type to the `GameType` union in `GameHub.tsx` and `GamePreview.tsx`.
- Update the `GAMES` array in `GameHub.tsx`.