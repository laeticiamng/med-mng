import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Module Gamification
 * Couverture: XP, badges, streaks, défis, leaderboard
 */

test.describe('Gamification Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display gamification stats on dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Check for gamification elements
    const xpElement = page.locator('[data-testid="xp-display"], text=/XP|points/i').first();
    await expect(xpElement).toBeVisible({ timeout: 10000 });
  });

  test('should access leaderboard page', async ({ page }) => {
    await page.goto('/leaderboard');
    
    // Check page loaded
    await expect(page).toHaveURL(/leaderboard/);
    
    // Check for leaderboard elements
    const leaderboardTitle = page.locator('h1, h2').filter({ hasText: /classement|leaderboard/i }).first();
    await expect(leaderboardTitle).toBeVisible({ timeout: 10000 });
  });

  test('should access daily challenges page', async ({ page }) => {
    await page.goto('/daily-challenges');
    
    // Check page loaded
    await expect(page).toHaveURL(/daily-challenges/);
    
    // Check for challenge elements
    const challengeTitle = page.locator('h1, h2').filter({ hasText: /défi|challenge/i }).first();
    await expect(challengeTitle).toBeVisible({ timeout: 10000 });
  });

  test('should access achievements page', async ({ page }) => {
    await page.goto('/achievements');
    
    // Check page loaded
    await expect(page).toHaveURL(/achievements/);
    
    // Check for badge elements
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should display progress dashboard with stats', async ({ page }) => {
    await page.goto('/progress-dashboard');
    
    // Check page loaded
    await expect(page).toHaveURL(/progress/);
    
    // Check for progress elements (heatmap, charts, etc.)
    const progressContent = page.locator('main, [role="main"]').first();
    await expect(progressContent).toBeVisible({ timeout: 10000 });
  });
});
