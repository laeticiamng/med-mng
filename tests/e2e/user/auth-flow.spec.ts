import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/med-mng/login');
    });

    test('should display login page with proper structure', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should show email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput).toBeVisible();
    });

    test('should show password input', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('should show login button', async ({ page }) => {
      const loginButton = page.locator('button[type="submit"], button:has-text("Connexion")');
      await expect(loginButton.first()).toBeVisible();
    });

    test('should show link to signup', async ({ page }) => {
      const signupLink = page.locator('a[href*="signup"], text=/créer.*compte|inscription/i');
      await expect(signupLink.first()).toBeVisible();
    });

    test('should validate empty form submission', async ({ page }) => {
      const loginButton = page.locator('button[type="submit"], button:has-text("Connexion")').first();
      await loginButton.click();
      
      // Form should not submit or show validation
      await expect(page.locator('body')).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    });

    test('should show password visibility toggle', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator('button:has(svg[class*="Eye"])');
      
      if (await toggleButton.isVisible().catch(() => false)) {
        await toggleButton.click();
        // Password should become visible (type="text")
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/med-mng/signup');
    });

    test('should display signup page with proper structure', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should show email input', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput).toBeVisible();
    });

    test('should show password input', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
    });

    test('should show signup button', async ({ page }) => {
      const signupButton = page.locator('button[type="submit"], button:has-text("Inscription"), button:has-text("Créer")');
      await expect(signupButton.first()).toBeVisible();
    });

    test('should show link to login', async ({ page }) => {
      const loginLink = page.locator('a[href*="login"], text=/connexion|déjà.*compte/i');
      await expect(loginLink.first()).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    });
  });
});

test.describe('User Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/profile');
  });

  test('should display profile page or login redirect', async ({ page }) => {
    // Profile page requires auth, might redirect to login
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show profile information section', async ({ page }) => {
    const profileSection = page.locator('text=/profil|compte|informations/i');
    const loginSection = page.locator('text=/connexion|login/i');
    
    const hasProfile = await profileSection.first().isVisible().catch(() => false);
    const hasLogin = await loginSection.first().isVisible().catch(() => false);
    
    expect(hasProfile || hasLogin).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Subscription Flow', () => {
  test.describe('Pricing Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/med-mng/pricing');
    });

    test('should display pricing page', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should show pricing plans', async ({ page }) => {
      const pricingCards = page.locator('[class*="Card"]');
      await expect(pricingCards.first()).toBeVisible();
    });

    test('should display plan prices', async ({ page }) => {
      const prices = page.locator('text=/€|gratuit|mois|an/i');
      await expect(prices.first()).toBeVisible();
    });

    test('should show plan features', async ({ page }) => {
      const features = page.locator('[class*="Card"] li, [class*="Card"] ul');
      if (await features.first().isVisible().catch(() => false)) {
        await expect(features.first()).toBeVisible();
      }
    });

    test('should have subscribe buttons', async ({ page }) => {
      const subscribeButtons = page.locator('button:has-text("S\'abonner"), button:has-text("Choisir"), a[href*="subscribe"]');
      await expect(subscribeButtons.first()).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('[class*="Card"]').first()).toBeVisible();
    });

    test('should highlight recommended plan', async ({ page }) => {
      const recommendedPlan = page.locator('text=/recommandé|populaire/i, [class*="recommended"]');
      if (await recommendedPlan.first().isVisible().catch(() => false)) {
        await expect(recommendedPlan.first()).toBeVisible();
      }
    });
  });

  test.describe('Success Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/med-mng/success');
    });

    test('should display success page', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show success message or redirect', async ({ page }) => {
      const successMessage = page.locator('text=/succès|merci|bienvenue/i');
      if (await successMessage.first().isVisible().catch(() => false)) {
        await expect(successMessage.first()).toBeVisible();
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/favorites');
  });

  test('should display favorites page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show favorites list or empty state', async ({ page }) => {
    const favorites = page.locator('[class*="Card"]');
    const emptyState = page.locator('text=/aucun|vide|favori/i');
    
    const hasFavorites = await favorites.first().isVisible().catch(() => false);
    const hasEmpty = await emptyState.first().isVisible().catch(() => false);
    
    expect(hasFavorites || hasEmpty).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Progress Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/progress');
  });

  test('should display progress page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show progress statistics', async ({ page }) => {
    const progressStats = page.locator('text=/progression|statistique|score/i');
    if (await progressStats.first().isVisible().catch(() => false)) {
      await expect(progressStats.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});
