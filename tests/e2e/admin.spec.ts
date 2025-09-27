import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin user authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: { 
          id: '123', 
          email: 'admin@med-mng.fr',
          user_metadata: { role: ['admin'] }
        }
      }));
    });
    
    await page.goto('/admin');
  });

  test('should display admin dashboard for authorized users', async ({ page }) => {
    await expect(page).toHaveTitle(/Admin.*MED-MNG/);
    await expect(page.getByRole('heading', { name: /dashboard administrateur/i })).toBeVisible();
    
    // Check main metrics cards
    await expect(page.getByText(/utilisateurs actifs/i)).toBeVisible();
    await expect(page.getByText(/générations musicales/i)).toBeVisible();
    await expect(page.getByText(/erreurs système/i)).toBeVisible();
  });

  test('should navigate between admin sections', async ({ page }) => {
    // Test navigation to monitoring
    await page.click('a[href="/admin/monitoring"]');
    await expect(page).toHaveURL(/\/admin\/monitoring/);
    await expect(page.getByText(/surveillance système/i)).toBeVisible();
    
    // Test navigation to security
    await page.click('text=Sécurité');
    await expect(page.getByText(/audit de sécurité/i)).toBeVisible();
  });

  test('should display system metrics correctly', async ({ page }) => {
    // Mock metrics API
    await page.route('**/rest/v1/system_metrics*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          active_users: 150,
          total_generations: 1250,
          system_errors: 3,
          uptime: 99.9
        })
      });
    });

    await page.reload();
    
    await expect(page.getByText('150')).toBeVisible(); // Active users
    await expect(page.getByText('1,250')).toBeVisible(); // Total generations
    await expect(page.getByText('99.9%')).toBeVisible(); // Uptime
  });

  test('should handle security audit', async ({ page }) => {
    await page.click('text=Audit de Sécurité');
    
    // Mock audit results
    await page.route('**/functions/v1/security-audit', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          score: 95,
          issues: [
            { severity: 'medium', message: 'Configuration à optimiser' }
          ],
          recommendations: [
            'Mettre à jour les en-têtes de sécurité'
          ]
        })
      });
    });
    
    await page.click('button:has-text("Lancer l\'audit")');
    
    await expect(page.getByText(/score.*95/i)).toBeVisible();
    await expect(page.getByText(/configuration à optimiser/i)).toBeVisible();
  });

  test('should manage user accounts', async ({ page }) => {
    await page.click('text=Utilisateurs');
    
    // Mock users list
    await page.route('**/rest/v1/profiles*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            email: 'user@example.com',
            created_at: new Date().toISOString(),
            subscription_type: 'premium'
          }
        ])
      });
    });

    await page.reload();
    
    await expect(page.getByText('user@example.com')).toBeVisible();
    await expect(page.getByText('Premium')).toBeVisible();
  });

  test('should handle system maintenance mode', async ({ page }) => {
    await page.click('text=Maintenance');
    
    const maintenanceToggle = page.getByTestId('maintenance-toggle');
    await expect(maintenanceToggle).toBeVisible();
    
    // Toggle maintenance mode
    await maintenanceToggle.click();
    
    await expect(page.getByText(/mode maintenance activé/i)).toBeVisible();
  });

  test('should export system reports', async ({ page }) => {
    await page.click('text=Rapports');
    
    // Mock report generation
    await page.route('**/functions/v1/generate-report', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report_url: 'https://example.com/report.pdf'
        })
      });
    });
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter PDF")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('med-mng-report.pdf');
  });

  test('should deny access to non-admin users', async ({ page }) => {
    // Mock non-admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-user-token',
        user: { 
          id: '456', 
          email: 'user@med-mng.fr',
          user_metadata: { role: ['user'] }
        }
      }));
    });
    
    await page.goto('/admin');
    
    await expect(page.getByText(/accès administrateur requis/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /dashboard administrateur/i })).not.toBeVisible();
  });
});