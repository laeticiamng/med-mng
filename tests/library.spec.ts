import { test, expect } from '@playwright/test';

test.describe('Library Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to library page
    await page.goto('/med-mng/music-library');
  });

  test('should display library page correctly', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('bibliothèque');
    
    // Check that create button is visible
    await expect(page.locator('text=Créer une chanson')).toBeVisible();
  });

  test('should show skeleton loader while loading', async ({ page }) => {
    // Reload to see skeleton
    await page.reload();
    
    // Skeleton should be visible briefly
    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible();
  });

  test('should display search functionality', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Search input should be visible
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchInput).toBeVisible();
    
    // Search should be functional
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });

  test('should be responsive on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Pricing button should be visible on desktop
    await expect(page.locator('text=Voir les abonnements')).toBeVisible();
  });

  test('should handle empty library state', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // If library is empty, should show empty state
    const emptyState = page.locator('text=Bibliothèque vide');
    const createButton = page.locator('text=Créer ma première chanson');
    
    // Check if empty state exists, if so verify create button
    if (await emptyState.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });
});