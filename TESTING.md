# Testing

Three layers of verification:

- **Static checks** — `npm run typecheck` and `npm run lint` (ESLint 9 flat config in `eslint.config.mjs`).
- **Build** — `npm run build` catches route, type, and Next.js integration issues.
- **End-to-end smoke tests** — `npm run test:e2e` (Playwright).

## Automated coverage (`e2e/games.spec.ts`)

Every API call that could write to the real MongoDB (analytics, leaderboard POST, contact form) is
mocked with `page.route`, so the suite is safe to run against a dev server connected to production data.

- **Public pages**
  - Home renders exactly one `h1` and a "Skip to content" link.
  - `/projects` links to a case study, which has an `h1` and a working "Back to Projects" link.
  - `/experience/[slug]` links back to the home timeline (`/#experience`).
  - A tampered `/arcade/<token>` returns 404 (not 500).
- **Contact form** — shows validation errors, then a success status after a valid (mocked) submit.
- **Memory arcade** — renders the board and the mocked "Global Rankings" leaderboard.
- **API guards** — `/api/leaderboard?admin=1` requires auth (401); a malformed admin cookie is rejected cleanly.

### Running

```bash
npx playwright install chromium   # first run only
npm run test:e2e -- --project="Desktop Chrome" --project="Mobile Chrome"
```

The config also defines a **Mobile Safari** project; it needs WebKit (`npx playwright install webkit`).
`webServer` reuses a dev server already running on port 3000.

## Manual device checks

### Memory game (`/game`)

- Desktop Chrome: tiles only accept clicks after the preview sequence finishes; keyboard focus rings are visible on tiles.
- iPhone Safari / Android Chrome: taps register on tiles without double-tap zoom; a wrong tap ends the run immediately.
- A failed score save shows an inline error and offers "Play Without Saving" instead of getting stuck.
- With the OS "reduce motion" setting on, the shake and entrance animations are skipped.

### Visual / accessibility

- Every text element should meet WCAG AA contrast (4.5:1, or 3:1 for large text). Use the design tokens
  in `src/app/globals.css` (`text-ink-1/2/3`, `bg-surface-1/2/3`, `border-line-1/2`) rather than ad-hoc greys.
- No text smaller than 12px on public pages (11px minimum for dense admin labels).
- No page should scroll horizontally at 375px wide.

## Admin playground checks (`/playground`)

- Wrong key: stays on the login form and shows an access error.
- Valid key: dashboard renders stat cards, the score table, player groups, the contact inbox, and the visitor explorer.
- Delete one score: the entry disappears after refresh.
- Reset all scores: requires the typed confirmation phrase plus a confirm dialog; the table empties cleanly.
- Delete by IP (visitor explorer): asks for confirmation and removes that IP's devices and sessions.
- Lock Terminal: returns to the login form and clears the admin cookie.
