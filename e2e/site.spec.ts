import { expect, test, type Page } from '@playwright/test';

// Smoke tests for the current site. Every API call that could write to the real
// MongoDB (analytics, contact form, travel and Binge suggestions) is mocked.

type CollectedEvent = { type: string; path: string; props?: Record<string, unknown> };

/** Analytics batches the page sent, captured by the mock instead of reaching the database. */
const collected: CollectedEvent[] = [];
/** Travel suggestions the form posted, captured by the mock. */
const travelPosts: Record<string, unknown>[] = [];

async function mockWriteApis(page: Page) {
  collected.length = 0;
  travelPosts.length = 0;
  await page.route('**/api/analytics/collect', (route) => {
    const body = route.request().postDataJSON() as { events?: CollectedEvent[] } | null;
    collected.push(...(body?.events ?? []));
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/contact-submissions', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }),
  );
  await page.route('**/api/travel/suggestions', (route) => {
    if (route.request().method() === 'POST') travelPosts.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/travel/wishlist', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'w1', place: 'Kyoto', country: 'Japan', city: 'Kyoto', note: 'Bamboo forest at sunrise', name: 'Sam' }]) }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockWriteApis(page);
});

test.describe('Home datasheet', () => {
  test('renders one h1, a skip link and the hero stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Trupal Patel');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
    await expect(page.locator('.sp-ratings--hero')).toContainText('Live products');
  });

  test('platform folder switches tabs and shows store badges', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: /Android/ }).click();
    await expect(page.getByRole('tabpanel')).toContainText('LogicSprint');
    await expect(page.getByRole('tabpanel').getByRole('link', { name: /Google Play/ }).first()).toHaveAttribute('href', /play\.google\.com/);
    await page.getByRole('tab', { name: /Windows/ }).click();
    await expect(page.getByRole('tabpanel').getByRole('link', { name: /Windows/ })).toHaveAttribute('href', 'https://storedesk.net/download');
  });

  test('system map opens every skill in a layer', async ({ page }) => {
    await page.goto('/#pinout');
    await page.getByRole('button', { name: /^Data:/ }).click();
    const detail = page.locator('#sys-detail');
    await expect(detail).toContainText('PostgreSQL');
    await expect(detail).toContainText('BigQuery');
    await page.getByRole('button', { name: /^AI · ML:/ }).click();
    await expect(detail).toContainText('Gemini');
  });

  test('protocol legend lights up the links that use it', async ({ page }) => {
    await page.goto('/#pinout');
    await page.locator('.sp-sys__protos').getByRole('button', { name: 'RTSP' }).click();
    const detail = page.locator('#sys-detail');
    await expect(detail).toContainText('Streaming live video from IP cameras');
    await expect(detail).toContainText('Edge · Devices');
    await expect(page.getByRole('button', { name: /^DevOps:/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Cloud · Deploy:/ })).toBeVisible();
  });

  test('related documents open About, Binge and Travel', async ({ page }) => {
    await page.goto('/#documents');
    const docs = page.locator('.rd');
    await expect(docs.getByRole('link', { name: /Say hi/ })).toHaveAttribute('href', '/about');
    await expect(docs.getByRole('link', { name: /Open the map/ })).toHaveAttribute('href', '/travel');
    await expect(docs.getByRole('button', { name: /Binge/ })).toBeVisible();
  });
});

test.describe('Public pages', () => {
  test('projects archive opens a case study and back', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('built');
    await page.locator('.pj-read').first().click();
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /all projects/i })).toHaveAttribute('href', '/projects');
  });

  test('experience note links back to revision history', async ({ page }) => {
    await page.goto('/experience/allyvia');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /revision history/i })).toHaveAttribute('href', '/#revisions');
  });

  test('about is personal and points to the travel map', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Trupal');
    await expect(page.locator('.ab-trip')).toHaveAttribute('href', '/travel');
    await expect(page.locator('.sp-sports li')).toHaveCount(8);
  });

  test('certifications lists every credential with a verify link', async ({ page }) => {
    await page.goto('/certifications');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certifications');
    expect(await page.getByRole('link', { name: /verify/i }).count()).toBeGreaterThan(5);
  });

  test('social hub links to every account; social-only hides the site bar', async ({ page }) => {
    await page.goto('/social');
    const cards = page.locator('.so-card');
    await expect(cards.filter({ hasText: 'GitHub' })).toHaveAttribute('href', 'https://github.com/TRUPALIX9');
    await expect(cards.filter({ hasText: 'LinkedIn' })).toHaveAttribute('href', /linkedin\.com\/in\/trupalix/);
    await page.goto('/social-only');
    await expect(page.locator('.sp-bar')).toHaveCount(0);
    await expect(page.locator('.so-card')).toHaveCount(9);
  });

  test('unknown pages show the themed 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('No signal');
  });

  test('retired game links land on LogicSprint', async ({ request }) => {
    for (const path of ['/game', '/game-only', '/arcade/some-old-token']) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers().location).toMatch(/^https:\/\/logicsprint\.trueorfalse\.dev\/?$/);
    }
  });
});

