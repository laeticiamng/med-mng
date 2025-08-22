/**
 * Tests d'intégration pour la validation d'authentification
 * Teste le comportement avec des variables d'environnement réelles
 */

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { validateAuth } from "./auth.ts";

Deno.test("validateAuth - Integration test with production-like environment", async () => {
  // Cette suite de tests doit être exécutée avec des vraies variables d'environnement
  const hasRealEnv = Deno.env.get('SUPABASE_URL') && Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!hasRealEnv) {
    console.log("⚠️ Skipping integration test - No real environment variables found");
    return;
  }

  // Test avec des variables d'environnement réelles mais sans token d'auth
  const request = new Request("https://example.com", {
    headers: {
      "Authorization": "Bearer invalid-token"
    }
  });

  const result = await validateAuth(request);

  // Doit réussir la validation d'environnement mais échouer sur l'auth
  assertEquals(result.error !== null, true);
  assertEquals(result.supabase, null);
  assertEquals(result.user, null);
  
  const errorResponse = await result.error!.json();
  assertEquals(errorResponse.error, 'INVALID_AUTH');
  assertEquals(errorResponse.message, 'Invalid authentication');
});

Deno.test("validateAuth - Performance test with environment validation", async () => {
  const startTime = performance.now();
  
  // Test multiple calls to check if environment validation is efficient
  const promises = Array(10).fill(null).map(() => {
    const request = new Request("https://example.com");
    return validateAuth(request);
  });

  await Promise.all(promises);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Validation d'environnement ne devrait pas prendre plus de 100ms pour 10 appels
  assertEquals(duration < 100, true, `Environment validation took ${duration}ms for 10 calls`);
});

Deno.test("validateAuth - Concurrent requests should handle environment validation safely", async () => {
  // Test de concurrence pour s'assurer que la validation d'environnement est thread-safe
  const concurrentRequests = Array(20).fill(null).map((_, index) => {
    const request = new Request("https://example.com", {
      headers: {
        "Authorization": `Bearer test-token-${index}`
      }
    });
    return validateAuth(request);
  });

  const results = await Promise.all(concurrentRequests);
  
  // Tous les résultats doivent avoir le même comportement pour la validation d'environnement
  const envErrors = results.filter(r => r.error !== null).map(async r => {
    const errorResponse = await r.error!.json();
    return errorResponse.error;
  });

  const resolvedErrors = await Promise.all(envErrors);
  
  // Si on a des erreurs d'environnement, elles doivent toutes être cohérentes
  if (resolvedErrors.length > 0) {
    const hasEnvErrors = resolvedErrors.some(error => error === 'ENV_CONFIG_ERROR');
    const hasAuthErrors = resolvedErrors.some(error => error === 'AUTH_REQUIRED' || error === 'INVALID_AUTH');
    
    // Les erreurs doivent être cohérentes - soit toutes les env, soit toutes les auth
    if (hasEnvErrors) {
      assertEquals(resolvedErrors.every(error => error === 'ENV_CONFIG_ERROR'), true);
    } else if (hasAuthErrors) {
      assertEquals(resolvedErrors.every(error => error === 'AUTH_REQUIRED' || error === 'INVALID_AUTH'), true);
    }
  }
});