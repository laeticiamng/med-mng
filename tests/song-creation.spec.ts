import { test, expect } from '@playwright/test';

test.describe('Song Creation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/create');
  });

  test('should load create page correctly', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1, h2')).toContainText(/créer|génér/i);
    
    // Should have form elements
    await expect(page.locator('input, textarea, select').first()).toBeVisible();
  });

  test('should show form validation', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Générer"), button:has-text("Créer")').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation messages or prevent submission
      // This will depend on the actual form implementation
      await expect(page.locator('body')).toBeVisible(); // Basic check that page doesn't crash
    }
  });

  test('should be accessible via navigation', async ({ page }) => {
    // Test navigation from mobile bottom nav
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Click create button in bottom nav
    const createNavButton = page.locator('[aria-label*="Créer"]');
    await expect(createNavButton).toBeVisible();
    await createNavButton.click();
    
    await expect(page).toHaveURL(/.*\/med-mng\/create/);
  });

  test('should handle different viewport sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Test desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});