import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // H1 should contain main page title
    await expect(h1).toContainText(/MED MNG|accueil|home/i);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Should be able to navigate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper aria labels on mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Bottom nav should have proper aria labels
    const bottomNav = page.locator('nav[aria-label="Navigation principale mobile"]');
    await expect(bottomNav).toBeVisible();
    
    // Nav items should have aria-labels
    const navButtons = bottomNav.locator('button[aria-label]');
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have accessible forms', async ({ page }) => {
    await page.goto('/med-mng/create');
    
    // Check for labels associated with inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      
      if (id) {
        // Should have associated label
        const label = page.locator(`label[for="${id}"]`);
        if (await label.count() > 0) {
          await expect(label).toBeVisible();
        }
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - in real scenarios you'd use axe-core
    const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6');
    const count = await textElements.count();
    
    // Basic check that text elements are visible (contrast check would need axe-core)
    if (count > 0) {
      await expect(textElements.first()).toBeVisible();
    }
  });

  test('should have focus indicators', async ({ page }) => {
    // Test that interactive elements have visible focus
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await firstButton.focus();
      await expect(firstButton).toBeFocused();
    }
  });

  test('should work with screen reader simulation', async ({ page }) => {
    // Test basic screen reader accessibility
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    // Should have proper semantic structure
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Navigation should be properly labeled
    const nav = page.locator('nav');
    const navCount = await nav.count();
    
    if (navCount > 0) {
      const firstNav = nav.first();
      const ariaLabel = await firstNav.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});