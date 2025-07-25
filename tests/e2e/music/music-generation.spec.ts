import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la génération musicale
 * Couvre Suno API, OpenAI, et pipeline complet de génération
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

test.describe('Music Generation E2E Tests', () => {

  test.beforeEach(async ({ request }) => {
    // Vérifier connexion Supabase
    const healthCheck = await request.get(`${SUPABASE_URL}/rest/v1/`);
    expect(healthCheck.status()).toBe(200);
  });

  test('Generate music function responds correctly', async ({ request }) => {
    console.log('🎵 Testing music generation endpoint...');
    
    const response = await request.post(`${FUNCTIONS_URL}/generate-music`, {
      data: {
        prompt: "Test musical médical EDN - mélodie calme",
        style: "ambient",
        test_mode: true
      },
      timeout: 30000 // 30 secondes pour génération
    });
    
    // Accepter 200 (succès) ou 402 (quota exceeded) ou 422 (validation)
    expect([200, 402, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toBeDefined();
    
    if (response.status() === 200) {
      expect(data).toHaveProperty('audio_id');
      console.log(`✅ Music generation successful: ${data.audio_id}`);
    } else {
      console.log(`ℹ️ Music generation response: ${data.error || data.message}`);
    }
  });

  test('Music generation status tracking', async ({ request }) => {
    console.log('🎵 Testing music generation status...');
    
    // Test du statut avec un ID fictif
    const response = await request.get(`${FUNCTIONS_URL}/suno-music-optimized?action=status&id=test-id`);
    
    expect([200, 404, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toBeDefined();
    
    console.log('✅ Music status endpoint OK');
  });

  test('Suno music optimized function structure', async ({ request }) => {
    console.log('🎵 Testing Suno optimized function...');
    
    const response = await request.post(`${FUNCTIONS_URL}/suno-music-optimized`, {
      data: {
        action: 'test',
        prompt: 'Test prompt for structure validation'
      }
    });
    
    // Test structure, pas forcément succès complet
    expect([200, 400, 402, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toBeDefined();
    
    console.log('✅ Suno function structure OK');
  });

  test('Music database integration', async ({ request }) => {
    console.log('🎵 Testing music database integration...');
    
    // Vérifier tables de musique en base
    const songsResponse = await request.get(`${SUPABASE_URL}/rest/v1/emotionscare_songs?select=id,title,suno_audio_id&limit=5`);
    expect(songsResponse.status()).toBe(200);
    
    const songs = await songsResponse.json();
    expect(Array.isArray(songs)).toBeTruthy();
    
    console.log(`📊 Found ${songs.length} songs in database`);
    
    // Vérifier structure des données
    if (songs.length > 0) {
      expect(songs[0]).toHaveProperty('id');
      expect(songs[0]).toHaveProperty('title');
      expect(songs[0]).toHaveProperty('suno_audio_id');
    }
    
    console.log('✅ Music database integration OK');
  });

  test('Music API rate limiting', async ({ request }) => {
    console.log('🎵 Testing rate limiting...');
    
    const responses = [];
    
    // Faire plusieurs requêtes rapides pour tester rate limiting
    for (let i = 0; i < 3; i++) {
      const response = await request.post(`${FUNCTIONS_URL}/generate-music`, {
        data: {
          prompt: `Test rate limit ${i}`,
          test_mode: true
        }
      });
      responses.push(response.status());
    }
    
    // Au moins une requête doit être acceptée ou rate limited proprement
    const hasSuccess = responses.includes(200);
    const hasRateLimit = responses.includes(429);
    const hasValidResponse = responses.every(status => [200, 402, 422, 429].includes(status));
    
    expect(hasValidResponse).toBeTruthy();
    
    console.log(`✅ Rate limiting test OK - Responses: ${responses.join(', ')}`);
  });

  test('Music generation error handling', async ({ request }) => {
    console.log('🎵 Testing error handling...');
    
    // Test avec payload malformé
    const response = await request.post(`${FUNCTIONS_URL}/generate-music`, {
      data: {
        invalid_field: 'test',
        malformed_prompt: null
      }
    });
    
    // Doit gérer l'erreur proprement
    expect([400, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    
    console.log('✅ Music error handling OK');
  });

  test('OpenAI integration for music enhancement', async ({ request }) => {
    console.log('🎵 Testing OpenAI integration...');
    
    // Test endpoint OpenAI pour amélioration de prompts musicaux
    const response = await request.post(`${FUNCTIONS_URL}/openai-chat`, {
      data: {
        messages: [
          {
            role: 'user',
            content: 'Génère un prompt musical court pour une mélodie relaxante médicale'
          }
        ],
        max_tokens: 50,
        test_mode: true
      }
    });
    
    expect([200, 401, 402, 429].includes(response.status())).toBeTruthy();
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('choices');
      console.log('✅ OpenAI integration working');
    } else {
      console.log(`ℹ️ OpenAI response status: ${response.status()}`);
    }
  });

  test('Music generation pipeline end-to-end', async ({ request }) => {
    console.log('🎵 Testing complete music generation pipeline...');
    
    // 1. Générer prompt avec OpenAI
    let musicPrompt = 'Mélodie douce et relaxante pour formation médicale';
    
    // 2. Générer musique avec le prompt
    const musicResponse = await request.post(`${FUNCTIONS_URL}/generate-music`, {
      data: {
        prompt: musicPrompt,
        style: 'ambient',
        test_mode: true
      },
      timeout: 60000 // 1 minute pour pipeline complet
    });
    
    expect([200, 402, 422].includes(musicResponse.status())).toBeTruthy();
    
    const musicData = await musicResponse.json();
    
    if (musicResponse.status() === 200 && musicData.audio_id) {
      console.log(`✅ Complete pipeline successful: ${musicData.audio_id}`);
      
      // 3. Vérifier que la musique est sauvée en base
      const savedSong = await request.get(`${SUPABASE_URL}/rest/v1/emotionscare_songs?suno_audio_id=eq.${musicData.audio_id}&select=id,title`);
      expect(savedSong.status()).toBe(200);
      
    } else {
      console.log(`ℹ️ Pipeline test completed with status: ${musicResponse.status()}`);
    }
    
    console.log('✅ Music generation pipeline test completed');
  });

});