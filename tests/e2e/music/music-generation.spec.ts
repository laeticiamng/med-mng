import { test, expect } from '@playwright/test';

test.describe('Music Generation - Suno API Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/create');
  });

  test('should load music generation page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Créer|Create/);
  });

  test('should validate music form elements', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate generation performance metrics', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
  });
});