test.describe('Travel', () => {
  test('map, carousel, wishlist and drill-down suggestion', async ({ page }) => {
    await page.goto('/travel');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Collected');
    await expect(page.locator('.tv-slide')).toHaveCount(5);
    await expect(page.getByRole('heading', { name: 'Visitors say go here' })).toBeVisible();

    const form = page.locator('.tv-suggest');
    await form.scrollIntoViewIfNeeded();
    const state = form.getByLabel(/State or province/);
    await expect(state).toBeDisabled();
    await form.getByRole('button', { name: /send suggestion/i }).click();
    await expect(form.getByText('Pick a country first.')).toBeVisible();

    await form.getByLabel(/Country/).fill('India');
    await expect(state).toBeEnabled();
    await state.fill('Gujarat');
    await form.getByLabel(/City/).fill('Ahmedabad');
    await expect(form.locator('.tv-trail')).toContainText('India → Gujarat → Ahmedabad');
    await form.getByRole('button', { name: /send suggestion/i }).click();
    await expect(page.getByText('Pinned it!')).toBeVisible();
    expect(travelPosts[0]).toMatchObject({ kind: 'city', place: 'Ahmedabad', country: 'India', state: 'Gujarat' });
  });

  test('opening a country shows its visited states', async ({ page }) => {
    await page.goto('/travel');
    await page.locator('.tv-slide', { hasText: 'India' }).click();
    await expect(page.locator('.tv-panel h2')).toContainText('India');
    await expect(page.locator('.tv-states', { hasText: 'Been to' }).locator('li')).toHaveCount(16);
    await page.getByRole('button', { name: /all countries/i }).click();
    await expect(page.locator('.tv-panel')).toHaveCount(0);
  });
});

test.describe('Contact form', () => {
  test('validates input and shows a success status', async ({ page }) => {
    await page.goto('/#ordering');
    const form = page.getByRole('form', { name: 'Send a message' });
    await form.scrollIntoViewIfNeeded();

    await form.getByRole('button', { name: /send message/i }).click();
    await expect(form.getByText('At least 2 characters.').first()).toBeVisible();

    await page.getByLabel('Name', { exact: true }).fill('Test Visitor');
    await page.getByLabel('Email or phone', { exact: true }).fill('visitor@example.com');
    await page.getByLabel('Message', { exact: true }).fill('Hello there, this is a smoke test message.');
    await form.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByRole('status').filter({ hasText: /sent/i })).toBeVisible();
  });
});

test.describe('Playground', () => {
  test('shows the locked login card', async ({ page }) => {
    await page.goto('/playground');
    await expect(page.getByTestId('playground-login-form')).toBeVisible();
    await expect(page.getByTestId('playground-key-input')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unlock' })).toBeDisabled();
  });
});

// The tracker only sends in production builds, or in dev with NEXT_PUBLIC_ANALYTICS_DEV=1.
test.describe('Visitor analytics', () => {
  test.skip(process.env.NEXT_PUBLIC_ANALYTICS_DEV !== '1', 'Start the dev server with NEXT_PUBLIC_ANALYTICS_DEV=1 to run');

  test('records page views as visitors move around', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await expect.poll(() => collected.filter((e) => e.type === 'page_view').map((e) => e.path)).toEqual(expect.arrayContaining(['/about']));
  });
});

