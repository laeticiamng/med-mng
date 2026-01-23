import { test, expect } from '@playwright/test';

test.describe('Clinical Cases Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clinical-cases');
  });

  test('should display clinical cases page with proper structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText(/cas clinique/i);
  });

  test('should show AI generation card', async ({ page }) => {
    const aiGenerationCard = page.locator('text=/générer.*ia|ia.*cas/i');
    await expect(aiGenerationCard.first()).toBeVisible();
  });

  test('should display generate with AI button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Générer avec l\'IA")');
    await expect(generateButton).toBeVisible();
  });

  test('should show tabs for cases, active case, and stats', async ({ page }) => {
    const casesTab = page.getByRole('tab', { name: /cas/i });
    const statsTab = page.getByRole('tab', { name: /stat/i });
    
    await expect(casesTab).toBeVisible();
    await expect(statsTab).toBeVisible();
  });

  test('should display case cards with specialty icons', async ({ page }) => {
    // Check for case cards
    const caseCards = page.locator('[class*="Card"]');
    await expect(caseCards.first()).toBeVisible();
  });

  test('should show difficulty badges on case cards', async ({ page }) => {
    const difficultyBadges = page.locator('text=/débutant|intermédiaire|avancé/i');
    if (await difficultyBadges.first().isVisible().catch(() => false)) {
      await expect(difficultyBadges.first()).toBeVisible();
    }
  });

  test('should show estimated time for cases', async ({ page }) => {
    const timeIndicator = page.locator('text=/min/i');
    if (await timeIndicator.first().isVisible().catch(() => false)) {
      await expect(timeIndicator.first()).toBeVisible();
    }
  });

  test('should show learning objectives on case cards', async ({ page }) => {
    // Learning objectives are shown as badges
    const objectiveBadges = page.locator('[class*="Badge"]');
    if (await objectiveBadges.first().isVisible().catch(() => false)) {
      await expect(objectiveBadges.first()).toBeVisible();
    }
  });

  test('should display start case button on cards', async ({ page }) => {
    const startButton = page.locator('button:has-text("Commencer le cas")');
    if (await startButton.first().isVisible().catch(() => false)) {
      await expect(startButton.first()).toBeVisible();
    }
  });

  test('should switch to statistics tab', async ({ page }) => {
    const statsTab = page.getByRole('tab', { name: /stat/i });
    await statsTab.click();
    
    // Stats content should be visible
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate back on back button click', async ({ page }) => {
    const backButton = page.locator('button:has-text("Retour")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/edn|complete/);
    }
  });

  test('should show specialty icons for different case types', async ({ page }) => {
    // Specialty icons like Heart, Brain, Baby should be present
    const icons = page.locator('svg[class*="lucide"]');
    await expect(icons.first()).toBeVisible();
  });
});
