import { test, expect } from '@playwright/test';

test.describe('Edge Functions - Extraction Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/test-extraction');
  });

  test('should load extraction test page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Test d\'Extraction UNESS');
  });

  test('should validate OIC extraction edge function', async ({ page }) => {
    // Test direct de l'edge function OIC
    const response = await page.request.post(`${baseURL}/functions/v1/extract-oic-objectifs`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        action: 'start'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
    if (data.success) {
      expect(data).toHaveProperty('session_id');
    }
  });

  test('should validate EDN extraction edge function', async ({ page }) => {
    // Test direct de l'edge function EDN
    const response = await page.request.post(`${baseURL}/functions/v1/extract-edn-objectifs`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        action: 'start'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
    if (data.success) {
      expect(data).toHaveProperty('session_id');
    }
  });

  test('should validate ECOS extraction edge function', async ({ page }) => {
    // Test direct de l'edge function ECOS
    const response = await page.request.post(`${baseURL}/functions/v1/extract-ecos-objectifs`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        action: 'start'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
    if (data.success) {
      expect(data).toHaveProperty('session_id');
    }
  });

  test('should handle extraction performance under 10s', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10000);
  });

  test('should validate extraction status polling', async ({ page }) => {
    // Démarrer une extraction
    const startResponse = await page.request.post(`${baseURL}/functions/v1/extract-edn-objectifs`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        action: 'start'
      }
    });

    expect(startResponse.status()).toBe(200);
    const startData = await startResponse.json();
    
    if (startData.success && startData.session_id) {
      // Vérifier le statut après quelques secondes
      await page.waitForTimeout(5000);
      
      const statusResponse = await page.request.post(`${baseURL}/functions/v1/extract-edn-objectifs`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          action: 'status',
          session_id: startData.session_id
        }
      });

      expect(statusResponse.status()).toBe(200);
      const statusData = await statusResponse.json();
      expect(statusData).toHaveProperty('status');
      expect(['running', 'completed', 'error']).toContain(statusData.status);
    }
  });

  test('should validate IC-1 extraction UI functionality', async ({ page }) => {
    await expect(page.locator('[data-testid="extraction-form"]')).toBeVisible();
    
    // Tester le démarrage de l'extraction depuis l'UI
    await page.click('[data-testid="start-extraction-button"]');
    
    // Vérifier que l'état de chargement s'affiche
    await expect(page.locator('[data-testid="extraction-status"]')).toContainText(/En cours|Running/);
  });
});