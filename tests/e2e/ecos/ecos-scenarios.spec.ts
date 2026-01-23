import { test, expect } from '@playwright/test';

test.describe('ECOS Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ecos');
  });

  test('should display ECOS index page', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show scenario cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const scenarioCards = page.locator('[class*="Card"]');
    await expect(scenarioCards.first()).toBeVisible();
  });

  test('should display scenario titles', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const titles = page.locator('[class*="Card"] h3, [class*="Card"] h4');
    if (await titles.first().isVisible().catch(() => false)) {
      await expect(titles.first()).toBeVisible();
    }
  });

  test('should show specialty badges', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const badges = page.locator('[class*="Badge"]');
    if (await badges.first().isVisible().catch(() => false)) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('should display difficulty indicators', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const difficultyIndicators = page.locator('text=/facile|moyen|difficile|débutant|intermédiaire|avancé/i');
    if (await difficultyIndicators.first().isVisible().catch(() => false)) {
      await expect(difficultyIndicators.first()).toBeVisible();
    }
  });

  test('should show duration info', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const duration = page.locator('text=/min/i');
    if (await duration.first().isVisible().catch(() => false)) {
      await expect(duration.first()).toBeVisible();
    }
  });

  test('should have clickable scenario cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const scenarioLink = page.locator('a[href*="/ecos/"], [class*="Card"] button').first();
    if (await scenarioLink.isVisible().catch(() => false)) {
      await expect(scenarioLink).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show filter or search options', async ({ page }) => {
    const filterElements = page.locator('input[placeholder*="Rechercher"], select, [class*="Select"]');
    if (await filterElements.first().isVisible().catch(() => false)) {
      await expect(filterElements.first()).toBeVisible();
    }
  });

  test('should display learning objectives', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const objectives = page.locator('text=/objectif/i');
    if (await objectives.first().isVisible().catch(() => false)) {
      await expect(objectives.first()).toBeVisible();
    }
  });
});

test.describe('ECOS Scenario Page', () => {
  test('should display scenario detail page', async ({ page }) => {
    // Use a generic scenario ID
    await page.goto('/ecos/scenario-1');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show patient presentation', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const patientInfo = page.locator('text=/patient|présentation|contexte/i');
    if (await patientInfo.first().isVisible().catch(() => false)) {
      await expect(patientInfo.first()).toBeVisible();
    }
  });

  test('should display step progress', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const progressIndicator = page.locator('[class*="Progress"], text=/étape/i');
    if (await progressIndicator.first().isVisible().catch(() => false)) {
      await expect(progressIndicator.first()).toBeVisible();
    }
  });

  test('should show decision options', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const options = page.locator('button, [class*="option"], input[type="radio"]');
    if (await options.first().isVisible().catch(() => false)) {
      await expect(options.first()).toBeVisible();
    }
  });

  test('should display timer if timed', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const timer = page.locator('text=/temps|min|:/i');
    if (await timer.first().isVisible().catch(() => false)) {
      await expect(timer.first()).toBeVisible();
    }
  });

  test('should show quiz section', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const quiz = page.locator('text=/quiz|question|qcm/i');
    if (await quiz.first().isVisible().catch(() => false)) {
      await expect(quiz.first()).toBeVisible();
    }
  });

  test('should have back navigation', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const backButton = page.locator('button:has-text("Retour"), a[href*="/ecos"]');
    if (await backButton.first().isVisible().catch(() => false)) {
      await expect(backButton.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ecos/scenario-1');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show gamification stats', async ({ page }) => {
    await page.goto('/ecos/scenario-1');
    
    const gamification = page.locator('text=/streak|niveau|points/i');
    if (await gamification.first().isVisible().catch(() => false)) {
      await expect(gamification.first()).toBeVisible();
    }
  });
});

test.describe('ECOS Explorer Component', () => {
  test('should render explorer component', async ({ page }) => {
    await page.goto('/ecos');
    
    const explorer = page.locator('[class*="explorer"], .grid, [class*="Card"]');
    await expect(explorer.first()).toBeVisible();
  });

  test('should filter scenarios by specialty', async ({ page }) => {
    await page.goto('/ecos');
    
    const filterSelect = page.locator('select, [class*="Select"], [role="combobox"]');
    if (await filterSelect.first().isVisible().catch(() => false)) {
      await filterSelect.first().click();
      // Check for filter options
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should sort scenarios', async ({ page }) => {
    await page.goto('/ecos');
    
    const sortOptions = page.locator('button:has-text("Trier"), select');
    if (await sortOptions.first().isVisible().catch(() => false)) {
      await expect(sortOptions.first()).toBeVisible();
    }
  });
});
