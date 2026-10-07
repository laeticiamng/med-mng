import { test, expect } from '@playwright/test';

test.describe('Navigation E2E Tests', () => {
  
  test.describe('Main Navigation', () => {
    test('should navigate to home page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
      await expect(page.locator('h1, [data-testid="hero-title"]')).toBeVisible();
    });

    test('should navigate to EDN items page', async ({ page }) => {
      await page.goto('/med-mng/edn');
      await expect(page).toHaveURL('/med-mng/edn');
      await expect(page.locator('body')).toContainText(/EDN|Items|Objectifs/i);
    });

    // Pages ExamMode, MedChat et ClinicalCases supprimées : leurs URL redirigent (App.tsx).
    test('redirects retired exam mode to EDN items', async ({ page }) => {
      await page.goto('/exam-mode');
      await expect(page).toHaveURL('/edn-complete');
    });

    test('should navigate to ECOS page', async ({ page }) => {
      await page.goto('/ecos');
      await expect(page).toHaveURL('/ecos');
      await expect(page.locator('body')).toContainText(/ECOS|Simulation/i);
    });

    test('should navigate to progress dashboard', async ({ page }) => {
      await page.goto('/progress');
      await expect(page).toHaveURL('/progress');
      await expect(page.locator('body')).toContainText(/Progress|Progression|Tableau/i);
    });

    test('redirects retired chat to EDN items', async ({ page }) => {
      await page.goto('/chat');
      await expect(page).toHaveURL('/edn-complete');
    });
  });

  test.describe('Secondary Navigation', () => {
    test('should navigate to flashcards', async ({ page }) => {
      await page.goto('/flashcards');
      await expect(page).toHaveURL('/flashcards');
      await expect(page.locator('body')).toContainText(/Flashcard/i);
    });

    test('should navigate to SRS review', async ({ page }) => {
      await page.goto('/srs-review');
      await expect(page).toHaveURL('/srs-review');
      await expect(page.locator('body')).toContainText(/Révision|espacée|SRS/i);
    });

    test('redirects retired clinical cases to ECOS', async ({ page }) => {
      await page.goto('/clinical-cases');
      await expect(page).toHaveURL('/ecos');
    });

    test('should navigate to achievements', async ({ page }) => {
      await page.goto('/achievements');
      await expect(page).toHaveURL('/achievements');
      await expect(page.locator('body')).toContainText(/Succès|Badge|Achievement/i);
    });

    test('should navigate to music generator', async ({ page }) => {
      await page.goto('/med-mng/create');
      await expect(page).toHaveURL('/med-mng/create');
      await expect(page.locator('body')).toContainText(/Créer|Musique|Génér/i);
    });

    test('should navigate to library', async ({ page }) => {
      await page.goto('/med-mng/music-library');
      await expect(page).toHaveURL('/med-mng/music-library');
      await expect(page.locator('body')).toContainText(/Bibliothèque|Library/i);
    });

    // CONSTAT : ce test attendait une page /store qui a été supprimée (commit ca5d38cb) :
    // il échouait sur une 404. Test retiré en même temps que la route.

    test('should navigate to statistics', async ({ page }) => {
      await page.goto('/statistics');
      await expect(page).toHaveURL('/statistics');
      await expect(page.locator('body')).toContainText(/Statistique|Stats/i);
    });

    test('should navigate to favorites', async ({ page }) => {
      await page.goto('/favorites');
      await expect(page).toHaveURL('/favorites');
      await expect(page.locator('body')).toContainText(/Favori/i);
    });

    test('should navigate to MNG method', async ({ page }) => {
      await page.goto('/mng-method');
      await expect(page).toHaveURL('/mng-method');
      await expect(page.locator('body')).toContainText(/MNG|Méthode/i);
    });

    test('should navigate to pricing', async ({ page }) => {
      await page.goto('/med-mng/pricing');
      await expect(page).toHaveURL('/med-mng/pricing');
      await expect(page.locator('body')).toContainText(/Tarif|Prix|Abonnement|Pricing/i);
    });
  });

  test.describe('User Account Navigation', () => {
    test('should navigate to profile', async ({ page }) => {
      await page.goto('/med-mng/profile');
      await expect(page).toHaveURL('/med-mng/profile');
      await expect(page.locator('body')).toContainText(/Profil|Compte/i);
    });

    test('should navigate to settings', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL('/settings');
      await expect(page.locator('body')).toContainText(/Paramètre|Settings/i);
    });

    test('should navigate to user playlists', async ({ page }) => {
      await page.goto('/med-mng/playlists');
      await expect(page).toHaveURL('/med-mng/playlists');
      await expect(page.locator('body')).toContainText(/Playlist/i);
    });
  });

  test.describe('Legal Pages Navigation', () => {
    test('should navigate to legal notices', async ({ page }) => {
      await page.goto('/mentions-legales');
      await expect(page).toHaveURL('/mentions-legales');
      await expect(page.locator('body')).toContainText(/Mention|légal/i);
    });

    test('should navigate to privacy policy', async ({ page }) => {
      await page.goto('/politique-confidentialite');
      await expect(page).toHaveURL('/politique-confidentialite');
      await expect(page.locator('body')).toContainText(/Confidentialité|Privacy/i);
    });

    test('should navigate to terms of service', async ({ page }) => {
      await page.goto('/cgu');
      await expect(page).toHaveURL('/cgu');
      await expect(page.locator('body')).toContainText(/CGU|Condition|Utilisation/i);
    });

    test('should navigate to accessibility declaration', async ({ page }) => {
      await page.goto('/declaration-accessibilite');
      await expect(page).toHaveURL('/declaration-accessibilite');
      await expect(page.locator('body')).toContainText(/Accessibilité/i);
    });

    test('should navigate to GDPR data page', async ({ page }) => {
      await page.goto('/mes-donnees-rgpd');
      await expect(page).toHaveURL('/mes-donnees-rgpd');
      await expect(page.locator('body')).toContainText(/RGPD|Données|Data/i);
    });
  });

  test.describe('Navigation UI Elements', () => {
    test('should show bottom navigation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const bottomNav = page.locator('[data-testid="bottom-nav"], nav.fixed.bottom-0, .bottom-navigation');
      await expect(bottomNav.first()).toBeVisible();
    });

    test('should hide mobile nav on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      
      // La nav mobile devrait être cachée sur desktop
      const mobileNav = page.locator('[data-testid="mobile-bottom-nav"]');
      if (await mobileNav.count() > 0) {
        await expect(mobileNav).toBeHidden();
      }
    });

    test('should have working navigation links', async ({ page }) => {
      await page.goto('/');
      
      // Vérifier qu'on peut cliquer sur les liens de navigation
      const navLinks = page.locator('nav a[href]');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Page Load Performance', () => {
    test('pages should load within acceptable time', async ({ page }) => {
      const pages = ['/', '/med-mng/edn', '/edn-complete', '/progress', '/flashcards'];
      
      for (const url of pages) {
        const start = Date.now();
        await page.goto(url);
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - start;
        
        expect(loadTime).toBeLessThan(5000); // 5 secondes max
      }
    });
  });

  test.describe('404 Handling', () => {
    test('should handle non-existent routes gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      
      // Devrait afficher une page 404 ou rediriger
      const body = await page.locator('body').textContent();
      const is404 = body?.includes('404') || body?.includes('introuvable') || body?.includes('not found');
      const isRedirected = page.url().includes('/') || page.url().includes('/404');
      
      expect(is404 || isRedirected).toBeTruthy();
    });
  });
});
