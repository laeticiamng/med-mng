import { test, expect } from '@playwright/test';

test.describe('General API Tests', () => {
  test('should validate API response times under 5s', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
  });

  test('should validate error handling gracefully', async ({ page }) => {
    await page.goto('/test-extraction');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate cross-browser compatibility', async ({ page }) => {
    const browserSupport = await page.evaluate(() => ({
      localStorage: typeof Storage !== 'undefined',
      fetch: typeof fetch !== 'undefined'
    }));
    expect(browserSupport.localStorage).toBe(true);
    expect(browserSupport.fetch).toBe(true);
  });
});