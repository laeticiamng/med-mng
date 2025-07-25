import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate via bottom nav on mobile', async ({ page }) => {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for page to load
    await expect(page.locator('h1')).toContainText('MED MNG');
    
    // Check that bottom nav is visible on mobile
    const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
    await expect(bottomNav).toBeVisible();
    
    // Test navigation to Library
    await page.click('[aria-label*="Bibliothèque"]');
    await expect(page).toHaveURL(/.*\/med-mng\/library/);
    
    // Test navigation to Create
    await page.click('[aria-label*="Créer"]');
    await expect(page).toHaveURL(/.*\/med-mng\/create/);
    
    // Test navigation to Pricing
    await page.click('[aria-label*="Abonnements"]');
    await expect(page).toHaveURL(/.*\/med-mng\/pricing/);
    
    // Test navigation to Profile
    await page.click('[aria-label*="Profil"]');
    await expect(page).toHaveURL(/.*\/med-mng\/profile/);
    
    // Test navigation back to Home
    await page.click('[aria-label*="Accueil"]');
    await expect(page).toHaveURL('/');
  });

  test('should hide bottom nav on desktop', async ({ page }) => {
    // Resize to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Bottom nav should be hidden on desktop
    const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
    await expect(bottomNav).toBeHidden();
  });

  test('should navigate via main buttons on desktop', async ({ page }) => {
    // Resize to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Test EDN navigation
    await page.click('text=Items EDN');
    await expect(page).toHaveURL(/.*\/edn/);
    
    // Go back to home
    await page.goto('/');
    
    // Test ECOS navigation
    await page.click('text=Simulations ECOS');
    await expect(page).toHaveURL(/.*\/ecos/);
    
    // Go back to home
    await page.goto('/');
    
    // Test Audit navigation
    await page.click('text=Audit EDN');
    await expect(page).toHaveURL(/.*\/audit-general/);
  });
});