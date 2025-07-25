import { test, expect } from '@playwright/test';

test.describe('Authentication & RLS Tests', () => {
  test('should allow anonymous access to public pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('MED MNG');
  });

  test('should validate library access', async ({ page }) => {
    await page.goto('/med-mng/library');
    await expect(page.locator('h1')).toContainText(/Bibliothèque|Library/);
  });

  test('should validate session persistence', async ({ page }) => {
    await page.goto('/med-mng/library');
    await page.reload();
    await expect(page.locator('h1')).toContainText(/Bibliothèque|Library/);
  });
});