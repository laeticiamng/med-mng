import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

/**
 * Suite E2E de PRODUCTION Med MNG (non destructive, idempotente) — voir e2e-prod/README.md.
 *   npx playwright test -c e2e-prod/playwright.config.ts
 * Cible : E2E_BASE_URL (défaut https://medmng.com). Aucun serveur local n'est démarré.
 */
export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  retries: Number(process.env.E2E_RETRIES ?? 0),
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  // Captures d'échec hors du dépôt ; aucune trace (elle contiendrait les jetons de session).
  outputDir: process.env.E2E_OUTPUT_DIR ? path.join(process.env.E2E_OUTPUT_DIR, 'resultats') : path.join(os.tmpdir(), 'medmng-e2e-prod'),
  globalTeardown: './global-teardown.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://medmng.com',
    locale: 'fr-FR',
    trace: 'off',
    screenshot: 'only-on-failure',
    navigationTimeout: 45_000,
    launchOptions: process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : undefined,
  },
  projects: [
    // Connexion par le formulaire des comptes de test ; sessions gardées hors du dépôt.
    { name: 'connexion', testMatch: /connexion\.setup\.ts$/, teardown: 'deconnexion', use: { ...devices['Desktop Chrome'] } },
    { name: 'prod', testMatch: /\.spec\.ts$/, dependencies: ['connexion'], use: { ...devices['Desktop Chrome'] } },
    // En dernier : la déconnexion ferme toutes les sessions du compte gratuit.
    { name: 'deconnexion', testMatch: /deconnexion\.teardown\.ts$/, use: { ...devices['Desktop Chrome'] } },
  ],
});
