import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Module Apprentissage
 * Couverture: Flashcards, SRS, Quiz, Exam Mode, Clinical Cases
 */

test.describe('Learning Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access flashcards page', async ({ page }) => {
    await page.goto('/flashcards');
    
    await expect(page).toHaveURL(/flashcards/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access SRS review page', async ({ page }) => {
    await page.goto('/srs-review');
    
    await expect(page).toHaveURL(/srs-review/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access exam mode page', async ({ page }) => {
    await page.goto('/exam-mode');
    
    await expect(page).toHaveURL(/exam-mode/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access clinical cases page', async ({ page }) => {
    await page.goto('/clinical-cases');
    
    await expect(page).toHaveURL(/clinical-cases/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access EDN complete library', async ({ page }) => {
    await page.goto('/edn-complete');
    
    await expect(page).toHaveURL(/edn-complete/);
    
    // Check for EDN items or search functionality
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access ECOS scenarios', async ({ page }) => {
    await page.goto('/ecos');
    
    await expect(page).toHaveURL(/ecos/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});
