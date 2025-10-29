import { test, expect } from '@playwright/test';

/**
 * 🎵 Test E2E - Flow Complet de Génération Musicale
 * 
 * Ce test valide l'intégralité du parcours utilisateur :
 * 1. Sélection des paramètres (type, item, rang, style)
 * 2. Déclenchement de la génération
 * 3. Polling automatique du statut
 * 4. Affichage de l'audio généré
 * 5. Lecture du fichier audio
 * 
 * ✅ Avec mock de l'API Suno pour éviter consommation des quotas
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const MOCK_TRACK_ID = 'test-track-123';
const MOCK_AUDIO_URL = 'https://cdn.suno.ai/test-audio.mp3';

test.describe('Generator - Complete Music Generation Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock de l'API Supabase pour generate-music (retourne immédiatement un trackId)
    await page.route(`${SUPABASE_URL}/functions/v1/generate-music`, async (route) => {
      const request = route.request();
      const method = request.method();
      
      if (method === 'POST') {
        // Simulation de la génération initiale - retourne un trackId
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            trackId: MOCK_TRACK_ID,
            message: 'Génération démarrée avec succès'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock de l'API Supabase pour music-status (polling)
    let pollCount = 0;
    await page.route(`${SUPABASE_URL}/functions/v1/music-status`, async (route) => {
      pollCount++;
      
      // Simuler progression : 3 appels "in progress" puis "completed"
      if (pollCount < 3) {
        // En cours de génération
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 'generating',
            progress: Math.min(pollCount * 33, 99),
            message: 'Génération en cours...'
          })
        });
      } else {
        // Génération terminée
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 'completed',
            progress: 100,
            audioUrl: MOCK_AUDIO_URL,
            streamUrl: MOCK_AUDIO_URL,
            imageUrl: 'https://cdn.suno.ai/test-image.jpg',
            message: 'Génération terminée avec succès'
          })
        });
      }
    });

    // Mock de la requête Supabase pour vérifier les tracks dans la DB
    await page.route(`${SUPABASE_URL}/rest/v1/music_tracks*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: MOCK_TRACK_ID,
            track_id_suno: MOCK_TRACK_ID,
            audio_url: MOCK_AUDIO_URL,
            stream_url: MOCK_AUDIO_URL,
            image_url: 'https://cdn.suno.ai/test-image.jpg',
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    // Mock de l'audio file pour tester la lecture
    await page.route(MOCK_AUDIO_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'audio/mpeg',
        body: Buffer.from([]) // Audio vide pour le test
      });
    });

    await page.goto('/generator');
    await page.waitForLoadState('networkidle');
  });

  test('🎯 Flow complet : Sélection → Génération → Polling → Lecture', async ({ page }) => {
    console.log('🎬 Démarrage du test de flow complet...');

    // ========================================
    // ÉTAPE 1 : Sélection des paramètres
    // ========================================
    console.log('📝 Étape 1 : Sélection des paramètres');

    // Sélectionner le type de contenu EDN
    const contentTypeButton = page.locator('button:has-text("EDN")').first();
    await expect(contentTypeButton).toBeVisible();
    await contentTypeButton.click();
    console.log('✅ Type EDN sélectionné');

    // Attendre que le sélecteur d'items soit visible
    await page.waitForTimeout(500);

    // Sélectionner un item EDN
    const itemSelect = page.locator('[role="combobox"]').first();
    await expect(itemSelect).toBeVisible();
    await itemSelect.click();
    
    // Sélectionner le premier item disponible
    const firstItem = page.locator('[role="option"]').first();
    await expect(firstItem).toBeVisible();
    await firstItem.click();
    console.log('✅ Item EDN sélectionné');

    await page.waitForTimeout(500);

    // Sélectionner le rang A
    const rangButton = page.locator('button:has-text("A")').first();
    await expect(rangButton).toBeVisible();
    await rangButton.click();
    console.log('✅ Rang A sélectionné');

    await page.waitForTimeout(500);

    // Sélectionner un style musical
    const styleSelect = page.locator('[role="combobox"]').nth(1);
    await expect(styleSelect).toBeVisible();
    await styleSelect.click();
    
    const firstStyle = page.locator('[role="option"]').first();
    await expect(firstStyle).toBeVisible();
    await firstStyle.click();
    console.log('✅ Style musical sélectionné');

    await page.waitForTimeout(500);

    // ========================================
    // ÉTAPE 2 : Génération
    // ========================================
    console.log('🎵 Étape 2 : Déclenchement de la génération');

    // Vérifier que le bouton de génération est activé
    const generateButton = page.locator('button:has-text("Générer Musique")');
    await expect(generateButton).toBeVisible();
    await expect(generateButton).toBeEnabled();

    // Cliquer sur le bouton de génération
    await generateButton.click();
    console.log('✅ Génération démarrée');

    // Attendre que le message de succès apparaisse
    await expect(page.locator('text=/Génération.*démarrée/i')).toBeVisible({ timeout: 5000 });
    console.log('✅ Toast de confirmation affiché');

    // ========================================
    // ÉTAPE 3 : Polling automatique
    // ========================================
    console.log('🔄 Étape 3 : Polling du statut de génération');

    // Vérifier que le badge de statut "en cours" apparaît
    await expect(page.locator('text=/Génération.*en cours/i')).toBeVisible({ timeout: 3000 });
    console.log('✅ Statut "en cours" affiché');

    // ========================================
    // ÉTAPE 4 : Completion
    // ========================================
    console.log('⏳ Étape 4 : Attente de la completion (polling simulé)');

    // Attendre que le statut passe à "completed" (max 15 secondes)
    await expect(page.locator('text=/prêt.*écouter/i')).toBeVisible({ timeout: 15000 });
    console.log('✅ Génération terminée avec succès');

    // ========================================
    // ÉTAPE 5 : Lecture audio
    // ========================================
    console.log('🎧 Étape 5 : Validation du lecteur audio');

    // Vérifier que le lecteur audio est visible
    const audioPlayer = page.locator('[data-testid="music-player"], .music-player, audio').first();
    await expect(audioPlayer).toBeVisible({ timeout: 5000 });
    console.log('✅ Lecteur audio affiché');

    // Vérifier que le bouton play est visible
    const playButton = page.locator('button:has-text("Écouter"), button[aria-label*="play" i], button[aria-label*="écouter" i]').first();
    if (await playButton.isVisible()) {
      await expect(playButton).toBeEnabled();
      console.log('✅ Bouton lecture activé');
      
      // Cliquer sur play
      await playButton.click();
      console.log('✅ Lecture démarrée');
    }

    // ========================================
    // ÉTAPE 6 : Validation finale
    // ========================================
    console.log('🎯 Étape 6 : Validation finale');

    // Vérifier qu'il n'y a pas d'erreurs dans la console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);
    
    // Ne pas fail sur les erreurs de réseau mockées
    const criticalErrors = errors.filter(e => 
      !e.includes('net::ERR') && 
      !e.includes('Failed to load') &&
      !e.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ Aucune erreur critique détectée');

    console.log('🎉 Test de flow complet terminé avec succès !');
  });

  test('🔄 Validation du polling avec retries', async ({ page }) => {
    console.log('🔄 Test du mécanisme de polling avec retries');

    // Même flow de sélection raccourci
    await page.locator('button:has-text("EDN")').first().click();
    await page.waitForTimeout(300);
    
    const itemSelect = page.locator('[role="combobox"]').first();
    await itemSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);
    
    await page.locator('button:has-text("A")').first().click();
    await page.waitForTimeout(300);
    
    const styleSelect = page.locator('[role="combobox"]').nth(1);
    await styleSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Démarrer la génération
    await page.locator('button:has-text("Générer Musique")').click();

    // Vérifier que le polling s'effectue (plusieurs requêtes status)
    let statusCallCount = 0;
    page.on('request', (request) => {
      if (request.url().includes('music-status')) {
        statusCallCount++;
        console.log(`🔄 Appel polling #${statusCallCount}`);
      }
    });

    // Attendre la completion
    await expect(page.locator('text=/prêt.*écouter/i')).toBeVisible({ timeout: 15000 });

    // Vérifier qu'il y a eu au moins 2 appels de polling
    expect(statusCallCount).toBeGreaterThanOrEqual(2);
    console.log(`✅ Polling effectué : ${statusCallCount} appels`);
  });

  test('❌ Gestion d\'erreur - Échec de génération', async ({ page }) => {
    console.log('❌ Test de gestion d\'erreur');

    // Override le mock pour simuler une erreur
    await page.route(`${SUPABASE_URL}/functions/v1/generate-music`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Quota API Suno dépassé'
        })
      });
    });

    // Flow de sélection raccourci
    await page.locator('button:has-text("EDN")').first().click();
    await page.waitForTimeout(300);
    
    const itemSelect = page.locator('[role="combobox"]').first();
    await itemSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);
    
    await page.locator('button:has-text("A")').first().click();
    await page.waitForTimeout(300);
    
    const styleSelect = page.locator('[role="combobox"]').nth(1);
    await styleSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Démarrer la génération (qui va échouer)
    await page.locator('button:has-text("Générer Musique")').click();

    // Vérifier qu'un message d'erreur apparaît
    await expect(page.locator('text=/erreur/i, text=/échec/i, text=/quota/i').first()).toBeVisible({ timeout: 5000 });
    console.log('✅ Message d\'erreur affiché correctement');

    // Vérifier que le bouton de génération est toujours disponible (retry possible)
    const generateButton = page.locator('button:has-text("Générer Musique")');
    await expect(generateButton).toBeEnabled();
    console.log('✅ Retry possible après erreur');
  });

  test('⚡ Performance - Temps de réponse API < 3s', async ({ page }) => {
    console.log('⚡ Test de performance des API');

    // Flow de sélection raccourci
    await page.locator('button:has-text("EDN")').first().click();
    await page.waitForTimeout(300);
    
    const itemSelect = page.locator('[role="combobox"]').first();
    await itemSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);
    
    await page.locator('button:has-text("A")').first().click();
    await page.waitForTimeout(300);
    
    const styleSelect = page.locator('[role="combobox"]').nth(1);
    await styleSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Mesurer le temps de réponse de l'API de génération
    const startTime = Date.now();
    
    await page.locator('button:has-text("Générer Musique")').click();
    
    // Attendre la réponse de l'API
    await expect(page.locator('text=/Génération.*démarrée/i, text=/TaskID/i')).toBeVisible({ timeout: 5000 });
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Temps de réponse API : ${duration}ms`);

    // Valider que c'est < 3s
    expect(duration).toBeLessThan(3000);
    console.log('✅ Performance API validée (< 3s)');
  });

  test('🔄 Reset - Réinitialisation du formulaire', async ({ page }) => {
    console.log('🔄 Test de la fonction Reset');

    // Faire une sélection complète
    await page.locator('button:has-text("EDN")').first().click();
    await page.waitForTimeout(300);
    
    const itemSelect = page.locator('[role="combobox"]').first();
    await itemSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);
    
    await page.locator('button:has-text("A")').first().click();
    await page.waitForTimeout(300);
    
    const styleSelect = page.locator('[role="combobox"]').nth(1);
    await styleSelect.click();
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Cliquer sur Reset
    const resetButton = page.locator('button:has-text("Réinitialiser"), button:has-text("Reset")').first();
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    console.log('✅ Bouton Reset cliqué');

    // Vérifier que le formulaire est réinitialisé
    await page.waitForTimeout(500);
    
    // Le bouton de génération devrait être désactivé
    const generateButton = page.locator('button:has-text("Générer Musique")');
    await expect(generateButton).toBeDisabled();
    console.log('✅ Formulaire réinitialisé avec succès');
  });
});
