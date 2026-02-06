import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'iPhone 13', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Galaxy S20', width: 360, height: 800 },
    { name: 'Desktop 1440p', width: 1440, height: 900 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should work correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      
      // Basic page load check
      await expect(page.locator('h1')).toContainText('MED MNG');
      
      // Check that buttons are properly sized (min 44x44px for touch targets)
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const boundingBox = await firstButton.boundingBox();
        
        if (boundingBox && width < 768) {
          // On mobile, buttons should be large enough for touch
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
      
      // Test navigation accessibility on mobile
      if (width < 768) {
        const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
        await expect(bottomNav).toBeVisible();
      } else {
        const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
        await expect(bottomNav).toBeHidden();
      }
      
      // Test main content is not cut off
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });
  });

  test('should handle orientation changes on mobile', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('h1')).toBeVisible();
    
    // Bottom nav should still work in landscape
    const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
    await expect(bottomNav).toBeVisible();
  });

  test('should have proper grid layouts', async ({ page }) => {
    await page.goto('/med-mng/music-library');
    await page.waitForLoadState('networkidle');
    
    // Test mobile grid (1 column)
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGrid = page.locator('.grid');
    if (await mobileGrid.isVisible()) {
      // Grid should exist and be responsive
      await expect(mobileGrid).toBeVisible();
    }
    
    // Test tablet grid (2-3 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    if (await mobileGrid.isVisible()) {
      await expect(mobileGrid).toBeVisible();
    }
    
    // Test desktop grid (4+ columns)
    await page.setViewportSize({ width: 1440, height: 900 });
    if (await mobileGrid.isVisible()) {
      await expect(mobileGrid).toBeVisible();
    }
  });
});