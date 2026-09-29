import { expect, test, type Page } from '@playwright/test';

// Smoke tests for the current site. Every API call that could write to the real
// MongoDB (analytics, contact form) is mocked.

type CollectedEvent = { type: string; path: string; props?: Record<string, unknown> };

/** Analytics batches the page sent, captured by the mock instead of reaching the database. */
const collected: CollectedEvent[] = [];

async function mockWriteApis(page: Page) {
  collected.length = 0;
  await page.route('**/api/analytics/collect', (route) => {
    const body = route.request().postDataJSON() as { events?: CollectedEvent[] } | null;
    collected.push(...(body?.events ?? []));
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/contact-submissions', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }),
  );
}

test.beforeEach(async ({ page }) => {
  await mockWriteApis(page);
});

test.describe('Public pages', () => {
  test('home renders a single h1 and a skip link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('TRUPAL PATEL');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
  });

  test('projects list links to a detail page and back', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('built');
    await page.getByRole('link', { name: /read more about/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to projects/i })).toHaveAttribute('href', '/projects');
  });

  test('experience detail links back to the home timeline', async ({ page }) => {
    await page.goto('/experience/allyvia');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to timeline/i })).toHaveAttribute('href', '/#experience');
  });

  test('retired game links land on LogicSprint', async ({ page }) => {
    for (const path of ['/game', '/game-only', '/arcade/some-old-token']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/products\/logicsprint$/);
    }
  });
});

test.describe('Contact form', () => {
  test('validates input and shows a success status', async ({ page }) => {
    await page.goto('/#contact');
    const form = page.getByRole('form', { name: 'Send a message' });
    await form.scrollIntoViewIfNeeded();

    await form.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Name must be at least 2 characters.')).toBeVisible();

    // exact: label matching is a case-insensitive substring by default, so 'Message'
    // would also match the form itself (aria-label "Send a message").
    await page.getByLabel('Name', { exact: true }).fill('Test Visitor');
    await page.getByLabel('Contact Info', { exact: true }).fill('visitor@example.com');
    await page.getByLabel('Message', { exact: true }).fill('Hello there, this is a smoke test message.');
    await form.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Message sent successfully' })).toBeVisible();
  });
});

// The tracker only sends in production builds, or in dev with NEXT_PUBLIC_ANALYTICS_DEV=1.
test.describe('Visitor analytics', () => {
  test.skip(process.env.NEXT_PUBLIC_ANALYTICS_DEV !== '1', 'Start the dev server with NEXT_PUBLIC_ANALYTICS_DEV=1 to run');

  test('records page views, outbound clicks and engagement', async ({ page, context, isMobile }) => {
    test.skip(isMobile, 'The navbar profile links are desktop-only');
    await page.goto('/');
    // The home page navbar slides in when the pointer nears the top, like a real visitor reaching for it.
    // Repeat the move until it shows: a move made before the page hydrates isn't seen by the navbar.
    const linkedin = page.getByRole('link', { name: 'LinkedIn profile' });
    await expect(async () => {
      await page.mouse.move(640, 300);
      await page.mouse.move(640, 10);
      await expect(linkedin).toBeInViewport({ timeout: 1000 });
    }).toPass();
    const [popup] = await Promise.all([context.waitForEvent('page'), linkedin.click()]);
    await popup.close();
    // Navigate in-app like a visitor: leaving a page this way sends its engagement through the normal
    // batched request. A full page load would send it as an unload beacon, which interception can miss.
    await page.getByRole('link', { name: 'View All Projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);

    // Events are batched for ~1.5s before sending, so wait for each one to arrive.
    await expect.poll(() => collected.map((e) => e.type)).toEqual(expect.arrayContaining(['page_view', 'outbound_click', 'page_engagement']));
    await expect.poll(() => collected.filter((e) => e.type === 'page_view').map((e) => e.path)).toEqual(expect.arrayContaining(['/', '/projects']));
    const click = collected.find((e) => e.type === 'outbound_click');
    expect(click?.props).toMatchObject({ target: 'linkedin', placement: 'navbar' });
  });
});

test.describe('API guards', () => {
  test('analytics reports and admin actions require authentication', async ({ request }) => {
    expect((await request.get('/api/analytics/report?view=overview')).status()).toBe(401);
    expect((await request.get('/api/analytics/admin')).status()).toBe(401);
    expect((await request.post('/api/analytics/admin', { data: { action: 'reset_all', confirm: 'RESET ANALYTICS' } })).status()).toBe(401);
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
