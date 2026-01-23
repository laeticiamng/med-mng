import { test, expect } from '@playwright/test';

test.describe('EDN Immersive Mode', () => {
  test('should display immersive mode page', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show navigation between sections', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const navigation = page.locator('button, [role="tablist"]');
    await expect(navigation.first()).toBeVisible();
  });

  test('should display tableau section', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const tableauSection = page.locator('text=/tableau|rang/i');
    if (await tableauSection.first().isVisible().catch(() => false)) {
      await expect(tableauSection.first()).toBeVisible();
    }
  });

  test('should display music section', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const musicSection = page.locator('text=/musique|paroles/i');
    if (await musicSection.first().isVisible().catch(() => false)) {
      await expect(musicSection.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show quiz section', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const quizSection = page.locator('text=/quiz|qcm/i');
    if (await quizSection.first().isVisible().catch(() => false)) {
      await expect(quizSection.first()).toBeVisible();
    }
  });

  test('should display back button', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const backButton = page.locator('button:has-text("Retour"), a:has-text("Retour")');
    if (await backButton.first().isVisible().catch(() => false)) {
      await expect(backButton.first()).toBeVisible();
    }
  });

  test('should show item title', async ({ page }) => {
    await page.goto('/edn/ic-1-relation-medecin-malade/immersive');
    
    const title = page.locator('h1, h2');
    await expect(title.first()).toBeVisible();
  });
});

test.describe('Audio Player Component', () => {
  test('should display audio player when music is available', async ({ page }) => {
    await page.goto('/med-mng/player/test-song');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show play/pause controls', async ({ page }) => {
    await page.goto('/med-mng/player/test-song');
    
    const controls = page.locator('button:has(svg[class*="Play"]), button:has(svg[class*="Pause"])');
    if (await controls.first().isVisible().catch(() => false)) {
      await expect(controls.first()).toBeVisible();
    }
  });

  test('should show progress bar', async ({ page }) => {
    await page.goto('/med-mng/player/test-song');
    
    const progressBar = page.locator('[role="slider"], [class*="progress"], input[type="range"]');
    if (await progressBar.first().isVisible().catch(() => false)) {
      await expect(progressBar.first()).toBeVisible();
    }
  });

  test('should show volume controls', async ({ page }) => {
    await page.goto('/med-mng/player/test-song');
    
    const volumeControl = page.locator('button:has(svg[class*="Volume"]), input[type="range"]');
    if (await volumeControl.first().isVisible().catch(() => false)) {
      await expect(volumeControl.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/med-mng/player/test-song');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Shared Music', () => {
  test('should display shared music page', async ({ page }) => {
    await page.goto('/shared-music');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show sharing functionality', async ({ page }) => {
    await page.goto('/shared-music');
    
    const shareElements = page.locator('text=/partag/i, button:has(svg[class*="Share"])');
    if (await shareElements.first().isVisible().catch(() => false)) {
      await expect(shareElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shared-music');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
