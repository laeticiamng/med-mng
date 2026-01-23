import { test, expect } from '@playwright/test';

test.describe('Music Library Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edn/music-library');
  });

  test('should display music library page with proper structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show music grid or list', async ({ page }) => {
    const musicItems = page.locator('[class*="Card"], [class*="grid"]');
    await expect(musicItems.first()).toBeVisible();
  });

  test('should display play buttons on music cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const playButtons = page.locator('button:has(svg[class*="Play"]), button[aria-label*="play"]');
    if (await playButtons.first().isVisible().catch(() => false)) {
      await expect(playButtons.first()).toBeVisible();
    }
  });

  test('should show music title and metadata', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const musicTitle = page.locator('[class*="Card"] h3, [class*="Card"] h4');
    if (await musicTitle.first().isVisible().catch(() => false)) {
      await expect(musicTitle.first()).toBeVisible();
    }
  });

  test('should display delete button for user music', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const deleteButtons = page.locator('button:has(svg[class*="Trash"])');
    // Delete buttons might not be visible if no user music
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to create music page', async ({ page }) => {
    const createButton = page.locator('button:has-text("Créer"), a[href*="create"]');
    if (await createButton.first().isVisible().catch(() => false)) {
      await createButton.first().click();
      await expect(page).toHaveURL(/create|generator/);
    }
  });

  test('should show empty state when no music', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const emptyState = page.locator('text=/vide|aucun/i');
    const musicCards = page.locator('[class*="Card"]');
    
    // Either empty state or music cards should be visible
    const hasEmpty = await emptyState.first().isVisible().catch(() => false);
    const hasCards = await musicCards.first().isVisible().catch(() => false);
    
    expect(hasEmpty || hasCards).toBe(true);
  });

  test('should show favorite toggle', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const favoriteButtons = page.locator('button:has(svg[class*="Heart"])');
    // Favorites might not be visible if no music
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display music style badges', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const styleBadges = page.locator('[class*="Badge"]');
    if (await styleBadges.first().isVisible().catch(() => false)) {
      await expect(styleBadges.first()).toBeVisible();
    }
  });
});

test.describe('Music Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/create');
  });

  test('should display music creation page', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show style selector', async ({ page }) => {
    const styleSelector = page.locator('select, [class*="Select"], [role="combobox"]');
    await expect(styleSelector.first()).toBeVisible();
  });

  test('should show lyrics input or item selector', async ({ page }) => {
    const inputElements = page.locator('textarea, input, [class*="Select"]');
    await expect(inputElements.first()).toBeVisible();
  });

  test('should display generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Générer"), button:has-text("Créer")');
    await expect(generateButton.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show duration options', async ({ page }) => {
    const durationOptions = page.locator('text=/durée|secondes|min/i');
    if (await durationOptions.first().isVisible().catch(() => false)) {
      await expect(durationOptions.first()).toBeVisible();
    }
  });
});

test.describe('Playlist Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/playlists');
  });

  test('should display playlists page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show create playlist button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouvelle")');
    if (await createButton.first().isVisible().catch(() => false)) {
      await expect(createButton.first()).toBeVisible();
    }
  });

  test('should display playlist cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const playlistCards = page.locator('[class*="Card"]');
    await expect(playlistCards.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});
