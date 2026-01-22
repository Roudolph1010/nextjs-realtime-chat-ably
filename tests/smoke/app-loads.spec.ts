import { test, expect } from '@playwright/test';

/**
 * Smoke test: verifies the app renders its core UI elements.
 * If this fails, nothing else is worth running.
 */
test('app loads and shows chat UI', async ({ page }) => {
  await page.goto('/');

  // The chat component is loaded dynamically (ssr:false) so wait for it
  await expect(page.getByTestId('chat-root')).toBeVisible();
  await expect(page.getByTestId('message-input')).toBeVisible();
  await expect(page.getByTestId('send-button')).toBeVisible();
  await expect(page.getByTestId('online-users')).toBeVisible();
});
