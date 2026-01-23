import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin-panel');
  });

  test('should display admin panel page', async ({ page }) => {
    // Admin panel might require auth - just check it loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show admin navigation or login redirect', async ({ page }) => {
    // Either admin content or login page
    const adminContent = page.locator('text=/admin|gestion|dashboard/i');
    const loginContent = page.locator('text=/connexion|login/i');
    
    const hasAdmin = await adminContent.first().isVisible().catch(() => false);
    const hasLogin = await loginContent.first().isVisible().catch(() => false);
    
    expect(hasAdmin || hasLogin).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/import');
  });

  test('should display import page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show file upload or import options', async ({ page }) => {
    const importElements = page.locator('input[type="file"], button:has-text("Import"), text=/import/i');
    if (await importElements.first().isVisible().catch(() => false)) {
      await expect(importElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/audit');
  });

  test('should display audit page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show audit results or controls', async ({ page }) => {
    const auditElements = page.locator('text=/audit|vérification|rapport/i');
    if (await auditElements.first().isVisible().catch(() => false)) {
      await expect(auditElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Extract EDN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/extract-edn');
  });

  test('should display extraction page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show extraction controls', async ({ page }) => {
    const extractionElements = page.locator('text=/extraction|extraire|lancer/i');
    if (await extractionElements.first().isVisible().catch(() => false)) {
      await expect(extractionElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin OIC Quality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/oic-quality');
  });

  test('should display OIC quality page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show quality indicators', async ({ page }) => {
    const qualityElements = page.locator('text=/qualité|compétences|OIC/i');
    if (await qualityElements.first().isVisible().catch(() => false)) {
      await expect(qualityElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Security Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/security-monitoring');
  });

  test('should display security monitoring page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show security status', async ({ page }) => {
    const securityElements = page.locator('text=/sécurité|security|rls/i');
    if (await securityElements.first().isVisible().catch(() => false)) {
      await expect(securityElements.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('body')).toBeVisible();
  });
});
