import { type Page, expect } from '@playwright/test';

/**
 * Wait until this page's Ably connection is fully established.
 *
 * The reliable signal is: the user sees themselves in the online users list
 * (presence count >= 1). This means the Ably Realtime connection is up,
 * the chat room is attached, and useMessages/send are ready to use.
 *
 * Without this guard, tests that send immediately after page load race
 * against the async Ably handshake and fail intermittently.
 */
export async function waitForAblyReady(page: Page): Promise<void> {
  await expect(page.getByTestId('online-users-count')).not.toHaveText('0', {
    timeout: 20_000,
  });
}
