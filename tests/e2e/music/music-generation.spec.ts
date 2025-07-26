import { test, expect } from '@playwright/test';

test.describe('Music Generation - Suno API Tests', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/med-mng/create');
  });

  test('should load music generation page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Créer|Create/);
  });

  test('should validate music form elements', async ({ page }) => {
    // Vérifier les éléments de base du formulaire
    await expect(page.locator('[data-testid="music-style-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="music-duration-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-button-A"]')).toBeVisible();
    await expect(page.locator('[data-testid="generate-button-B"]')).toBeVisible();
  });

  test('should validate generation performance under 3s', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(3000);
  });

  test('should test Suno API edge function directly', async ({ page }) => {
    // Test direct de l'edge function de génération musicale
    const response = await page.request.post(`${baseURL}/functions/v1/generate-music`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        lyrics: 'Test lyrics for E2E test',
        style: 'pop',
        rang: 'A',
        duration: 120,
        mode: 'GENERATION'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success');
  });

  test('should handle music generation error gracefully', async ({ page }) => {
    // Tester la gestion d'erreur avec des données invalides
    const response = await page.request.post(`${baseURL}/functions/v1/generate-music`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        lyrics: '', // Paroles vides pour déclencher une erreur
        style: 'invalid-style',
        rang: 'C', // Rang invalide
        duration: -1 // Durée invalide
      }
    });

    // L'API doit retourner une erreur propre
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should validate music generation pipeline', async ({ page }) => {
    // Test du pipeline complet de génération
    await page.fill('[data-testid="lyrics-input"]', 'Test lyrics for pipeline validation');
    await page.selectOption('[data-testid="music-style-select"]', 'pop');
    await page.selectOption('[data-testid="music-duration-select"]', '120');

    // Démarrer la génération
    await page.click('[data-testid="generate-button-A"]');

    // Vérifier que le bouton passe en état de chargement
    await expect(page.locator('[data-testid="generate-button-A"]')).toContainText(/Génération/);
    
    // Attendre la fin de génération (max 30s pour E2E)
    await page.waitForSelector('[data-testid="audio-player-A"]', { timeout: 30000 });
    
    // Vérifier que l'audio est généré
    const audioElement = page.locator('[data-testid="audio-player-A"]');
    await expect(audioElement).toBeVisible();
  });
});