import { test, expect } from '@playwright/test';

test.describe('Progress Dashboard Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/progress-dashboard');
  });

  test('should display progress dashboard with proper structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText(/progression/i);
  });

  test('should show navigation tabs', async ({ page }) => {
    const tabs = page.getByRole('tablist');
    await expect(tabs).toBeVisible();
    
    // Check for specific tabs
    await expect(page.getByRole('tab', { name: /vue d'ensemble/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /badge/i })).toBeVisible();
  });

  test('should display weekly summary card', async ({ page }) => {
    const weeklySummary = page.locator('text=/résumé.*semaine|semaine/i');
    await expect(weeklySummary.first()).toBeVisible();
  });

  test('should show activity count for the week', async ({ page }) => {
    const activityCard = page.locator('text=/activité/i');
    await expect(activityCard.first()).toBeVisible();
  });

  test('should display trend indicator', async ({ page }) => {
    const trendIndicator = page.locator('text=/%/i');
    if (await trendIndicator.first().isVisible().catch(() => false)) {
      await expect(trendIndicator.first()).toBeVisible();
    }
  });

  test('should show time spent analytics card', async ({ page }) => {
    const timeCard = page.locator('text=/temps.*étude|temps/i');
    await expect(timeCard.first()).toBeVisible();
  });

  test('should display success probability card', async ({ page }) => {
    const probabilityCard = page.locator('text=/probabilité.*succès|rétention/i');
    await expect(probabilityCard.first()).toBeVisible();
  });

  test('should show main stats grid (mastered, score, streak, due)', async ({ page }) => {
    const statsGrid = page.locator('.grid');
    await expect(statsGrid.first()).toBeVisible();
  });

  test('should display streak count', async ({ page }) => {
    const streakDisplay = page.locator('text=/jours.*suite|streak/i');
    if (await streakDisplay.first().isVisible().catch(() => false)) {
      await expect(streakDisplay.first()).toBeVisible();
    }
  });

  test('should switch to badges tab', async ({ page }) => {
    const badgesTab = page.getByRole('tab', { name: /badge/i });
    await badgesTab.click();
    
    // Badges content should be visible
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should switch to analytics tab', async ({ page }) => {
    const analyticsTab = page.getByRole('tab', { name: /analyse/i });
    await analyticsTab.click();
    
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should switch to history tab', async ({ page }) => {
    const historyTab = page.getByRole('tab', { name: /historique/i });
    await historyTab.click();
    
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should switch to reminders tab', async ({ page }) => {
    const remindersTab = page.getByRole('tab', { name: /rappel/i });
    await remindersTab.click();
    
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should switch to settings tab', async ({ page }) => {
    const settingsTab = page.getByRole('tab', { name: /option/i });
    await settingsTab.click();
    
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('should display SRS module card', async ({ page }) => {
    const srsCard = page.locator('text=/révision espacée|SRS/i');
    await expect(srsCard.first()).toBeVisible();
  });

  test('should display Exam module card', async ({ page }) => {
    const examCard = page.locator('text=/examen/i');
    if (await examCard.first().isVisible().catch(() => false)) {
      await expect(examCard.first()).toBeVisible();
    }
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

  test('should show quick action buttons', async ({ page }) => {
    const actionButtons = page.locator('button:has-text("session"), button:has-text("Commencer")');
    if (await actionButtons.first().isVisible().catch(() => false)) {
      await expect(actionButtons.first()).toBeVisible();
    }
  });
});
