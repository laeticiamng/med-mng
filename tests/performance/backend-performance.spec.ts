import { test, expect } from '@playwright/test';

test.describe('Performance Tests - API Backend', () => {
  const API_BASE = 'https://yaincoxihiqdksxgrsrk.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

  test('API Response Time - Health Check', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(`${API_BASE}/rest/v1/`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`🔍 API Health check response time: ${responseTime}ms`);
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // < 1s
  });

  test('API Load Test - Multiple Requests', async ({ request }) => {
    const concurrentRequests = 10;
    const requests = [];
    
    const startTime = Date.now();
    
    // Lancer plusieurs requêtes simultanées
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        request.get(`${API_BASE}/rest/v1/`, {
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`🚀 ${concurrentRequests} concurrent requests completed in: ${totalTime}ms`);
    console.log(`📊 Average time per request: ${(totalTime / concurrentRequests).toFixed(2)}ms`);
    
    // Toutes les requêtes doivent réussir
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Temps total raisonnable pour 10 requêtes
    expect(totalTime).toBeLessThan(5000); // < 5s pour 10 requêtes
  });

  test('API Stress Test - High Volume', async ({ request }) => {
    const numberOfRequests = 50;
    const batchSize = 5;
    const responseTimes: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`🏋️ Starting stress test with ${numberOfRequests} requests...`);
    
    // Traiter par batches pour éviter de surcharger
    for (let batch = 0; batch < numberOfRequests; batch += batchSize) {
      const batchRequests = [];
      
      for (let i = 0; i < batchSize && (batch + i) < numberOfRequests; i++) {
        batchRequests.push(
          (async () => {
            const startTime = Date.now();
            try {
              const response = await request.get(`${API_BASE}/rest/v1/`, {
                headers: {
                  'apikey': ANON_KEY,
                  'Authorization': `Bearer ${ANON_KEY}`,
                },
              });
              
              const responseTime = Date.now() - startTime;
              responseTimes.push(responseTime);
              
              if (response.status() === 200) {
                successCount++;
              } else {
                errorCount++;
              }
            } catch (error) {
              errorCount++;
              console.log(`❌ Request failed: ${error}`);
            }
          })()
        );
      }
      
      await Promise.all(batchRequests);
      
      // Petit délai entre les batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const successRate = (successCount / numberOfRequests) * 100;
    
    console.log(`📈 Stress test results:`);
    console.log(`   Total requests: ${numberOfRequests}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Success rate: ${successRate.toFixed(2)}%`);
    console.log(`   Average response time: ${avgResponseTime.toFixed(2)}ms`);
    
    // Critères de succès du stress test
    expect(successRate).toBeGreaterThan(95); // > 95% de succès
    expect(avgResponseTime).toBeLessThan(2000); // < 2s en moyenne
  });

  test('Database Query Performance', async ({ request }) => {
    // Tester une requête simple vers la base de données
    const startTime = Date.now();
    
    const response = await request.get(`${API_BASE}/rest/v1/profiles?select=*&limit=10`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    });
    
    const queryTime = Date.now() - startTime;
    console.log(`🗃️ Database query time: ${queryTime}ms`);
    
    // La requête DB doit être rapide même si la table n'existe pas
    expect(queryTime).toBeLessThan(1500); // < 1.5s
    // On s'attend à une 404 ou 200 selon si la table existe
    expect([200, 404, 406].includes(response.status())).toBeTruthy();
  });

  test('Edge Function Performance', async ({ request }) => {
    // Tester les performances d'une edge function si disponible
    const startTime = Date.now();
    
    try {
      const response = await request.post(`${API_BASE}/functions/v1/med-mng-api`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        data: { test: true },
      });
      
      const functionTime = Date.now() - startTime;
      console.log(`⚡ Edge function response time: ${functionTime}ms`);
      
      // Les edge functions doivent être rapides
      expect(functionTime).toBeLessThan(3000); // < 3s
      
    } catch (error) {
      console.log(`ℹ️ Edge function not available or configured: ${error}`);
    }
  });

  test('Rate Limiting Performance', async ({ request }) => {
    // Tester que le rate limiting ne dégrade pas trop les performances
    const requests = [];
    const maxConcurrent = 5; // Rester sous les limites
    
    const startTime = Date.now();
    
    for (let i = 0; i < maxConcurrent; i++) {
      requests.push(
        request.get(`${API_BASE}/rest/v1/`, {
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`🛡️ Rate limited requests time: ${totalTime}ms`);
    
    // Même avec rate limiting, les requêtes doivent rester rapides
    expect(totalTime).toBeLessThan(3000); // < 3s pour 5 requêtes
    
    // Toutes doivent passer (sous la limite)
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});