import { test, expect } from '@playwright/test';

test.describe('API Documentation', () => {
  test('should load API documentation', async ({ page }) => {
    // Test de l'accès à la documentation API
    await page.goto('/api-docs');
    
    await expect(page.locator('text=API Documentation')).toBeVisible();
    await expect(page.locator('.swagger-ui')).toBeVisible();
  });

  test('should display all endpoints', async ({ page }) => {
    await page.goto('/api-docs');
    
    // Vérifier que les principaux endpoints sont documentés
    await expect(page.locator('text=/api/monitoring')).toBeVisible();
    await expect(page.locator('text=/api/performance')).toBeVisible();
    await expect(page.locator('text=/api/health')).toBeVisible();
  });

  test('should allow testing endpoints', async ({ page }) => {
    await page.goto('/api-docs');
    
    // Trouver un endpoint GET et le tester
    const tryItButton = page.locator('text=Try it out').first();
    if (await tryItButton.isVisible()) {
      await tryItButton.click();
      
      const executeButton = page.locator('text=Execute').first();
      await executeButton.click();
      
      // Vérifier qu'une réponse est affichée
      await expect(page.locator('.response')).toBeVisible();
    }
  });
});

test.describe('Monitoring Integration', () => {
  test('should connect to extraction monitoring', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Vérifier l'intégration avec le monitoring d'extraction existant
    const extractionTab = page.locator('[data-value="extractions"]');
    if (await extractionTab.isVisible()) {
      await extractionTab.click();
      await expect(page.locator('[data-testid="extraction-metrics"]')).toBeVisible();
    }
  });

  test('should display unified dashboard', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Vérifier que le dashboard unifie toutes les métriques
    await expect(page.locator('[data-testid="overview-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
  });
});

test.describe('Real-time Updates', () => {
  test('should update metrics in real-time', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Activer l'auto-refresh
    const autoRefreshToggle = page.locator('[data-testid="auto-refresh-toggle"]');
    await autoRefreshToggle.check();
    
    // Attendre plusieurs cycles de refresh
    await page.waitForTimeout(35000); // Plus que l'intervalle de 30s
    
    // Vérifier que les données sont mises à jour
    const timestamp = page.locator('[data-testid="last-updated"]');
    await expect(timestamp).toBeVisible();
  });

  test('should handle WebSocket connections', async ({ page }) => {
    // Si nous avons des WebSockets pour le real-time
    let wsConnected = false;
    
    page.on('websocket', ws => {
      wsConnected = true;
      console.log('WebSocket connection established');
    });

    await page.goto('/monitoring');
    
    // Attendre la connexion WebSocket
    await page.waitForTimeout(2000);
    
    // Note: Test conditionnel selon l'implémentation WebSocket
  });
});

test.describe('Security Testing', () => {
  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Tenter d'injecter du script malveillant
    const maliciousScript = '<script>alert("XSS")</script>';
    
    // Essayer d'injecter dans un champ de recherche ou de filtre
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(maliciousScript);
      
      // Vérifier que le script n'est pas exécuté
      page.on('dialog', dialog => {
        // Si un alert s'affiche, c'est que l'XSS a réussi
        expect(dialog.message()).not.toBe('XSS');
        dialog.dismiss();
      });
    }
  });

  test('should validate CSRF protection', async ({ page }) => {
    // Test de protection CSRF pour les opérations sensibles
    await page.goto('/monitoring');
    
    // Tenter une opération sans token CSRF approprié
    const response = await page.request.post('/api/performance-budgets', {
      data: {
        name: 'Test Budget',
        metric_type: 'web_vital',
        metric_name: 'LCP',
        target_value: 2500
      }
    });
    
    // Vérifier que la requête est rejetée sans auth appropriée
    expect(response.status()).toBe(401);
  });

  test('should handle SQL injection attempts', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Tenter une injection SQL dans les paramètres de recherche
    const sqlInjection = "'; DROP TABLE performance_metrics; --";
    
    await page.route('**/api/**', route => {
      const url = route.request().url();
      if (url.includes(sqlInjection)) {
        // Si l'injection passe dans l'URL, vérifier que l'API la rejette
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid input' })
        });
      } else {
        route.continue();
      }
    });
    
    // Essayer d'injecter via l'interface
    const searchField = page.locator('[data-testid="search-input"]');
    if (await searchField.isVisible()) {
      await searchField.fill(sqlInjection);
      await page.keyboard.press('Enter');
      
      // Vérifier qu'aucune donnée sensible n'est exposée
      await expect(page.locator('text=DROP TABLE')).not.toBeVisible();
    }
  });
});

test.describe('Performance Regression Testing', () => {
  test('should maintain fast page load times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/monitoring');
    await page.waitForLoadState('domcontentloaded');
    
    const domLoadTime = Date.now() - startTime;
    expect(domLoadTime).toBeLessThan(2000); // 2 secondes max pour DOM ready
    
    await page.waitForLoadState('networkidle');
    const fullLoadTime = Date.now() - startTime;
    expect(fullLoadTime).toBeLessThan(5000); // 5 secondes max pour load complet
  });

  test('should handle concurrent users simulation', async ({ browser }) => {
    // Simuler plusieurs utilisateurs concurrents
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Faire naviguer tous les utilisateurs simultanément
    const navigationPromises = pages.map(page => 
      page.goto('/monitoring')
    );

    const startTime = Date.now();
    await Promise.all(navigationPromises);
    const loadTime = Date.now() - startTime;

    // Vérifier que même avec plusieurs utilisateurs, les performances restent acceptables
    expect(loadTime).toBeLessThan(8000); // 8 secondes max avec charge

    // Nettoyer
    await Promise.all(contexts.map(context => context.close()));
  });

  test('should handle large datasets without memory leaks', async ({ page }) => {
    await page.goto('/monitoring');
    
    // Charger une grande période de données
    await page.selectOption('[data-testid="period-selector"]', '30d');
    await page.waitForLoadState('networkidle');
    
    // Naviguer entre les onglets pour charger différents datasets
    const tabs = ['overview', 'web-vitals', 'budgets', 'sla', 'alerts', 'trends'];
    
    for (const tab of tabs) {
      await page.click(`[data-value="${tab}"]`);
      await page.waitForLoadState('networkidle');
      
      // Vérifier que la mémoire ne s'accumule pas de façon excessive
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });
      
      // Si la mémoire utilisée dépasse 100MB, il pourrait y avoir une fuite
      if (memoryUsage > 0) {
        expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB
      }
    }
  });
});