# Manual Quality Assurance & Edge Testing Matrix

While Playwright functionally validates that swipe events simulate safely, there are specific Web Canvas edge cases regarding performance latency and DOM events that should occasionally be tested physically.

## Mobile Profile Verification (Physical Device Check)
1. **Pinch-To-Zoom Lock**
   - **Test:** Rapid double-tap the center of `ReflexGame.tsx` targeting nodes.
   - **Expectation:** The viewport *must not zoom in* nor highlight the canvas in an opaque blue box (iOS Safari).
   - **Status:** Handled via `preventDefault` internally against raw `touchstart`.

2. **Scroll Lock during Gameplay**
   - **Test:** Begin a run on `SnakeGame.tsx`. While actively sliding your finger up to execute the `ArrowUp` movement, continue the finger past the canvas edge.
   - **Expectation:** The entire mobile page must NOT drag upwards or try to invoke a pull-to-refresh on Android Chrome.
   - **Status:** Blocked cleanly by our `touchmove` override logic setting `passive: false`.

3. **Gestures Context Size Verification**
   - **Test:** On extremely compact screens (iPhone SE), swipe right precisely on the corner limits of the `CyberCrawler` boundary window.
   - **Expectation:** Must intercept successfully regardless of absolute X/Y scale thanks to our Delta mathematics offset system.

## Input Switching (Tablet Validation)
- **Test:** On an iPad Pro (containing a cursor and touch screen).
- Navigate WASD through a keyboard, then seamlessly touch-swipe on the next frame. Both controllers natively fire synchronously since the window event hooks do not disable opposite profiles.
