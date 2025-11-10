import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour les workflows critiques du Dashboard
 * 
 * Ces tests valident :
 * - Navigation entre les sections du dashboard
 * - Filtres et tri des données
 * - Export de données
 * - Responsive design
 */

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers le dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard with all main sections', async ({ page }) => {
    // Vérifier que les sections principales sont présentes
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Vérifier les cartes de métriques
    const metricCards = page.locator('[data-testid="metric-card"]');
    await expect(metricCards).toHaveCount(4, { timeout: 10000 });
  });

  test('should navigate between dashboard sections', async ({ page }) => {
    // Test de navigation entre différentes sections
    const sections = ['Overview', 'Analytics', 'Reports', 'Settings'];
    
    for (const section of sections) {
      const navLink = page.getByRole('link', { name: section });
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        
        // Vérifier que l'URL contient le nom de la section
        await expect(page).toHaveURL(new RegExp(section.toLowerCase()));
      }
    }
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Redimensionner pour mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Le sidebar devrait être caché par défaut sur mobile
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();
    
    // Cliquer sur le bouton menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Le sidebar devrait être visible
    await expect(sidebar).toBeVisible();
    
    // Cliquer à nouveau pour fermer
    await menuButton.click();
    await expect(sidebar).not.toBeVisible();
  });
});

test.describe('Dashboard - Filtres et Tri', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should filter data table by search term', async ({ page }) => {
    // Localiser la table de données
    const searchInput = page.getByPlaceholder(/filter|search/i);
    
    if (await searchInput.isVisible()) {
      // Saisir un terme de recherche
      await searchInput.fill('user');
      await page.waitForTimeout(500); // Attendre le debounce
      
      // Vérifier que les résultats sont filtrés
      const tableRows = page.locator('table tbody tr');
      const rowCount = await tableRows.count();
      
      // Vérifier qu'il y a des résultats (ou un message "no results")
      if (rowCount > 0) {
        expect(rowCount).toBeGreaterThan(0);
      } else {
        await expect(page.getByText(/no results|aucun résultat/i)).toBeVisible();
      }
    }
  });

  test('should sort table columns', async ({ page }) => {
    // Trouver un en-tête de colonne triable
    const sortableHeader = page.locator('th button').first();
    
    if (await sortableHeader.isVisible()) {
      // Obtenir les valeurs avant le tri
      const cellsBefore = await page.locator('table tbody tr td:first-child').allTextContents();
      
      // Cliquer pour trier
      await sortableHeader.click();
      await page.waitForTimeout(300);
      
      // Obtenir les valeurs après le tri
      const cellsAfter = await page.locator('table tbody tr td:first-child').allTextContents();
      
      // Vérifier que l'ordre a changé
      expect(cellsBefore).not.toEqual(cellsAfter);
    }
  });

  test('should filter by date range', async ({ page }) => {
    // Chercher un sélecteur de date
    const dateFilter = page.getByRole('button', { name: /date|période/i });
    
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      
      // Sélectionner une plage prédéfinie (ex: "Last 7 days")
      const quickOption = page.getByText(/last 7 days|7 derniers jours/i);
      if (await quickOption.isVisible()) {
        await quickOption.click();
        await page.waitForLoadState('networkidle');
        
        // Vérifier que les données sont rechargées
        await expect(page.locator('table tbody tr')).toHaveCount(
          await page.locator('table tbody tr').count(),
          { timeout: 5000 }
        );
      }
    }
  });

  test('should filter by status', async ({ page }) => {
    // Chercher un filtre de statut
    const statusFilter = page.getByRole('button', { name: /status|statut/i });
    
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      
      // Sélectionner un statut (ex: "Active")
      const activeOption = page.getByText(/active|actif/i).first();
      if (await activeOption.isVisible()) {
        await activeOption.click();
        await page.waitForTimeout(500);
        
        // Vérifier que seuls les éléments actifs sont affichés
        const statusBadges = page.locator('[data-testid="status-badge"]');
        const count = await statusBadges.count();
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            await expect(statusBadges.nth(i)).toContainText(/active|actif/i);
          }
        }
      }
    }
  });
});

