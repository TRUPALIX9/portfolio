import { defineConfig, devices } from '@playwright/test';

// Tests run against their own dev server on port 3100 (so they never hit another app on 3000).
// E2E_BASE_URL points them elsewhere; the server started below always listens on that URL's port.
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3100';
const port = new URL(baseURL).port || '80';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/warmup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    // Starts on exactly the port being tested (plain `npm run dev` hops to 3001 when 3000 is taken, and
    // Playwright would wait on the wrong port). The server inherits env, so NEXT_PUBLIC_ANALYTICS_DEV=1 reaches it.
    command: `npx next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
