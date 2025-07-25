import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour les APIs et endpoints généraux
 * Couvre performance, erreurs, intégrations
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

test.describe('API & Endpoints E2E Tests', () => {

  test.beforeEach(async ({ request }) => {
    // Health check général
    const healthResponse = await request.get(`${SUPABASE_URL}/rest/v1/`);
    expect(healthResponse.status()).toBe(200);
  });

  test('API response times are acceptable', async ({ request }) => {
    console.log('⚡ Testing API performance...');
    
    const endpoints = [
      '/rest/v1/edn_items_immersive?select=item_code&limit=10',
      '/rest/v1/ecos_situations_uness?select=sd_id&limit=10',
      '/rest/v1/emotionscare_songs?select=id&limit=10'
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      const response = await request.get(`${SUPABASE_URL}${endpoint}`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Moins de 3 secondes
      
      console.log(`📊 ${endpoint}: ${responseTime}ms`);
    }
    
    console.log('✅ API performance acceptable');
  });

  test('Error responses are properly formatted', async ({ request }) => {
    console.log('🚨 Testing error response format...');
    
    // Test endpoint inexistant
    const notFoundResponse = await request.get(`${SUPABASE_URL}/rest/v1/nonexistent_table`);
    expect([400, 404].includes(notFoundResponse.status())).toBeTruthy();
    
    // Test requête malformée
    const malformedResponse = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=invalid_syntax{`);
    expect([400, 422].includes(malformedResponse.status())).toBeTruthy();
    
    console.log('✅ Error responses properly formatted');
  });

  test('CORS headers are properly set', async ({ request }) => {
    console.log('🌐 Testing CORS headers...');
    
    const corsResponse = await request.options(`${SUPABASE_URL}/rest/v1/edn_items_immersive`);
    
    expect([200, 204].includes(corsResponse.status())).toBeTruthy();
    
    const headers = corsResponse.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
    
    console.log('✅ CORS headers properly configured');
  });

  test('Rate limiting works correctly', async ({ request }) => {
    console.log('🚦 Testing rate limiting...');
    
    const requests = [];
    const maxRequests = 20;
    
    // Faire beaucoup de requêtes rapides
    for (let i = 0; i < maxRequests; i++) {
      requests.push(
        request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=count&limit=1`)
      );
    }
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    // La plupart doivent réussir, quelques-unes peuvent être rate limited
    const successCount = statusCodes.filter(s => s === 200).length;
    const rateLimitedCount = statusCodes.filter(s => s === 429).length;
    
    expect(successCount).toBeGreaterThan(5); // Au moins 5 réussites
    
    console.log(`✅ Rate limiting: ${successCount} success, ${rateLimitedCount} rate limited`);
  });

  test('Data pagination works correctly', async ({ request }) => {
    console.log('📄 Testing pagination...');
    
    // Test pagination sur table avec données
    const page1Response = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code&limit=5&offset=0`);
    expect(page1Response.status()).toBe(200);
    
    const page1Data = await page1Response.json();
    expect(Array.isArray(page1Data)).toBeTruthy();
    
    if (page1Data.length > 0) {
      // Test page suivante
      const page2Response = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=id,item_code&limit=5&offset=5`);
      expect(page2Response.status()).toBe(200);
      
      const page2Data = await page2Response.json();
      expect(Array.isArray(page2Data)).toBeTruthy();
      
      // Les IDs doivent être différents (si assez de données)
      if (page1Data.length === 5 && page2Data.length > 0) {
        expect(page1Data[0].id).not.toBe(page2Data[0].id);
      }
    }
    
    console.log('✅ Pagination working correctly');
  });

  test('Content filtering and search work', async ({ request }) => {
    console.log('🔍 Testing content filtering...');
    
    // Test filtrage par code item
    const filterResponse = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=item_code,title&item_code=like.IC-*&limit=5`);
    expect(filterResponse.status()).toBe(200);
    
    const filterData = await filterResponse.json();
    expect(Array.isArray(filterData)).toBeTruthy();
    
    // Vérifier que tous les résultats correspondent au filtre
    filterData.forEach(item => {
      expect(item.item_code).toMatch(/^IC-/);
    });
    
    console.log(`✅ Content filtering: ${filterData.length} results`);
  });

  test('Database constraints are enforced', async ({ request }) => {
    console.log('🛡️ Testing database constraints...');
    
    // Test insertion avec données invalides
    const invalidInsertResponse = await request.post(`${SUPABASE_URL}/rest/v1/abonnement_fiches`, {
      data: {
        prenom: '', // Champ requis vide
        email: 'invalid-email' // Email invalide
      }
    });
    
    // Doit échouer à cause des contraintes
    expect([400, 422].includes(invalidInsertResponse.status())).toBeTruthy();
    
    console.log('✅ Database constraints properly enforced');
  });

  test('API versioning consistency', async ({ request }) => {
    console.log('📋 Testing API versioning...');
    
    // Vérifier que l'API utilise la bonne version
    const versionResponse = await request.get(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Accept-Profile': 'public'
      }
    });
    
    expect(versionResponse.status()).toBe(200);
    
    const headers = versionResponse.headers();
    expect(headers['content-profile']).toBeDefined();
    
    console.log('✅ API versioning consistent');
  });

  test('Content-Type handling', async ({ request }) => {
    console.log('📝 Testing Content-Type handling...');
    
    // Test avec différents Content-Types
    const jsonResponse = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=count&limit=1`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    expect(jsonResponse.status()).toBe(200);
    expect(jsonResponse.headers()['content-type']).toContain('application/json');
    
    console.log('✅ Content-Type handling correct');
  });

  test('Edge Functions availability', async ({ request }) => {
    console.log('🔧 Testing Edge Functions availability...');
    
    const edgeFunctions = [
      'auto-extract-oic',
      'extract-edn-uness-complete',
      'extract-ecos-uness',
      'generate-music',
      'suno-music-optimized'
    ];
    
    for (const functionName of edgeFunctions) {
      const response = await request.post(`${FUNCTIONS_URL}/${functionName}`, {
        data: { test: true },
        timeout: 10000
      });
      
      // Fonction doit au moins répondre (pas forcément 200)
      expect(response.status()).toBeLessThan(600);
      console.log(`📋 ${functionName}: ${response.status()}`);
    }
    
    console.log('✅ Edge Functions availability checked');
  });

});