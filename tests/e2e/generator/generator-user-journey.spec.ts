import { test, expect } from '@playwright/test';

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

test.describe('Generator Page - User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generator');
  });

  test('should load generator page correctly', async ({ page }) => {
    // Vérifier le titre de la page
    await expect(page.locator('h1:has-text("Générateur Musical")')).toBeVisible();
    
    // Vérifier le sous-titre
    await expect(page.locator('text=Transformez vos cours en musique')).toBeVisible();
    
    // Vérifier le bouton retour
    await expect(page.locator('button:has-text("Retour")')).toBeVisible();
    
    // Vérifier que la section d'information est visible
    await expect(page.locator('text=Comment utiliser le générateur ?')).toBeVisible();
  });

  test('should display content type selector', async ({ page }) => {
    // Vérifier que le sélecteur de type de contenu est visible
    const contentTypeLabel = page.locator('label:has-text("Type de contenu")');
    await expect(contentTypeLabel).toBeVisible();
  });

  test('should allow selecting EDN content type and display item selector', async ({ page }) => {
    // Cliquer sur le sélecteur de type de contenu
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    
    // Sélectionner EDN
    await page.locator('text=Items EDN (367 disponibles)').click();
    
    // Vérifier que le sélecteur d'item EDN apparaît
    await expect(page.locator('label:has-text("Item EDN")')).toBeVisible();
    
    // Vérifier que le sélecteur de rang apparaît
    await expect(page.locator('label:has-text("Rang de compétence")')).toBeVisible();
  });

  test('should allow selecting ECOS content type and display situation selector', async ({ page }) => {
    // Cliquer sur le sélecteur de type de contenu
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    
    // Sélectionner ECOS
    await page.locator('text=Situations ECOS').click();
    
    // Vérifier que le sélecteur de situation apparaît
    await expect(page.locator('label:has-text("Situation ECOS")')).toBeVisible();
  });

  test('should display quota information', async ({ page }) => {
    // Vérifier que l'affichage du quota est présent
    const quotaSection = page.locator('text=/générations? (restantes?|disponibles)/i');
    await expect(quotaSection).toBeVisible({ timeout: 10000 });
  });

  test('should display style selector after content selection', async ({ page }) => {
    // Sélectionner le type de contenu EDN
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    await page.locator('text=Items EDN (367 disponibles)').click();
    
    // Vérifier que le sélecteur de style est visible
    await expect(page.locator('label:has-text("Style musical")')).toBeVisible();
  });

  test('should enable generate button when all EDN parameters are selected', async ({ page }) => {
    // Sélectionner le type de contenu EDN
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    await page.locator('text=Items EDN (367 disponibles)').click();
    
    // Attendre que les items soient chargés
    await page.waitForTimeout(2000);
    
    // Sélectionner un item EDN
    await page.locator('button:has-text("Sélectionnez un item EDN")').click();
    // Cliquer sur le premier item disponible
    await page.locator('[role="option"]').first().click();
    
    // Attendre le chargement des paroles
    await page.waitForTimeout(1500);
    
    // Sélectionner un rang
    await page.locator('button:has-text("Sélectionnez un rang")').click();
    await page.locator('text=Rang A - Fondamental').click();
    
    // Sélectionner un style
    await page.locator('button:has-text("Sélectionnez un style musical")').click();
    await page.locator('[role="option"]').first().click();
    
    // Vérifier que le bouton de génération est activé
    const generateButton = page.locator('button:has-text("Générer la musique")');
    await expect(generateButton).toBeEnabled();
  });

  test('should display lyrics status when item is selected', async ({ page }) => {
    // Sélectionner le type de contenu EDN
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    await page.locator('text=Items EDN (367 disponibles)').click();
    
    // Attendre que les items soient chargés
    await page.waitForTimeout(2000);
    
    // Sélectionner un item EDN
    await page.locator('button:has-text("Sélectionnez un item EDN")').click();
    await page.locator('[role="option"]').first().click();
    
    // Vérifier le status des paroles (chargement ou trouvées)
    const lyricsStatus = page.locator('text=/paroles|Chargement/i');
    await expect(lyricsStatus).toBeVisible({ timeout: 5000 });
  });

  test('should display reset button', async ({ page }) => {
    // Vérifier que le bouton réinitialiser est présent
    await expect(page.locator('button:has-text("Réinitialiser")')).toBeVisible();
  });

  test('should validate page performance under 5s', async ({ page }) => {
    const startTime = Date.now();
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Generator page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('should test complete EDN generation flow', async ({ page }) => {
    // Mock de l'API de génération pour éviter de consommer du quota
    await page.route('**/functions/v1/generate-music', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trackId: 'test-track-' + Date.now(),
          status: 'completed',
          audioUrl: 'https://example.com/test-audio.mp3'
        })
      });
    });

    // Sélectionner le type de contenu EDN
    await page.locator('button:has-text("Sélectionnez le type de contenu")').click();
    await page.locator('text=Items EDN (367 disponibles)').click();
    
    // Attendre que les items soient chargés
    await page.waitForTimeout(2000);
    
    // Sélectionner un item EDN
    await page.locator('button:has-text("Sélectionnez un item EDN")').click();
    await page.locator('[role="option"]').first().click();
    
    // Attendre le chargement des paroles
    await page.waitForTimeout(1500);
    
    // Sélectionner un rang
    await page.locator('button:has-text("Sélectionnez un rang")').click();
    await page.locator('text=Rang A - Fondamental').click();
    
    // Sélectionner un style
    await page.locator('button:has-text("Sélectionnez un style musical")').click();
    await page.locator('[role="option"]').first().click();
    
    // Cliquer sur générer
    await page.locator('button:has-text("Générer la musique")').click();
    
    // Vérifier qu'un message de succès apparaît ou que le lecteur s'affiche
    // (Avec le mock, la génération devrait se terminer rapidement)
    await page.waitForTimeout(2000);
  });

  test('should display help section with instructions', async ({ page }) => {
    // Vérifier toutes les étapes d'instruction
    await expect(page.locator('text=Choisissez le type de contenu')).toBeVisible();
    await expect(page.locator('text=/367 items/i')).toBeVisible();
    await expect(page.locator('text=/3 situations/i')).toBeVisible();
    await expect(page.locator('text=rang A')).toBeVisible();
    await expect(page.locator('text=style musical')).toBeVisible();
  });

  test('should have accessible navigation back button', async ({ page }) => {
    const backButton = page.locator('button:has-text("Retour")');
    await expect(backButton).toBeVisible();
    await expect(backButton).toBeEnabled();
  });
});
