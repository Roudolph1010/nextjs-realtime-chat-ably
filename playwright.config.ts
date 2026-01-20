import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Next.js + Ably realtime chat app.
 * Runs against a locally started dev server so tests exercise real Ably
 * connectivity — no mocking of the realtime layer.
 *
 * Requires ABLY_API_KEY to be present in .env (same as the app itself).
 */
export default defineConfig({
  testDir: './tests',

  // Global timeout per test (realtime events need a little breathing room)
  timeout: 30_000,

  // Retry once in CI to absorb transient Ably connection flakiness
  retries: process.env.CI ? 1 : 0,

  // Parallel workers — keep low to avoid hammering the Ably free-tier channel limit
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Next.js dev server automatically before the test run.
  // The server is shared across all workers; Playwright waits until it responds.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
