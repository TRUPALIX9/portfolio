import { expect, test, type Page } from '@playwright/test';

// Smoke tests for the current site. Every API call that could write to the real
// MongoDB (analytics, leaderboard POST, contact form) is mocked.

const mockedLeaderboard = [
  { id: 1, name: 'Nova', score: 14, game: 'pattern', date: '2026-04-11T18:15:00.000Z' },
  { id: 2, name: 'Dash', score: 9, game: 'pattern', date: '2026-04-11T19:00:00.000Z' },
  { id: 3, name: 'Blink', score: 5, game: 'pattern', date: '2026-04-12T02:05:00.000Z' },
];

async function mockWriteApis(page: Page) {
  await page.route('**/api/visitor-analytics', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }),
  );
  await page.route('**/api/leaderboard', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockedLeaderboard),
    }),
  );
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

  test('invalid arcade share token returns 404, not 500', async ({ page }) => {
    const response = await page.goto('/arcade/not.a-valid-token');
    expect(response?.status()).toBe(404);
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

test.describe('Memory arcade', () => {
  test('renders the game and the mocked leaderboard', async ({ page }) => {
    await page.goto('/game');
    await expect(page.getByRole('heading', { name: 'Global Rankings' })).toBeVisible();
    const rankings = page.getByRole('list', { name: 'Top 10 scores' });
    await expect(rankings.getByRole('listitem')).toHaveCount(mockedLeaderboard.length);
    await expect(rankings).toContainText('Nova');
    await expect(page.getByRole('button', { name: 'Memory tile 1' })).toBeVisible();
  });
});

test.describe('API guards', () => {
  test('admin leaderboard requires authentication', async ({ request }) => {
    const response = await request.get('/api/leaderboard?admin=1');
    expect(response.status()).toBe(401);
  });

  test('malformed admin cookie is rejected cleanly', async ({ request }) => {
    const response = await request.get('/api/playground/session', {
      headers: { cookie: 'playground_admin=abc.x' },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ authenticated: false });
  });
});
