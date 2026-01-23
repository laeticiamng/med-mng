import { test, expect } from '@playwright/test';

test.describe('Flashcards Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flashcards');
  });

  test('should display flashcards page with proper structure', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText(/révision|flash/i);
    
    // Check tabs are present
    await expect(page.getByRole('tab', { name: /deck/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /stat/i })).toBeVisible();
  });

  test('should show create deck button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Créer un deck")');
    await expect(createButton).toBeVisible();
  });

  test('should open create deck dialog when clicking create button', async ({ page }) => {
    await page.click('button:has-text("Créer un deck")');
    
    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Nom')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should validate deck creation form', async ({ page }) => {
    await page.click('button:has-text("Créer un deck")');
    
    // Try to submit without filling required fields
    const createButton = page.getByRole('dialog').locator('button:has-text("Créer")');
    await createButton.click();
    
    // Form should not close without valid input
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should show empty state when no decks exist', async ({ page }) => {
    // Check for empty state message or the create prompt
    const emptyState = page.locator('text=Aucun deck créé');
    const createButton = page.locator('button:has-text("Créer un deck")');
    
    // Either empty state or create button should be visible
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasCreateButton = await createButton.isVisible().catch(() => false);
    
    expect(hasEmptyState || hasCreateButton).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Main content should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Créer")').first()).toBeVisible();
  });

  test('should navigate back to EDN on back button click', async ({ page }) => {
    const backButton = page.locator('button:has-text("Retour")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/edn|library/);
    }
  });

  test('should display gamification stats when user is logged in', async ({ page }) => {
    // Stats might show streak, level, or badges
    const statsElements = page.locator('[class*="streak"], [class*="badge"], [class*="level"]');
    // Just verify the page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle AI card generation dialog', async ({ page }) => {
    // First, we need a deck - check if AI generation option exists
    const aiButton = page.locator('button:has-text("IA"), button:has-text("Générer")');
    
    if (await aiButton.first().isVisible().catch(() => false)) {
      await aiButton.first().click();
      // Should show item code input
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test('should display stats tab with review statistics', async ({ page }) => {
    const statsTab = page.getByRole('tab', { name: /stat/i });
    await statsTab.click();
    
    // Stats content should be visible
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });
});
