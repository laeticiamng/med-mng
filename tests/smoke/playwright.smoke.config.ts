import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.SMOKE_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/smoke',
  retries: process.env.CI ? 1 : 0,
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-smoke-report', open: 'never' }],
  ],
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL,
    actionTimeout: 10000,
    navigationTimeout: 20000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
