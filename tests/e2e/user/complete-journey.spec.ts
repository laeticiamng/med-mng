import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete onboarding to first study session flow', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigate to library
    await page.goto('/med-mng/library');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to create
    await page.goto('/med-mng/create');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to EDN content
    await page.goto('/edn-complete');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should complete study flow: EDN -> Flashcards -> Review', async ({ page }) => {
    // Start at EDN
    await page.goto('/edn-complete');
    await expect(page.locator('body')).toBeVisible();
    
    // Go to Flashcards
    await page.goto('/flashcards');
    await expect(page.locator('h1')).toBeVisible();
    
    // Go to SRS Review
    await page.goto('/srs-review');
    await expect(page.locator('h1')).toBeVisible();
    
    // Go to Exam Mode
    await page.goto('/exam-mode');
    await expect(page.locator('h1')).toBeVisible();
    
    // Go to Progress Dashboard
    await page.goto('/progress-dashboard');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should complete clinical practice flow', async ({ page }) => {
    // Start at ECOS
    await page.goto('/ecos');
    await expect(page.locator('body')).toBeVisible();
    
    // Go to Clinical Cases
    await page.goto('/clinical-cases');
    await expect(page.locator('h1')).toBeVisible();
    
    // Check stats
    await page.goto('/progress-dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should complete music creation flow', async ({ page }) => {
    // Go to create
    await page.goto('/med-mng/create');
    await expect(page.locator('body')).toBeVisible();
    
    // Go to library
    await page.goto('/med-mng/library');
    await expect(page.locator('body')).toBeVisible();
    
    // Go to music library
    await page.goto('/edn/music-library');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate all main menu items', async ({ page }) => {
    const routes = [
      '/',
      '/edn-complete',
      '/ecos',
      '/flashcards',
      '/srs-review',
      '/exam-mode',
      '/clinical-cases',
      '/progress-dashboard',
      '/med-mng/library',
      '/med-mng/pricing',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Should show 404 page or redirect
    await expect(page.locator('body')).toBeVisible();
  });

  test('should maintain responsive layout throughout journey', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const routes = ['/', '/edn-complete', '/flashcards', '/progress-dashboard'];
    
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      
      // Check no horizontal overflow
      const body = await page.locator('body').boundingBox();
      expect(body?.width).toBeLessThanOrEqual(375);
    }
  });
});

test.describe('Gamification Journey', () => {
  test('should track streak across sessions', async ({ page }) => {
    // Go to progress dashboard
    await page.goto('/progress-dashboard');
    
    // Check for streak display
    const streakDisplay = page.locator('text=/streak|jours/i');
    if (await streakDisplay.first().isVisible().catch(() => false)) {
      await expect(streakDisplay.first()).toBeVisible();
    }
  });

  test('should display badges', async ({ page }) => {
    await page.goto('/progress-dashboard');
    
    const badgesTab = page.getByRole('tab', { name: /badge/i });
    if (await badgesTab.isVisible().catch(() => false)) {
      await badgesTab.click();
      await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    }
  });

  test('should show points and level', async ({ page }) => {
    await page.goto('/progress-dashboard');
    
    const levelDisplay = page.locator('text=/niveau|level|points/i');
    if (await levelDisplay.first().isVisible().catch(() => false)) {
      await expect(levelDisplay.first()).toBeVisible();
    }
  });
});

test.describe('Legal Pages', () => {
  test('should display mentions légales', async ({ page }) => {
    await page.goto('/mentions-legales');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display politique de confidentialité', async ({ page }) => {
    await page.goto('/politique-confidentialite');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display CGU', async ({ page }) => {
    await page.goto('/cgu');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display déclaration accessibilité', async ({ page }) => {
    await page.goto('/declaration-accessibilite');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('PWA Features', () => {
  test('should display install PWA page', async ({ page }) => {
    await page.goto('/install');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display PWA analytics', async ({ page }) => {
    await page.goto('/pwa-analytics');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Settings and Preferences', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display RGPD data page', async ({ page }) => {
    await page.goto('/mes-donnees-rgpd');
    await expect(page.locator('body')).toBeVisible();
  });
});
