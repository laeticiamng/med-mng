import { test, expect } from '@playwright/test';
import { lighthouse, playAudit } from 'playwright-lighthouse';

test.describe('Performance Tests - Frontend', () => {
  test.beforeEach(async ({ page }) => {
    // Warm up the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Page Load Performance - Homepage', async ({ page }) => {
    const startTime = Date.now();
    
    // Mesurer le temps de chargement initial
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`🏠 Homepage load time: ${loadTime}ms`);
    
    // Vérifier que le chargement est sous 3 secondes
    expect(loadTime).toBeLessThan(3000);
    
    // Vérifier que les éléments critiques sont présents
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Page Load Performance - Admin Dashboard', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin-center', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Admin Dashboard load time: ${loadTime}ms`);
    
    // Dashboard plus complexe = temps un peu plus long autorisé
    expect(loadTime).toBeLessThan(5000);
    
    // Vérifier les composants du dashboard
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('Lighthouse Performance Audit - Homepage', async ({ page, browser }) => {
    const context = await browser.newContext();
    const page2 = await context.newPage();
    
    await page2.goto('/');
    
    // Audit Lighthouse
    const { lhr } = await lighthouse(page2.url(), {
      port: 9222,
      output: 'json',
      logLevel: 'info',
      onlyCategories: ['performance'],
    });

    console.log(`🔍 Lighthouse Performance Score: ${lhr.categories.performance.score * 100}`);
    
    // Score de performance minimum : 80/100
    expect(lhr.categories.performance.score).toBeGreaterThan(0.8);
    
    // Métriques spécifiques
    const firstContentfulPaint = lhr.audits['first-contentful-paint'].numericValue;
    const largestContentfulPaint = lhr.audits['largest-contentful-paint'].numericValue;
    const cumulativeLayoutShift = lhr.audits['cumulative-layout-shift'].numericValue;
    
    console.log(`📈 First Contentful Paint: ${firstContentfulPaint}ms`);
    console.log(`📈 Largest Contentful Paint: ${largestContentfulPaint}ms`);
    console.log(`📈 Cumulative Layout Shift: ${cumulativeLayoutShift}`);
    
    // Seuils Web Vitals
    expect(firstContentfulPaint).toBeLessThan(1800);  // < 1.8s
    expect(largestContentfulPaint).toBeLessThan(2500); // < 2.5s
    expect(cumulativeLayoutShift).toBeLessThan(0.1);   // < 0.1
    
    await context.close();
  });

  test('Bundle Size Analysis', async ({ page }) => {
    // Intercepter les requêtes pour analyser la taille des bundles
    const resourceSizes: { [key: string]: number } = {};
    
    page.on('response', async (response) => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      
      if (url.includes('.js') || url.includes('.css')) {
        resourceSizes[url] = contentLength ? parseInt(contentLength) : 0;
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyser les tailles
    const totalJS = Object.entries(resourceSizes)
      .filter(([url]) => url.includes('.js'))
      .reduce((sum, [, size]) => sum + size, 0);
      
    const totalCSS = Object.entries(resourceSizes)
      .filter(([url]) => url.includes('.css'))
      .reduce((sum, [, size]) => sum + size, 0);
    
    console.log(`📦 Total JS size: ${(totalJS / 1024).toFixed(2)} KB`);
    console.log(`🎨 Total CSS size: ${(totalCSS / 1024).toFixed(2)} KB`);
    
    // Limites de taille des bundles
    expect(totalJS).toBeLessThan(500 * 1024); // JS < 500KB
    expect(totalCSS).toBeLessThan(100 * 1024); // CSS < 100KB
  });

  test('Memory Usage Test', async ({ page }) => {
    // Tester l'utilisation mémoire pendant la navigation
    await page.goto('/');
    
    // Naviguer entre plusieurs pages pour tester les fuites mémoire
    const pages = ['/', '/admin-center', '/', '/admin-center'];
    
    for (const route of pages) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // Mesurer l'utilisation mémoire (approximative)
    const jsHeap = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    console.log(`🧠 JS Heap size: ${(jsHeap / 1024 / 1024).toFixed(2)} MB`);
    
    // Limite mémoire JS : 50MB
    expect(jsHeap).toBeLessThan(50 * 1024 * 1024);
  });

  test('Image Loading Performance', async ({ page }) => {
    const imageLoadTimes: number[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) {
        const timing = response.timing();
        imageLoadTimes.push(timing.responseEnd - timing.requestStart);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    if (imageLoadTimes.length > 0) {
      const avgImageLoadTime = imageLoadTimes.reduce((a, b) => a + b, 0) / imageLoadTimes.length;
      console.log(`🖼️ Average image load time: ${avgImageLoadTime.toFixed(2)}ms`);
      
      // Temps de chargement moyen des images < 1s
      expect(avgImageLoadTime).toBeLessThan(1000);
    }
  });

  test('JavaScript Execution Performance', async ({ page }) => {
    await page.goto('/');
    
    // Mesurer le temps d'exécution JS pour des actions courantes
    const startTime = await page.evaluate(() => performance.now());
    
    // Simuler des interactions utilisateur
    await page.click('button').catch(() => {}); // Ignorer si pas de bouton
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const endTime = await page.evaluate(() => performance.now());
    const executionTime = endTime - startTime;
    
    console.log(`⚡ JS execution time: ${executionTime.toFixed(2)}ms`);
    
    // L'exécution JS doit être fluide < 100ms
    expect(executionTime).toBeLessThan(100);
  });
});