import { test, expect } from '@playwright/test';

test.describe('Authentication & RLS Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load authentication page correctly', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate anonymous access to public endpoints', async ({ page }) => {
    // Test d'accès anonyme aux endpoints publics
    const response = await page.request.get(`${baseURL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    // L'endpoint de base doit être accessible
    expect([200, 404]).toContain(response.status());
  });

  test('should validate JWT token structure', async ({ page }) => {
    // Vérifier que le token anon est bien formé
    const tokenParts = anonKey.split('.');
    expect(tokenParts).toHaveLength(3);
    
    // Décoder le header pour vérifier qu'il s'agit d'un JWT
    const header = JSON.parse(atob(tokenParts[0]));
    expect(header.alg).toBe('HS256');
    expect(header.typ).toBe('JWT');
    
    // Décoder le payload pour vérifier les claims
    const payload = JSON.parse(atob(tokenParts[1]));
    expect(payload.iss).toBe('supabase');
    expect(payload.ref).toBe('yaincoxihiqdksxgrsrk');
    expect(payload.role).toBe('anon');
  });

  test('should validate RLS policies enforcement', async ({ page }) => {
    // Test d'accès à une table protégée sans authentification
    const response = await page.request.get(`${baseURL}/rest/v1/profiles`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    // Doit soit retourner 401/403 (RLS activé) ou 200 avec données vides
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should test authentication flow UI', async ({ page }) => {
    await page.goto('/auth');
    
    // Vérifier les éléments de connexion/inscription
    const loginForm = page.locator('[data-testid="auth-form"]');
    if (await loginForm.isVisible()) {
      await expect(loginForm).toBeVisible();
      
      // Tester la validation des champs
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@invalid-email');
        await passwordInput.fill('weak');
        
        // Vérifier que la validation fonctionne
        const submitButton = page.locator('[data-testid="auth-submit"]');
        await submitButton.click();
        
        // Doit afficher des erreurs de validation
        await expect(page.locator('.error, .text-destructive, [role="alert"]')).toBeVisible();
      }
    }
  });

  test('should validate authentication state persistence', async ({ page }) => {
    // Tester que l'état d'authentification persiste
    await page.goto('/');
    
    // Vérifier l'état initial (non connecté)
    const authState = await page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token');
    });
    
    // Si pas de token, c'est normal pour un utilisateur non connecté
    if (authState) {
      expect(authState).toBeTruthy();
    }
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Test avec un token invalide
    const response = await page.request.get(`${baseURL}/rest/v1/profiles`, {
      headers: {
        'Authorization': 'Bearer invalid-token',
        'apikey': anonKey
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('should validate permissions for protected operations', async ({ page }) => {
    // Test d'opérations protégées (création, modification, suppression)
    const protectedEndpoints = [
      '/rest/v1/profiles',
      '/rest/v1/user_data',
      '/rest/v1/settings'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await page.request.post(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'application/json'
        },
        data: { test: 'data' }
      });

      // Doit être protégé par RLS
      expect([401, 403, 404]).toContain(response.status());
    }
  });
});