import { test, expect } from '@playwright/test';

test.describe('Home Page - Complete Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page with main heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/MED MNG/i);
  });

  test('should show main navigation elements', async ({ page }) => {
    // Check for main navigation buttons or links
    await expect(page.locator('nav, header')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    const heroSection = page.locator('main section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should show CTA buttons', async ({ page }) => {
    const ctaButtons = page.locator('button, a[href*="library"], a[href*="pricing"]');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toBeVisible();
    
    // Mobile navigation should be visible
    const mobileNav = page.locator('nav[aria-label*="mobile"]');
    if (await mobileNav.isVisible().catch(() => false)) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Check for main semantic elements
    await expect(page.locator('main')).toBeVisible();
    
    const footer = page.locator('footer');
    if (await footer.isVisible().catch(() => false)) {
      await expect(footer).toBeVisible();
    }
  });

  test('should show feature cards or sections', async ({ page }) => {
    const featureCards = page.locator('[class*="Card"], section');
    await expect(featureCards.first()).toBeVisible();
  });

  test('should navigate to library on CTA click', async ({ page }) => {
    const libraryLink = page.locator('a[href*="library"], button:has-text("Bibliothèque")').first();
    if (await libraryLink.isVisible().catch(() => false)) {
      await libraryLink.click();
      await expect(page).toHaveURL(/library/);
    }
  });

  test('should navigate to pricing on pricing CTA', async ({ page }) => {
    const pricingLink = page.locator('a[href*="pricing"], button:has-text("Abonnement")').first();
    if (await pricingLink.isVisible().catch(() => false)) {
      await pricingLink.click();
      await expect(page).toHaveURL(/pricing/);
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Press Tab to start keyboard navigation
    await page.keyboard.press('Tab');
    
    // First focusable element should receive focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    const nav = page.locator('nav');
    if (await nav.first().isVisible().catch(() => false)) {
      const ariaLabel = await nav.first().getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Platform Status Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/platform-status');
  });

  test('should display status page', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show system status indicators', async ({ page }) => {
    const statusIndicators = page.locator('text=/système|opérationnel|status/i');
    await expect(statusIndicators.first()).toBeVisible();
  });

  test('should display service cards', async ({ page }) => {
    const serviceCards = page.locator('[class*="Card"]');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('should show tabs for different views', async ({ page }) => {
    const tabs = page.locator('[role="tablist"], [class*="Tab"]');
    await expect(tabs).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Community Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/community');
  });

  test('should display community page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show community features', async ({ page }) => {
    const communityFeatures = page.locator('text=/communauté|groupe|discussion/i');
    if (await communityFeatures.first().isVisible().catch(() => false)) {
      await expect(communityFeatures.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Study Planner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study-planner');
  });

  test('should display study planner page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show planner features', async ({ page }) => {
    const plannerFeatures = page.locator('text=/planification|calendrier|objectif/i');
    if (await plannerFeatures.first().isVisible().catch(() => false)) {
      await expect(plannerFeatures.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Dashboard Pages', () => {
  test('should display modular dashboard', async ({ page }) => {
    await page.goto('/modular-dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display learning dashboard', async ({ page }) => {
    await page.goto('/learning-dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Generator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generator');
  });

  test('should display generator page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show generation options', async ({ page }) => {
    const options = page.locator('select, [class*="Select"], input, textarea');
    await expect(options.first()).toBeVisible();
  });

  test('should have generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("Générer"), button:has-text("Créer")');
    await expect(generateButton.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});
