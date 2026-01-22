import { test, expect } from '@playwright/test';
import { uniqueMessage } from '../utils/messages';
import { waitForAblyReady } from '../utils/ably';

test.describe('single-user messaging', () => {
  test('sends a message and it appears in the list', async ({ page }) => {
    await page.goto('/');
    await waitForAblyReady(page);

    const input = page.getByTestId('message-input');
    const msg = uniqueMessage('single');
    await input.fill(msg);
    await page.getByTestId('send-button').click();

    await expect(page.getByTestId('message-list')).toContainText(msg);
    await expect(input).toHaveValue('');
  });

  test('Enter key sends message and clears input', async ({ page }) => {
    await page.goto('/');
    await waitForAblyReady(page);

    const input = page.getByTestId('message-input');
    const msg = uniqueMessage('enter-key');
    await input.fill(msg);
    await input.press('Enter');

    await expect(page.getByTestId('message-list')).toContainText(msg);
    await expect(input).toHaveValue('');
  });

  test('Shift+Enter does not submit — adds a newline instead', async ({ page }) => {
    await page.goto('/');
    // No need to wait for Ably here — this test never sends, only checks local state

    const input = page.getByTestId('message-input');
    await expect(input).toBeVisible();

    await input.fill('line one');
    await input.press('Shift+Enter');

    // Input should still hold text (not cleared) — message was not sent
    const value = await input.inputValue();
    expect(value).toContain('line one');

    // No message item should exist
    await expect(page.getByTestId('message-list')).not.toContainText('line one');
  });
});

test.describe('two-user realtime delivery', () => {
  test('message sent by user A is received by user B', async ({ browser }) => {
    // Two isolated browser contexts = two independent Ably clients / clientIds
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await pageA.goto('/');
    await pageB.goto('/');

    // Wait for both to be fully connected before sending
    await waitForAblyReady(pageA);
    await waitForAblyReady(pageB);

    const msg = uniqueMessage('two-user');

    // User A sends
    const inputA = pageA.getByTestId('message-input');
    await inputA.fill(msg);
    await pageA.getByTestId('send-button').click();

    // User A sees their own message
    await expect(pageA.getByTestId('message-list')).toContainText(msg);

    // User B receives it via Ably pub/sub
    await expect(pageB.getByTestId('message-list')).toContainText(msg);

    await ctxA.close();
    await ctxB.close();
  });
});
