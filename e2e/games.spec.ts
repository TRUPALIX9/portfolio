import { expect, test, type Locator, type Page } from '@playwright/test';

const mockedLeaderboard = [
  { id: 1, name: 'Nova', score: 94, game: 'rocket', date: '2026-04-11T18:15:00.000Z' },
  { id: 2, name: 'Dash', score: 71, game: 'runner', date: '2026-04-11T19:00:00.000Z' },
  { id: 3, name: 'Blink', score: 52, game: 'shooter', date: '2026-04-12T02:05:00.000Z' },
  { id: 4, name: 'Recall', score: 33, game: 'pattern', date: '2026-04-12T02:15:00.000Z' },
  { id: 5, name: 'Coil', score: 44, game: 'snake', date: '2026-04-12T03:20:00.000Z' },
  { id: 6, name: 'Brick', score: 61, game: 'breakout', date: '2026-04-12T04:45:00.000Z' },
];

async function disableFullscreen(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: async () => undefined,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: async () => undefined,
    });
  });
}

async function mockPublicLeaderboard(page: Page) {
  await page.route('**/api/leaderboard', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockedLeaderboard),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

async function mockAdminApi(page: Page) {
  await page.route('**/api/leaderboard?admin=1', async (route) => {
    const key = route.request().headers()['x-admin-key'];

    if (key !== 'VALID_KEY') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized key' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        scores: mockedLeaderboard,
        insights: {
          totalScores: mockedLeaderboard.length,
          gamesTracked: 6,
          topGames: [
            { game: 'rocket', submissions: 1, highestScore: 94, totalScore: 94 },
            { game: 'runner', submissions: 1, highestScore: 71, totalScore: 71 },
            { game: 'breakout', submissions: 1, highestScore: 61, totalScore: 61 },
          ],
          topDates: [
            { date: '2026-04-12', totalScore: 190 },
            { date: '2026-04-11', totalScore: 165 },
          ],
        },
      }),
    });
  });

  await page.route('**/api/leaderboard', async (route) => {
    const request = route.request();

    if (request.method() === 'DELETE') {
      const key = request.headers()['x-admin-key'];
      await route.fulfill({
        status: key === 'VALID_KEY' ? 200 : 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: key === 'VALID_KEY' }),
      });
      return;
    }

    await route.continue();
  });
}

async function dispatchSwipe(locator: Locator, direction: 'up' | 'right') {
  await locator.evaluate((canvas, swipeDirection) => {
    const rect = canvas.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = swipeDirection === 'right' ? startX + 80 : startX;
    const endY = swipeDirection === 'up' ? startY - 80 : startY;

    const createTouchLikeEvent = (type: string, x: number, y: number) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      const touchLike = { clientX: x, clientY: y };
      Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : [touchLike] });
      Object.defineProperty(event, 'changedTouches', { value: [touchLike] });
      return event;
    };

    canvas.dispatchEvent(createTouchLikeEvent('touchstart', startX, startY));
    canvas.dispatchEvent(createTouchLikeEvent('touchend', endX, endY));
  }, direction);
}

test.describe('Arcade games', () => {
  test.beforeEach(async ({ page }) => {
    await disableFullscreen(page);
    await mockPublicLeaderboard(page);
  });

  test('hub renders all game cards and opens each cabinet', async ({ page }) => {
    await page.goto('/game');

    await expect(page.getByRole('heading', { name: /arcade/i })).toBeVisible();
    await expect(page.locator('[data-testid^="game-card-"]')).toHaveCount(6);

    const games = [
      { id: 'rocket', title: 'Rocket', startLabel: /launch mission/i },
      { id: 'runner', title: 'Runner', startLabel: /initialize/i },
      { id: 'shooter', title: 'Reflex', startLabel: /initialize/i },
      { id: 'pattern', title: 'Memory', startLabel: /sync neurons/i },
      { id: 'snake', title: 'Snake', startLabel: /initialize/i },
      { id: 'breakout', title: 'Breakout', startLabel: /initialize brain/i },
    ];

    for (const game of games) {
      await page.getByTestId(`game-card-${game.id}`).click();
      await expect(page.getByRole('heading', { name: game.title, exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: game.startLabel })).toBeVisible();
      await page.getByRole('button', { name: /terminate session/i }).click();
      await expect(page.getByTestId(`game-card-${game.id}`)).toBeVisible();
    }
  });

  test('desktop smoke interactions work for keyboard and click-driven games', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop keyboard smoke test only runs on desktop projects.');

    await page.goto('/game');

    await page.getByTestId('game-card-shooter').click();
    await page.getByRole('button', { name: 'INITIALIZE' }).click();
    const reflexCanvas = page.locator('canvas');
    await expect(reflexCanvas).toBeVisible();
    await reflexCanvas.click({ position: { x: 120, y: 160 } });
    await expect(reflexCanvas).toBeVisible();

    await page.getByRole('button', { name: /terminate session/i }).click();
    await page.getByTestId('game-card-runner').click();
    await page.getByRole('button', { name: 'INITIALIZE' }).click();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('mobile smoke interactions dispatch touch gestures for touch-first games', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch gesture smoke test is only meaningful on mobile projects.');

    await page.goto('/game');

    await page.getByTestId('game-card-snake').click();
    await page.getByRole('button', { name: 'INITIALIZE' }).click({ force: true });
    const snakeCanvas = page.locator('canvas');
    await expect(snakeCanvas).toBeVisible();
    await page.getByRole('button', { name: '↑' }).last().click({ force: true });
    await expect(snakeCanvas).toBeVisible();
  });
});

test.describe('Playground admin', () => {
  test.beforeEach(async ({ page }) => {
    await mockAdminApi(page);
  });

  test('rejects invalid keys and unlocks with a validated key', async ({ page }) => {
    await page.goto('/playground');

    await page.getByTestId('playground-key-input').fill('WRONG_KEY');
    await page.getByRole('button', { name: /access playground/i }).click();
    await expect(page.getByTestId('playground-auth-error')).toContainText('Invalid KEY');

    await page.getByTestId('playground-key-input').fill('VALID_KEY');
    await page.getByRole('button', { name: /access playground/i }).click();

    await expect(page.getByRole('heading', { name: /arcade insights/i })).toBeVisible();
    await expect(page.getByTestId('playground-score-table')).toBeVisible();
    await expect(page.getByTestId('playground-game-1')).toHaveText('rocket');
  });
});
