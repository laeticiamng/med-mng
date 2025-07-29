import { test, expect } from '@playwright/test';

test.describe('Performance Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/monitoring');
  });

  test('should load performance analytics dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Performance Analytics');
    await expect(page.locator('[data-testid="performance-score"]')).toBeVisible();
  });

  test('should display web vitals metrics', async ({ page }) => {
    await page.click('[data-value="web-vitals"]');
    await expect(page.locator('[data-testid="lcp-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="fid-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="cls-metric"]')).toBeVisible();
    await expect(page.locator('[data-testid="ttfb-metric"]')).toBeVisible();
  });

  test('should allow creating performance budget', async ({ page }) => {
    await page.click('[data-value="budgets"]');
    await page.click('text=Nouveau Budget');
    
    await page.fill('[data-testid="budget-name"]', 'Test Budget LCP');
    await page.selectOption('[data-testid="metric-type"]', 'web_vital');
    await page.selectOption('[data-testid="metric-name"]', 'LCP');
    await page.fill('[data-testid="target-value"]', '2500');
    await page.fill('[data-testid="warning-threshold"]', '3000');
    await page.fill('[data-testid="critical-threshold"]', '4000');
    
    await page.click('text=Créer');
    await expect(page.locator('text=Budget créé')).toBeVisible();
  });

  test('should refresh analytics data', async ({ page }) => {
    const refreshButton = page.locator('[data-testid="refresh-button"]');
    await refreshButton.click();
    
    // Vérifier que le loading state est affiché
    await expect(refreshButton.locator('.animate-spin')).toBeVisible();
    
    // Attendre que le loading soit terminé
    await expect(refreshButton.locator('.animate-spin')).not.toBeVisible();
  });

  test('should handle period change', async ({ page }) => {
    await page.selectOption('[data-testid="period-selector"]', '7d');
    await expect(page.locator('[data-testid="period-selector"]')).toHaveValue('7d');
    
    // Vérifier que les données sont rechargées
    await page.waitForLoadState('networkidle');
  });
});

test.describe('SLA Metrics', () => {
  test('should display SLA status correctly', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="sla"]');
    
    await expect(page.locator('[data-testid="sla-metrics"]')).toBeVisible();
    
    // Vérifier que les métriques SLA sont affichées
    const slaCards = page.locator('[data-testid="sla-card"]');
    await expect(slaCards.first()).toBeVisible();
  });

  test('should calculate SLA metrics', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="sla"]');
    
    await page.click('text=Recalculer SLA');
    await expect(page.locator('text=SLA calculés')).toBeVisible();
  });
});

test.describe('Performance Alerts', () => {
  test('should display alerts panel', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="alerts"]');
    
    await expect(page.locator('[data-testid="alerts-panel"]')).toBeVisible();
  });

  test('should acknowledge alert', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="alerts"]');
    
    const acknowledgeButton = page.locator('text=Acquitter').first();
    if (await acknowledgeButton.isVisible()) {
      await acknowledgeButton.click();
      await expect(page.locator('text=Alerte acquittée')).toBeVisible();
    }
  });

  test('should resolve alert', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="alerts"]');
    
    const resolveButton = page.locator('text=Résoudre').first();
    if (await resolveButton.isVisible()) {
      await resolveButton.click();
      await expect(page.locator('text=Alerte résolue')).toBeVisible();
    }
  });
});

test.describe('Performance Trends', () => {
  test('should display trends chart', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="trends"]');
    
    await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
    await expect(page.locator('.recharts-wrapper')).toBeVisible();
  });

  test('should handle different time periods', async ({ page }) => {
    await page.goto('/monitoring');
    await page.click('[data-value="trends"]');
    
    // Tester différentes périodes
    const periods = ['1h', '24h', '7d', '30d'];
    
    for (const period of periods) {
      await page.selectOption('[data-testid="period-selector"]', period);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
    }
  });
});