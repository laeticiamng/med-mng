import { test, expect } from '@playwright/test';

test.describe('Edge Functions - Extraction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-extraction');
  });

  test('should load extraction test page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Test d\'Extraction UNESS');
  });

  test('should validate IC-1 extraction functionality', async ({ page }) => {
    await expect(page.locator('[data-testid="extraction-form"]')).toBeVisible();
  });

  test('should handle extraction performance under 10s', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10000);
  });
});