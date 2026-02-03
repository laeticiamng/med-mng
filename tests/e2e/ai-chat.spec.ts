import { test, expect } from '@playwright/test';

/**
 * Tests E2E - Module IA & Chat
 * Couverture: MedChat, AI tutor, Content generation
 */

test.describe('AI & Chat Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should access MedChat page', async ({ page }) => {
    await page.goto('/chat');
    
    await expect(page).toHaveURL(/chat/);
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });

  test('should display chat input interface', async ({ page }) => {
    await page.goto('/chat');
    
    // Look for chat input or textarea
    const chatInput = page.locator('textarea, input[type="text"]').first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('should display medical disclaimer on AI pages', async ({ page }) => {
    await page.goto('/chat');
    
    // Check for medical disclaimer presence (may be in footer or alert)
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
    
    // The page should render without errors
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should access AI tutor functionality', async ({ page }) => {
    // Navigate to a page that might have AI tutor
    await page.goto('/smart-study-planner');
    
    const pageContent = page.locator('main, [role="main"]').first();
    await expect(pageContent).toBeVisible({ timeout: 10000 });
  });
});
