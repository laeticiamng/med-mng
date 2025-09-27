import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/med-mng/login');
    
    await expect(page).toHaveTitle(/MED-MNG.*Login/);
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/mot de passe/i)).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/med-mng/login');
    
    // Test with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/format d'email invalide/i)).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/med-mng/login');
    
    // Mock successful authentication
    await page.route('**/auth/v1/token*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { id: '123', email: 'test@example.com' }
        })
      });
    });
    
    await page.fill('input[type="email"]', 'test@med-mng.fr');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/med-mng\/dashboard/);
  });

  test('should handle logout properly', async ({ page }) => {
    // First login (mocked)
    await page.goto('/med-mng/dashboard');
    
    // Mock logout
    await page.route('**/auth/v1/logout', async route => {
      await route.fulfill({ status: 200 });
    });
    
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Déconnexion');
    
    await expect(page).toHaveURL('/med-mng/login');
  });

  test('should handle signup flow', async ({ page }) => {
    await page.goto('/med-mng/signup');
    
    await expect(page.getByRole('heading', { name: /inscription/i })).toBeVisible();
    
    await page.fill('input[name="email"]', 'newuser@med-mng.fr');
    await page.fill('input[name="password"]', 'securepassword123');
    await page.fill('input[name="confirmPassword"]', 'securepassword123');
    
    // Mock signup success
    await page.route('**/auth/v1/signup', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '456', email: 'newuser@med-mng.fr' }
        })
      });
    });
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/vérifiez votre email/i)).toBeVisible();
  });
});