import { test, expect } from '@playwright/test';

/**
 * Tests E2E - anciennes pages IA retirées.
 * MedChat (/chat) et SmartStudyPlanner (/smart-study-planner) ont été supprimées
 * (pages non routées, 07.10.2026) : leurs URL redirigent vers les items EDN (App.tsx).
 */
test.describe('Pages IA retirées', () => {
  for (const url of ['/chat', '/smart-study-planner']) {
    test(`${url} redirige vers /edn-complete`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveURL(/\/edn-complete$/);
    });
  }
});