test.describe('API guards', () => {
  test('analytics reports and admin actions require authentication', async ({ request }) => {
    expect((await request.get('/api/analytics/report?view=overview')).status()).toBe(401);
    expect((await request.get('/api/analytics/admin')).status()).toBe(401);
    expect((await request.post('/api/analytics/admin', { data: { action: 'reset_all', confirm: 'RESET ANALYTICS' } })).status()).toBe(401);
  });

  test('suggestion moderation requires authentication', async ({ request }) => {
    expect((await request.get('/api/travel/suggestions')).status()).toBe(401);
    expect((await request.patch('/api/travel/suggestions', { data: { id: '0'.repeat(24), status: 'approved' } })).status()).toBe(401);
    expect((await request.get('/api/binge/suggestions')).status()).toBe(401);
  });

  test('binge sync and updates need the secret or an admin session', async ({ request }) => {
    expect((await request.post('/api/binge/sync', { data: {} })).status()).toBe(401);
    expect((await request.post('/api/binge/sync', { data: {}, headers: { authorization: 'Bearer wrong-secret-value-123' } })).status()).toBe(401);
    expect((await request.get('/api/binge/updates')).status()).toBe(401);
    expect((await request.patch('/api/binge/updates', { data: { id: '0'.repeat(24), action: 'apply' } })).status()).toBe(401);
  });

  test('travel suggestion needs a place', async ({ request }) => {
    const res = await request.post('/api/travel/suggestions', { data: { place: '' } });
    expect(res.status()).toBe(400);
  });

  test('analytics collect rejects malformed payloads', async ({ request }) => {
    const response = await request.post('/api/analytics/collect', {
      data: { v: { $ne: null }, s: 'x', sent: Date.now(), ctx: {}, events: [] },
    });
    expect(response.status()).toBe(400);
  });

  test('malformed admin cookie is rejected cleanly', async ({ request }) => {
    const response = await request.get('/api/playground/session', {
      headers: { cookie: 'playground_admin=abc.x' },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ authenticated: false });
  });
});

// The playground with a mocked admin session: nothing reaches the real database.
test.describe('Playground · Binge swipe', () => {
  const series = { id: 'a'.repeat(24), kind: 'series', source: 'tvmaze', sourceId: '1', title: 'Test Show', year: 2020, image: null, genres: ['Drama'], shelf: '', status: 'watching', recommended: false, seasons: [1, 2, 3].map((n) => ({ number: n, episodes: 8, seenEpisodes: [], complete: false })), note: '', addedAt: '', updatedAt: '' };
  const film = { ...series, id: 'b'.repeat(24), kind: 'film', source: 'wikidata', title: 'Test Film', status: 'watchlist', seasons: [] };
  let patches: Record<string, unknown>[] = [];

  test.beforeEach(async ({ page }) => {
    patches = [];
    await page.route('**/api/playground/session', (r) => r.fulfill({ json: { authenticated: true } }));
    await page.route('**/api/travel/suggestions', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/binge/suggestions', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/contact-submissions', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/binge/updates*', (r) => r.fulfill({ json: [] }));
    await page.route('**/api/binge', (r) => {
      if (r.request().method() === 'PATCH') { patches.push(r.request().postDataJSON()); return r.fulfill({ json: { ok: true } }); }
      return r.fulfill({ json: [series, film] });
    });
    await page.goto('/playground');
    await page.locator('.pg-side').getByRole('button', { name: 'Binge' }).click();
  });

  test('swipe up marks every season seen, and undo restores it', async ({ page }) => {
    const card = page.locator('.bs-card:not(.bs-card--next)');
    await expect(card).toContainText('Test Show');
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 200, { steps: 8 });
    await page.mouse.up();
    await expect.poll(() => patches.length).toBe(1);
    expect(patches[0]).toMatchObject({ id: series.id, status: 'seen' });
    expect((patches[0].seasons as { complete: boolean }[]).every((s) => s.complete)).toBe(true);
    await expect(card).toContainText('Test Film');
    await page.getByRole('button', { name: /Undo/ }).click();
    await expect.poll(() => patches.length).toBe(2);
    expect(patches[1]).toMatchObject({ id: series.id, status: 'watching' });
  });

  test('right opens the season checklist; films are seen or not seen', async ({ page }) => {
    await page.getByRole('button', { name: /Pick seasons/ }).click();
    const sheet = page.getByRole('dialog', { name: /Seasons of Test Show/ });
    await sheet.getByLabel(/Season 1/).check();
    await sheet.getByLabel(/Season 2/).check();
    await sheet.getByRole('button', { name: /Save 2 seasons/ }).click();
    await expect.poll(() => patches.length).toBe(1);
    expect((patches[0].seasons as { complete: boolean }[]).map((s) => s.complete)).toEqual([true, true, false]);
    await expect(page.locator('.bs-buttons')).toContainText('Not seen');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => patches.length).toBe(2);
    expect(patches[1]).toMatchObject({ id: film.id, status: 'seen' });
  });
});