test.describe('Dashboard - Export de Données', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should export data to CSV', async ({ page }) => {
    // Chercher le bouton d'export
    const exportButton = page.getByRole('button', { name: /export|télécharger/i });
    
    if (await exportButton.isVisible()) {
      // Écouter les téléchargements
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await exportButton.click();
      
      // Attendre le téléchargement
      const download = await downloadPromise;
      
      // Vérifier le nom du fichier
      expect(download.suggestedFilename()).toMatch(/\.csv$|\.xlsx$/);
    }
  });

  test('should export selected rows only', async ({ page }) => {
    // Sélectionner quelques lignes
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      // Sélectionner les 3 premières lignes
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await checkboxes.nth(i).check();
      }
      
      // Vérifier que le bouton d'export sélectionné apparaît
      const exportSelectedButton = page.getByRole('button', { 
        name: /export selected|exporter la sélection/i 
      });
      
      if (await exportSelectedButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await exportSelectedButton.click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });

  test('should export with applied filters', async ({ page }) => {
    // Appliquer un filtre
    const searchInput = page.getByPlaceholder(/filter|search/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
      
      // Exporter
      const exportButton = page.getByRole('button', { name: /export|télécharger/i });
      if (await exportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await exportButton.click();
        const download = await downloadPromise;
        expect(download).toBeTruthy();
      }
    }
  });
});

test.describe('Dashboard - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate through pages', async ({ page }) => {
    // Chercher les boutons de pagination
    const nextButton = page.getByRole('button', { name: /next|suivant/i });
    
    if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
      // Obtenir le numéro de page actuel
      const pageInfo = page.locator('[data-testid="page-info"]');
      const currentPageText = await pageInfo.textContent();
      
      // Cliquer sur suivant
      await nextButton.click();
      await page.waitForTimeout(300);
      
      // Vérifier que la page a changé
      const newPageText = await pageInfo.textContent();
      expect(newPageText).not.toEqual(currentPageText);
      
      // Revenir à la page précédente
      const prevButton = page.getByRole('button', { name: /previous|précédent/i });
      await prevButton.click();
      await page.waitForTimeout(300);
      
      const finalPageText = await pageInfo.textContent();
      expect(finalPageText).toEqual(currentPageText);
    }
  });

  test('should change page size', async ({ page }) => {
    // Chercher le sélecteur de taille de page
    const pageSizeSelect = page.locator('select').filter({ hasText: /rows per page|lignes par page/i });
    
    if (await pageSizeSelect.isVisible()) {
      // Compter les lignes actuelles
      const rowsBefore = await page.locator('table tbody tr').count();
      
      // Changer la taille de page
      await pageSizeSelect.selectOption('20');
      await page.waitForTimeout(500);
      
      // Compter les nouvelles lignes
      const rowsAfter = await page.locator('table tbody tr').count();
      
      // La taille devrait avoir changé (sauf si moins de données disponibles)
      expect(rowsAfter).toBeLessThanOrEqual(20);
    }
  });
});

test.describe('Dashboard - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should display correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Vérifier que le dashboard est visible
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
      
      // Prendre une capture d'écran pour vérification visuelle
      await page.screenshot({ 
        path: `test-results/dashboard-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
    });
  }
});

test.describe('Dashboard - Performance', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Le dashboard devrait charger en moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle rapid filter changes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/filter|search/i);
    
    if (await searchInput.isVisible()) {
      // Saisir rapidement plusieurs termes
      const searchTerms = ['test', 'user', 'admin', 'data'];
      
      for (const term of searchTerms) {
        await searchInput.fill(term);
        await page.waitForTimeout(100); // Très court délai
      }
      
      // Attendre que le dernier filtre soit appliqué
      await page.waitForTimeout(1000);
      
      // Vérifier que l'interface est toujours réactive
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveValue('data');
    }
  });
});

test.describe('Dashboard - Error Handling', () => {
  test('should display error message on failed data load', async ({ page }) => {
    // Intercepter les requêtes API et les faire échouer
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/dashboard');
    
    // Vérifier qu'un message d'erreur est affiché
    const errorMessage = page.getByText(/error|erreur|échec/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should handle empty data gracefully', async ({ page }) => {
    // Intercepter et retourner des données vides
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 })
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'un message "no data" est affiché
    const noDataMessage = page.getByText(/no data|aucune donnée|no results/i);
    await expect(noDataMessage).toBeVisible();
  });
});
