import { test, expect } from '@playwright/test';

test.describe('Exam Mode Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exam-mode');
  });

  test('should display exam mode page with proper structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText(/entraîner|examen/i);
  });

  test('should show exam mode selection cards', async ({ page }) => {
    // Check for AI mode and Standard mode cards
    const modeCards = page.locator('[class*="Card"]');
    await expect(modeCards.first()).toBeVisible();
  });

  test('should display Mode IA option', async ({ page }) => {
    const aiModeCard = page.locator('text=Mode IA');
    await expect(aiModeCard).toBeVisible();
  });

  test('should display Mode Standard option', async ({ page }) => {
    const standardModeCard = page.locator('text=Mode Standard');
    await expect(standardModeCard).toBeVisible();
  });

  test('should show difficulty selector for AI mode', async ({ page }) => {
    // Click on AI mode card
    await page.click('text=Mode IA');
    
    // Difficulty selector should appear
    const difficultySelect = page.locator('text=/difficulté|facile|moyen|difficile/i');
    await expect(difficultySelect.first()).toBeVisible();
  });

  test('should show specialty selector for AI mode', async ({ page }) => {
    await page.click('text=Mode IA');
    
    // Specialty selector should be visible
    const specialtySelect = page.locator('text=/spécialité|cardiologie/i');
    await expect(specialtySelect.first()).toBeVisible();
  });

  test('should display start exam button', async ({ page }) => {
    const startButton = page.locator('button:has-text("Commencer")');
    await expect(startButton).toBeVisible();
  });

  test('should show exam info (questions count, time limit)', async ({ page }) => {
    // Check for exam info
    const examInfo = page.locator('text=/questions|min|QCM/i');
    await expect(examInfo.first()).toBeVisible();
  });

  test('should display tabs for exam and statistics', async ({ page }) => {
    const examTab = page.getByRole('tab', { name: /examen/i });
    const statsTab = page.getByRole('tab', { name: /statistique/i });
    
    await expect(examTab).toBeVisible();
    await expect(statsTab).toBeVisible();
  });

  test('should switch to statistics tab', async ({ page }) => {
    const statsTab = page.getByRole('tab', { name: /statistique/i });
    await statsTab.click();
    
    // Stats content should be visible
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Commencer")').first()).toBeVisible();
  });

  test('should display gamification badges for exam completion', async ({ page }) => {
    // Check for points indicator
    const pointsIndicator = page.locator('text=/pts|points/i');
    await expect(pointsIndicator.first()).toBeVisible();
  });

  test('should navigate back on back button click', async ({ page }) => {
    const backButton = page.locator('button:has-text("Retour")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/edn|complete/);
    }
  });
});
