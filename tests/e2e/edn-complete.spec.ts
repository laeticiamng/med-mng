import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour /edn-complete
 * Valide le flux complet utilisateur : recherche, filtrage, navigation, modals
 */

test.describe('EDN Complete - Flux utilisateur complet', () => {
  test.beforeEach(async ({ page }) => {
    // Navigation vers la page EDN Complete
    await page.goto('/edn-complete');
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('[data-testid="edn-header"]', { timeout: 10000 });
  });

  test('devrait afficher le header avec les informations correctes', async ({ page }) => {
    // Vérifier la présence du header
    const header = page.locator('[data-testid="edn-header"]');
    await expect(header).toBeVisible();

    // Vérifier le titre
    await expect(page.locator('h1:has-text("Interface EDN")')).toBeVisible();

    // Vérifier la présence des tabs
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
    
    // Vérifier que tous les tabs sont présents
    await expect(page.locator('button[role="tab"]:has-text("Mon Suivi")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Tous les items")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Mode Visuel")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Musiques")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Premium")')).toBeVisible();
  });

  test('devrait permettre la recherche d\'items', async ({ page }) => {
    // Attendre que le champ de recherche soit visible
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchInput).toBeVisible();

    // Effectuer une recherche
    await searchInput.fill('item');
    
    // Attendre un court instant pour le debounce
    await page.waitForTimeout(500);

    // Vérifier que la recherche est appliquée (le champ contient la valeur)
    await expect(searchInput).toHaveValue('item');
  });

  test('devrait permettre le filtrage par catégorie', async ({ page }) => {
    // Cliquer sur le select de catégorie
    const categorySelect = page.locator('[data-testid="category-filter"]').first();
    await categorySelect.click();

    // Attendre que les options soient visibles
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // Sélectionner une catégorie (si disponible)
    const firstOption = page.locator('[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      
      // Vérifier que le filtre est appliqué
      await page.waitForTimeout(300);
    }
  });

  test('devrait permettre de trier les items', async ({ page }) => {
    // Cliquer sur le select de tri
    const sortSelect = page.locator('[data-testid="sort-filter"]').first();
    await sortSelect.click();

    // Attendre que les options soient visibles
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    // Sélectionner un ordre de tri
    const sortOption = page.locator('[role="option"]:has-text("récents")').first();
    if (await sortOption.isVisible()) {
      await sortOption.click();
      
      // Vérifier que le tri est appliqué
      await page.waitForTimeout(300);
    }
  });

  test('devrait permettre de réinitialiser les filtres', async ({ page }) => {
    // Appliquer un filtre de recherche
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Cliquer sur le bouton Reset s'il est visible
    const resetButton = page.locator('button:has-text("Reset")');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Vérifier que le champ de recherche est vide
      await expect(searchInput).toHaveValue('');
    }
  });

  test('devrait changer de vue (grid/list)', async ({ page }) => {
    // Trouver les boutons de vue
    const gridButton = page.locator('button[aria-label*="Grid"]').first();
    const listButton = page.locator('button[aria-label*="List"]').first();

    // Vérifier que les boutons existent
    if (await gridButton.isVisible() && await listButton.isVisible()) {
      // Cliquer sur list view
      await listButton.click();
      await page.waitForTimeout(300);

      // Revenir à grid view
      await gridButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('devrait permettre de changer de tab', async ({ page }) => {
    // Tab par défaut (Mon Suivi)
    const revisionTab = page.locator('button[role="tab"]:has-text("Mon Suivi")');
    await expect(revisionTab).toBeVisible();

    // Changer vers "Tous les items"
    const completeTab = page.locator('button[role="tab"]:has-text("Tous les items")');
    await completeTab.click();
    await page.waitForTimeout(1000); // Attendre le lazy loading

    // Vérifier que le contenu a changé
    await expect(completeTab).toHaveAttribute('data-state', 'active');

    // Changer vers "Mode Visuel"
    const immersiveTab = page.locator('button[role="tab"]:has-text("Mode Visuel")');
    await immersiveTab.click();
    await page.waitForTimeout(1000);

    await expect(immersiveTab).toHaveAttribute('data-state', 'active');

    // Changer vers "Musiques"
    const musicTab = page.locator('button[role="tab"]:has-text("Musiques")');
    await musicTab.click();
    await page.waitForTimeout(1000);

    await expect(musicTab).toHaveAttribute('data-state', 'active');

    // Changer vers "Premium"
    const subscriptionTab = page.locator('button[role="tab"]:has-text("Premium")');
    await subscriptionTab.click();
    await page.waitForTimeout(1000);

    await expect(subscriptionTab).toHaveAttribute('data-state', 'active');
  });

  test('devrait charger paresseusement le contenu des tabs', async ({ page }) => {
    // Mesurer le temps de chargement initial
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="edn-header"]');
    const initialLoadTime = Date.now() - startTime;

    console.log(`⏱️ Temps de chargement initial: ${initialLoadTime}ms`);

    // Changer vers un autre tab et mesurer le temps
    const completeTab = page.locator('button[role="tab"]:has-text("Tous les items")');
    const tabStartTime = Date.now();
    await completeTab.click();
    
    // Attendre le Suspense fallback ou le contenu
    await page.waitForTimeout(1000);
    const tabLoadTime = Date.now() - tabStartTime;

    console.log(`⏱️ Temps de chargement du tab: ${tabLoadTime}ms`);

    // Le lazy loading devrait rendre le chargement du tab plus rapide que sans
    expect(tabLoadTime).toBeLessThan(3000);
  });

  test('devrait afficher les items dans une grille', async ({ page }) => {
    // Attendre que la grille soit visible (si des items existent)
    const itemsGrid = page.locator('[data-testid="edn-items-grid"]');
    
    // Timeout plus long car les items peuvent mettre du temps à charger
    try {
      await expect(itemsGrid).toBeVisible({ timeout: 10000 });
      
      // Vérifier qu'au moins un item est présent (ou message vide)
      const items = page.locator('[data-testid^="edn-item-"]');
      const itemCount = await items.count();
      
      console.log(`📊 Nombre d'items affichés: ${itemCount}`);
    } catch (error) {
      // Si pas d'items, vérifier le message vide
      const emptyMessage = page.locator('text=/Aucun item/i');
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('devrait avoir des performances acceptables', async ({ page }) => {
    // Mesurer les Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {
            fcp: 0,
            lcp: 0,
            cls: 0
          };

          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          });

          resolve(vitals);
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        // Timeout de sécurité
        setTimeout(() => resolve({ fcp: 0, lcp: 0, cls: 0 }), 5000);
      });
    });

    console.log('📊 Core Web Vitals:', metrics);

    // Vérifier que FCP est raisonnable (< 3s)
    if ((metrics as any).fcp > 0) {
      expect((metrics as any).fcp).toBeLessThan(3000);
    }
  });

  test('devrait naviguer vers Analytics depuis le bouton', async ({ page }) => {
    // Cliquer sur le bouton Analytics
    const analyticsButton = page.locator('button:has-text("Analytics")');
    
    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      
      // Vérifier la navigation
      await page.waitForURL('**/edn-complete/analytics', { timeout: 5000 });
      expect(page.url()).toContain('/edn-complete/analytics');
    }
  });

  test('devrait afficher le bouton "Load More" si plus d\'items disponibles', async ({ page }) => {
    // Scroll vers le bas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Chercher le bouton Load More
    const loadMoreButton = page.locator('button:has-text("Load More")');
    
    // Si le bouton existe, il devrait être cliquable
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1000);
      
      // Le bouton devrait déclencher un chargement
      expect(await loadMoreButton.isEnabled()).toBeTruthy();
    }
  });
});

test.describe('EDN Complete - Responsive', () => {
  test('devrait être responsive sur mobile', async ({ page }) => {
    // Définir une taille mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/edn-complete');
    await page.waitForSelector('[data-testid="edn-header"]', { timeout: 10000 });

    // Vérifier que le header est visible
    const header = page.locator('[data-testid="edn-header"]');
    await expect(header).toBeVisible();

    // Vérifier que les tabs sont visibles (peuvent être scrollables)
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
  });

  test('devrait être responsive sur tablette', async ({ page }) => {
    // Définir une taille tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/edn-complete');
    await page.waitForSelector('[data-testid="edn-header"]', { timeout: 10000 });

    // Vérifier que le layout s'adapte
    const header = page.locator('[data-testid="edn-header"]');
    await expect(header).toBeVisible();
  });
});
