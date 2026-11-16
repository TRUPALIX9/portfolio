import type { FullConfig } from '@playwright/test';

// The dev server compiles each route on first request. When parallel workers hit several cold routes
// at once, Next 16's dev server can read its build manifests mid-write and fail every page for that run
// ("SyntaxError ... JSON"). Requesting the routes one at a time first means tests only hit warm routes.
const ROUTES = [
  '/',
  '/about',
  '/travel',
  '/certifications',
  '/projects',
  '/projects/retailsync',
  '/experience/allyvia',
  '/social',
  '/social-only',
  '/playground',
  '/this-page-does-not-exist',
  '/api/playground/session',
];

export default async function warmup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) return;
  for (const route of ROUTES) {
    await fetch(new URL(route, baseURL)).catch(() => undefined);
  }
}
