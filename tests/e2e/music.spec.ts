import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Module Musique
 * Couverture: Génération, bibliothèque, lecteur, karaoké
 */

test.describe('Music Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access music creation page', async ({ page }) => {
    await page.goto('/med-mng/create');
    
    await expect(page).toHaveURL(/create/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access music library', async ({ page }) => {
    await page.goto('/library');
    
    await expect(page).toHaveURL(/library/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access EDN music library', async ({ page }) => {
    await page.goto('/edn-music-library');
    
    await expect(page).toHaveURL(/edn-music-library/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access karaoke page', async ({ page }) => {
    await page.goto('/karaoke');
    
    await expect(page).toHaveURL(/karaoke/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access shared music pages', async ({ page }) => {
    await page.goto('/shared-music');
    
    await expect(page).toHaveURL(/shared-music/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});
