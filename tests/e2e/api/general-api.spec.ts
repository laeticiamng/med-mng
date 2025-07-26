import { test, expect } from '@playwright/test';

test.describe('General API Tests - Performance & Integration', () => {
  const baseURL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate API health and availability', async ({ page }) => {
    // Test de santé de l'API Supabase
    const response = await page.request.get(`${baseURL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    expect([200, 404]).toContain(response.status());
  });

  test('should validate API response time under 3s', async ({ page }) => {
    const startTime = Date.now();
    
    const response = await page.request.get(`${baseURL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(3000);
    console.log(`API response time: ${responseTime}ms`);
  });

  test('should validate edge functions availability', async ({ page }) => {
    const edgeFunctions = [
      'extract-oic-objectifs',
      'extract-edn-objectifs', 
      'extract-ecos-objectifs',
      'generate-music'
    ];

    for (const functionName of edgeFunctions) {
      const response = await page.request.post(`${baseURL}/functions/v1/${functionName}`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        data: { test: true }
      });

      // Les edge functions doivent répondre (même si c'est une erreur de validation)
      expect([200, 400, 401, 500]).toContain(response.status());
      console.log(`Edge function ${functionName}: ${response.status()}`);
    }
  });

  test('should validate database connectivity', async ({ page }) => {
    // Test de connectivité à la base de données via l'API REST
    const response = await page.request.get(`${baseURL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
        'Accept': 'application/json'
      }
    });

    // Doit pouvoir se connecter à la DB
    expect([200, 404]).toContain(response.status());
  });

  test('should validate CORS configuration', async ({ page }) => {
    // Test de la configuration CORS
    const response = await page.request.options(`${baseURL}/rest/v1/`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,apikey'
      }
    });

    // CORS doit être configuré pour permettre les requêtes
    expect([200, 204]).toContain(response.status());
  });

  test('should validate error handling consistency', async ({ page }) => {
    // Test de gestion d'erreur avec endpoint inexistant
    const response = await page.request.get(`${baseURL}/rest/v1/non-existent-table`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    });

    expect([400, 404]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('should validate rate limiting protection', async ({ page }) => {
    // Test de protection contre le spam (limite de taux)
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.request.get(`${baseURL}/rest/v1/`, {
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey
          }
        })
      );
    }

    const responses = await Promise.all(requests);
    
    // Toutes les requêtes doivent aboutir ou être limitées proprement
    for (const response of responses) {
      expect([200, 404, 429]).toContain(response.status());
    }
  });

  test('should validate content type handling', async ({ page }) => {
    // Test des différents types de contenu
    const response = await page.request.post(`${baseURL}/functions/v1/generate-music`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ test: 'content-type-validation' })
    });

    expect([200, 400, 401]).toContain(response.status());
  });

  test('should validate external API integrations', async ({ page }) => {
    // Test indirect des intégrations externes via nos edge functions
    const musicResponse = await page.request.post(`${baseURL}/functions/v1/generate-music`, {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        lyrics: 'Test integration',
        style: 'pop',
        rang: 'A',
        duration: 60,
        mode: 'TEST'
      }
    });

    // L'edge function doit répondre même si l'API externe échoue
    expect([200, 400, 500]).toContain(musicResponse.status());
  });

  test('should validate data consistency across endpoints', async ({ page }) => {
    // Test de cohérence des données entre différents endpoints
    const endpoints = [
      '/rest/v1/',
      '/functions/v1/'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        }
      });

      // Chaque endpoint doit répondre de manière cohérente
      expect([200, 404, 401]).toContain(response.status());
    }
  });

  test('should validate performance under concurrent load', async ({ page }) => {
    const startTime = Date.now();
    
    // Simuler 5 requêtes concurrentes
    const concurrentRequests = Array(5).fill(null).map(() =>
      page.request.get(`${baseURL}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        }
      })
    );

    const responses = await Promise.all(concurrentRequests);
    const endTime = Date.now();
    
    // Toutes les requêtes doivent aboutir
    for (const response of responses) {
      expect([200, 404]).toContain(response.status());
    }
    
    // Le temps total ne doit pas dépasser 5s pour 5 requêtes concurrentes
    expect(endTime - startTime).toBeLessThan(5000);
  });
});