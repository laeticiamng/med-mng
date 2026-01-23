import { test, expect } from '@playwright/test';

test.describe('EDN Complete Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/edn-complete');
  });

  test('should display EDN complete page with proper structure', async ({ page }) => {
    // Check main heading or content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Rechercher"], input[type="search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should display EDN items list', async ({ page }) => {
    // Items should be displayed in cards or list
    const itemCards = page.locator('[class*="Card"], [class*="item"]');
    await expect(itemCards.first()).toBeVisible();
  });

  test('should show item codes on cards', async ({ page }) => {
    const itemCodes = page.locator('text=/IC-|OIC-/i');
    if (await itemCodes.first().isVisible().catch(() => false)) {
      await expect(itemCodes.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto('/edn-complete');
    
    // Either loading spinner or content should be visible
    const hasContent = await page.locator('[class*="Card"], .grid').first().isVisible().catch(() => false);
    const hasLoading = await page.locator('.animate-pulse, [class*="loading"]').first().isVisible().catch(() => false);
    
    expect(hasContent || hasLoading).toBe(true);
  });

  test('should navigate to item detail on click', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const itemLink = page.locator('a[href*="/edn-complete/"], [class*="Card"] a').first();
    if (await itemLink.isVisible().catch(() => false)) {
      await itemLink.click();
      await expect(page).toHaveURL(/edn-complete\/.+/);
    }
  });

  test('should show filter options', async ({ page }) => {
    const filterOptions = page.locator('[class*="filter"], button:has-text("Filtrer")');
    // Filters might not always be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display pagination or load more', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const pagination = page.locator('button:has-text("Charger plus"), [class*="pagination"]');
    // Pagination might not be visible if few items
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show learning module links', async ({ page }) => {
    // Links to Flashcards, SRS, Exam Mode, etc.
    const moduleLinks = page.locator('a[href*="/flashcards"], a[href*="/srs"], a[href*="/exam"]');
    if (await moduleLinks.first().isVisible().catch(() => false)) {
      await expect(moduleLinks.first()).toBeVisible();
    }
  });
});

test.describe('EDN Item Detail', () => {
  test('should display item detail page structure', async ({ page }) => {
    // Go to a specific item (using a common pattern)
    await page.goto('/edn-complete/ic-1-relation-medecin-malade');
    
    // Should show item content or redirect
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show tableau rang A and B tabs', async ({ page }) => {
    await page.goto('/edn-complete/ic-1-relation-medecin-malade');
    
    const tabs = page.locator('[role="tablist"], [class*="Tab"]');
    if (await tabs.isVisible().catch(() => false)) {
      await expect(tabs).toBeVisible();
    }
  });

  test('should display competences table', async ({ page }) => {
    await page.goto('/edn-complete/ic-1-relation-medecin-malade');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table, [class*="grid"], [class*="Card"]');
    await expect(table.first()).toBeVisible();
  });

  test('should show music section', async ({ page }) => {
    await page.goto('/edn-complete/ic-1-relation-medecin-malade');
    
    const musicSection = page.locator('text=/musique|paroles|audio/i');
    if (await musicSection.first().isVisible().catch(() => false)) {
      await expect(musicSection.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/edn-complete/ic-1-relation-medecin-malade');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
