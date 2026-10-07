import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration dédiée aux tests d'accessibilité axe-core
 * (tests/accessibility-axe.spec.ts), utilisée par .github/workflows/accessibility-ci.yml.
 *
 * playwright.config.ts ne convient pas : son testDir (tests/e2e) n'inclut pas ce fichier
 * et il attend un serveur sur le port 5173 alors que Vite écoute sur 8080.
 *
 * Prérequis : build de production déjà fait (npx vite build). Le serveur de prévisualisation
 * sert dist/ sur 127.0.0.1 (vite.config.ts écoute sur « :: », absent de certains runners).
 */
export default defineConfig({
  testDir: './tests',
  testMatch: 'accessibility-axe.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/a11y-results.json' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Thème sombre : l'application suit le thème du système (ThemeProvider defaultTheme="system").
    { name: 'chromium-sombre', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  expect: { timeout: 10000 },
  timeout: 60000,
});
