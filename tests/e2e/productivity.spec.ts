import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Module Productivité & Bien-être
 * Couverture: Pomodoro, Mood tracker, Study planner, Goals
 */

test.describe('Productivity & Wellbeing Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access pomodoro timer', async ({ page }) => {
    await page.goto('/pomodoro');
    
    await expect(page).toHaveURL(/pomodoro/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access mood tracker', async ({ page }) => {
    await page.goto('/mood-tracker');
    
    await expect(page).toHaveURL(/mood-tracker/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access smart study planner', async ({ page }) => {
    await page.goto('/smart-study-planner');
    
    await expect(page).toHaveURL(/smart-study-planner/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access study planner', async ({ page }) => {
    await page.goto('/study-planner');
    
    await expect(page).toHaveURL(/study-planner/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should access goals page', async ({ page }) => {
    await page.goto('/my-goals');
    
    await expect(page).toHaveURL(/my-goals/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});
