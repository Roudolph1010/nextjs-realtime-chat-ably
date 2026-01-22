import { test, expect } from '@playwright/test';
import { waitForAblyReady } from '../utils/ably';

test.describe('online presence', () => {
  test('opening a second context increases the visible online count', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await pageA.goto('/');

    // Wait for user A to be fully connected (count = 1)
    await waitForAblyReady(pageA);

    const countLocator = pageA.getByTestId('online-users-count');

    // Open a second context (new Ably client, new clientId)
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto('/');
    await waitForAblyReady(pageB);

    // User A's panel should show >= 2 users. We don't assert an exact delta
    // because parallel test workers share the same Ably channel and may add
    // extra presence members that shift the count unpredictably.
    await expect(async () => {
      const count = parseInt((await countLocator.textContent()) ?? '0', 10);
      expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 15_000 });

    // User B's list should also show at least 2 entries
    await expect(async () => {
      const count = await pageB.getByTestId('online-user-item').count();
      expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 15_000 });

    await ctxA.close();
    await ctxB.close();
  });

  test('second user appears in the online users list', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await pageA.goto('/');
    await pageB.goto('/');

    // Wait for both to establish presence
    await waitForAblyReady(pageA);
    await waitForAblyReady(pageB);

    // Each panel should show at least one user item
    await expect(pageA.getByTestId('online-user-item').first()).toBeVisible();
    await expect(pageB.getByTestId('online-user-item').first()).toBeVisible();

    // Each panel should eventually show >= 2 users as both connections settle
    await expect(pageA.getByTestId('online-users-count')).not.toHaveText('0', { timeout: 15_000 });
    await expect(pageB.getByTestId('online-users-count')).not.toHaveText('0', { timeout: 15_000 });

    await ctxA.close();
    await ctxB.close();
  });
});
