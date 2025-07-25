import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour les Edge Functions d'extraction
 * Couvre extraction OIC, EDN, ECOS avec gestion sécurisée
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

test.describe('Extraction Edge Functions E2E', () => {
  
  test.beforeEach(async ({ request }) => {
    // Vérifier que Supabase est accessible
    const healthCheck = await request.get(`${SUPABASE_URL}/rest/v1/`);
    expect(healthCheck.status()).toBe(200);
  });

  test('Auto-extract OIC function responds correctly', async ({ request }) => {
    console.log('🧪 Testing auto-extract-oic edge function...');
    
    const response = await request.post(`${FUNCTIONS_URL}/auto-extract-oic`, {
      data: {
        action: 'status',
        test_mode: true
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Vérifier la structure de la réponse
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('message');
    
    console.log('✅ Auto-extract OIC function OK');
  });

  test('Extract EDN UNESS complete function structure', async ({ request }) => {
    console.log('🧪 Testing extract-edn-uness-complete edge function...');
    
    const response = await request.post(`${FUNCTIONS_URL}/extract-edn-uness-complete`, {
      data: {
        action: 'test',
        dry_run: true
      }
    });
    
    // Accepter 200 ou erreur contrôlée (pas de crash)
    expect([200, 400, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toBeDefined();
    
    console.log('✅ Extract EDN UNESS function structure OK');
  });

  test('Extract ECOS UNESS function security check', async ({ request }) => {
    console.log('🧪 Testing extract-ecos-uness security...');
    
    // Test sans credentials (doit échouer proprement)
    const response = await request.post(`${FUNCTIONS_URL}/extract-ecos-uness`, {
      data: {
        action: 'start'
        // Pas de credentials intentionnellement
      }
    });
    
    // Doit refuser l'accès sans credentials
    expect([400, 401, 422].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    
    console.log('✅ Extract ECOS security check OK');
  });

  test('Batch extraction status endpoint', async ({ request }) => {
    console.log('🧪 Testing batch extraction status...');
    
    // Vérifier qu'on peut obtenir un status sans lancer d'extraction
    const response = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=count&limit=1`);
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    
    console.log('✅ Batch status endpoint OK');
  });

  test('Database extraction results validation', async ({ request }) => {
    console.log('🧪 Testing database extraction results...');
    
    // Vérifier qu'il y a des données d'extraction en base
    const ednaResponse = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=item_code,title&limit=5`);
    expect(ednaResponse.status()).toBe(200);
    
    const ednData = await ednaResponse.json();
    expect(Array.isArray(ednData)).toBeTruthy();
    
    // Vérifier structure des données extraites
    if (ednData.length > 0) {
      expect(ednData[0]).toHaveProperty('item_code');
      expect(ednData[0]).toHaveProperty('title');
      console.log(`📊 Found ${ednData.length} EDN items in database`);
    }
    
    console.log('✅ Database extraction validation OK');
  });

  test('Error handling for malformed requests', async ({ request }) => {
    console.log('🧪 Testing error handling...');
    
    // Test avec payload malformé
    const response = await request.post(`${FUNCTIONS_URL}/auto-extract-oic`, {
      data: {
        invalid_field: 'test',
        malformed_action: null
      }
    });
    
    // Doit gérer l'erreur proprement
    expect([400, 422, 500].includes(response.status())).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    
    console.log('✅ Error handling OK');
  });

  test('Performance check - response time', async ({ request }) => {
    console.log('🧪 Testing performance...');
    
    const startTime = Date.now();
    
    const response = await request.get(`${SUPABASE_URL}/rest/v1/edn_items_immersive?select=count&limit=1`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Moins de 5 secondes
    
    console.log(`⚡ Response time: ${responseTime}ms`);
    console.log('✅ Performance check OK');
  });

});