# Testing

Three layers of verification:

- **Static checks** — `npm run typecheck` and `npm run lint` (ESLint 9 flat config in `eslint.config.mjs`).
- **Build** — `npm run build` catches route, type, and Next.js integration issues.
- **End-to-end smoke tests** — `npm run test:e2e` (Playwright).

## Automated coverage (`e2e/site.spec.ts`)

Every API call that could write to the real MongoDB (analytics collect, contact form) is
mocked with `page.route`, so the suite is safe to run against a dev server connected to production data.

- **Public pages**
  - Home renders exactly one `h1` and a "Skip to content" link.
  - `/projects` links to a case study, which has an `h1` and a working "Back to Projects" link.
  - `/experience/[slug]` links back to the home timeline (`/#experience`).
  - The retired `/game`, `/game-only` and `/arcade/<token>` links redirect to `/products/logicsprint`.
- **Contact form** — shows validation errors, then a success status after a valid (mocked) submit.
- **Visitor analytics** — page views for each route, an outbound LinkedIn click tagged `navbar`, and page
  engagement are sent to `/api/analytics/collect`. Runs only when the server was started with
  `NEXT_PUBLIC_ANALYTICS_DEV=1` (otherwise the tracker is off in dev and the test is skipped).
- **API guards** — analytics reports and admin actions require auth (401); `collect` rejects malformed
  payloads (400); a malformed admin cookie is rejected cleanly.

### Running

```bash
npx playwright install chromium   # first run only
NEXT_PUBLIC_ANALYTICS_DEV=1 npm run test:e2e -- --project="Desktop Chrome" --project="Mobile Chrome"
```

- Playwright starts its own dev server on **port 3100** (or reuses one already running there), so it never
  tests a different app that happens to be on port 3000. `E2E_BASE_URL` points it at another URL, and the
  server it starts listens on that URL's port.
- With `NEXT_PUBLIC_ANALYTICS_DEV=1` the tracker is on and the analytics test runs; without it that test
  skips. Collect requests are mocked either way, so nothing is written to any database.
- `e2e/warmup.ts` requests each route once, in order, before the tests start. Without it, parallel workers
  hitting cold routes can trip a Next 16 dev-server race (`SyntaxError ... JSON`) that fails the whole run.
- The config also defines a **Mobile Safari** project; it needs WebKit (`npx playwright install webkit`).
- On Node 26, `playwright install` freezes at "100%" (its unzip step fails). Run it under Node 22 instead:
  `npx -y -p node@22 node node_modules/playwright/cli.js install chromium`.

## Manual device checks

### Hero (`/`)

- At 320, 375, 390 and 430px wide, the drifting "SO" and "ARE" words stay inside the screen for the whole
  scroll animation (the drift distance scales with width on phones, see `HeroSection.tsx`).

### Visual / accessibility

- Every text element should meet WCAG AA contrast (4.5:1, or 3:1 for large text). Use the design tokens
  in `src/app/globals.css` (`text-ink-1/2/3`, `bg-surface-1/2/3`, `border-line-1/2`) rather than ad-hoc greys.
- No text smaller than 12px on public pages (11px minimum for dense admin labels).
- No page should scroll horizontally at 375px wide.

## Admin playground checks (`/playground`)

- Wrong key: stays on the login form and shows an access error.
- Valid key: the Overview tab loads KPIs with change vs. the prior period, the visits chart, audience and data quality.
- Every tab loads for each date range; "Include me & bots" changes the numbers when owner/bot traffic exists.
- After signing in, browsing the site in the same browser is tagged as yours (Live tab shows a YOU badge).
- Visitors: a row opens the profile; label, "This is me", "Mark as bot", "Block IP" and "Delete visitor" work
  and the destructive ones ask first.
- Data: the reset needs the typed phrase plus a confirm dialog.
- Lock: returns to the login form and clears the admin cookie (the owner cookie stays).
