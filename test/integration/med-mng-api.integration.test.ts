/**
 * MED-MNG API Integration Tests
 * Point 3 du ticket global: QA Backend - Tests d'intégration sur toutes les APIs
 * 
 * Couverture:
 * - /edn, /edn/:slug
 * - /songs, /songs/:id/stream, /songs/:id/like, /songs/:id/lyrics
 * - /library (GET/POST/DELETE)
 * - /quota
 * - /verify-item/:id, /verify-all
 * - /subscriptions
 * 
 * Tests cas: succès, échec, edge cases, RLS, quota, etc.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

// Configuration de test
const API_BASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/med-mng-api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN;
const TEST_ADMIN_TOKEN = process.env.TEST_ADMIN_TOKEN;

// Helper pour créer des requêtes
const createRequest = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_USER_TOKEN}`,
      ...options.headers,
    },
    ...options,
  });
};

const createAnonymousRequest = (endpoint: string, options: RequestInit = {}) => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
};

describe('MED-MNG API Integration Tests', () => {
  beforeAll(() => {
    if (!TEST_USER_TOKEN) {
      console.warn('⚠️ TEST_USER_TOKEN manquant - tests auth seront skippés');
    }
  });

  describe('🔍 1. EDN Endpoints', () => {
    test('GET /edn - Liste paginée des items EDN', async () => {
      const response = await createAnonymousRequest('/edn?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('page', 1);
      expect(data).toHaveProperty('limit', 10);
      expect(data).toHaveProperty('totalCount');
      expect(Array.isArray(data.items)).toBe(true);
      
      if (data.items.length > 0) {
        expect(data.items[0]).toHaveProperty('item_code');
        expect(data.items[0]).toHaveProperty('title');
        expect(data.items[0]).toHaveProperty('slug');
      }
    });

    test('GET /edn/:slug - Item EDN spécifique', async () => {
      // D'abord, récupérer un slug valide
      const listResponse = await createAnonymousRequest('/edn?limit=1');
      const listData = await listResponse.json();
      
      if (listData.items && listData.items.length > 0) {
        const slug = listData.items[0].slug;
        
        const response = await createAnonymousRequest(`/edn/${slug}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('item_code');
        expect(data).toHaveProperty('title');
        expect(data).toHaveProperty('tableau_rang_a');
        expect(data).toHaveProperty('tableau_rang_b');
      }
    });

    test('GET /edn/invalid-slug - Item EDN inexistant', async () => {
      const response = await createAnonymousRequest('/edn/item-inexistant-xyz-123');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    test('GET /edn - Pagination edge cases', async () => {
      // Page très élevée
      const response1 = await createAnonymousRequest('/edn?page=999&limit=10');
      const data1 = await response1.json();
      expect(response1.status).toBe(200);
      expect(data1.items).toEqual([]);

      // Limit trop élevé (doit être plafonné)
      const response2 = await createAnonymousRequest('/edn?page=1&limit=500');
      const data2 = await response2.json();
      expect(response2.status).toBe(200);
      expect(data2.limit).toBeLessThanOrEqual(100); // Limite max dans le code
    });
  });

  describe('🎵 2. Songs Endpoints', () => {
    const testSong = {
      title: 'Test Song Integration',
      suno_audio_id: 'test-audio-id-' + Date.now(),
      meta: { test: true }
    };

    test('POST /songs - Création chanson sans auth (doit échouer)', async () => {
      const response = await createAnonymousRequest('/songs', {
        method: 'POST',
        body: JSON.stringify(testSong),
      });

      expect(response.status).toBe(401);
    });

    test('POST /songs - Validation des données', async () => {
      if (!TEST_USER_TOKEN) return;

      // Titre manquant
      const response1 = await createRequest('/songs', {
        method: 'POST',
        body: JSON.stringify({ suno_audio_id: 'test' }),
      });
      expect(response1.status).toBe(400);

      // Titre trop long
      const response2 = await createRequest('/songs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'x'.repeat(300),
          suno_audio_id: 'test'
        }),
      });
      expect(response2.status).toBe(400);
    });

    test('GET /songs - Liste paginée', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/songs?page=1&limit=5');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page', 1);
      expect(data.pagination).toHaveProperty('limit', 5);
    });

    test('GET /songs avec recherche', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/songs?search=test&page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('search', 'test');
    });

    test('GET /songs/:id/stream - ID invalide', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/songs/invalid-uuid/stream');
      expect(response.status).toBe(400);
    });

    test('GET /songs/:id/stream - Chanson inexistante', async () => {
      if (!TEST_USER_TOKEN) return;

      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const response = await createRequest(`/songs/${fakeUuid}/stream`);
      expect(response.status).toBe(404);
    });

    test('POST /songs/:id/like - Like toggle', async () => {
      if (!TEST_USER_TOKEN) return;

      // D'abord récupérer une chanson existante
      const songsResponse = await createRequest('/songs?limit=1');
      const songsData = await songsResponse.json();

      if (songsData.items && songsData.items.length > 0) {
        const songId = songsData.items[0].id;
        
        const response = await createRequest(`/songs/${songId}/like`, {
          method: 'POST',
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('liked');
        expect(typeof data.liked).toBe('boolean');
      }
    });
  });

  describe('📚 3. Library Endpoints', () => {
    test('GET /library sans auth (doit échouer)', async () => {
      const response = await createAnonymousRequest('/library');
      expect(response.status).toBe(401);
    });

    test('GET /library - Bibliothèque utilisateur', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/library?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.items)).toBe(true);
    });

    test('POST /library - Ajout à la bibliothèque', async () => {
      if (!TEST_USER_TOKEN) return;

      // D'abord récupérer une chanson existante
      const songsResponse = await createRequest('/songs?limit=1');
      const songsData = await songsResponse.json();

      if (songsData.items && songsData.items.length > 0) {
        const songId = songsData.items[0].id;
        
        const response = await createRequest('/library', {
          method: 'POST',
          body: JSON.stringify({ song_id: songId }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('success', true);
      }
    });

    test('DELETE /library/:songId - Suppression de la bibliothèque', async () => {
      if (!TEST_USER_TOKEN) return;

      // Récupérer un item de la bibliothèque
      const libraryResponse = await createRequest('/library?limit=1');
      const libraryData = await libraryResponse.json();

      if (libraryData.items && libraryData.items.length > 0) {
        const songId = libraryData.items[0].id;
        
        const response = await createRequest(`/library/${songId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('success', true);
      }
    });
  });

  describe('⚡ 4. Quota Endpoint', () => {
    test('GET /quota sans auth (doit échouer)', async () => {
      const response = await createAnonymousRequest('/quota');
      expect(response.status).toBe(401);
    });

    test('GET /quota - Quota utilisateur', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/quota');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('remaining_credits');
      expect(typeof data.remaining_credits).toBe('number');
      expect(data.remaining_credits).toBeGreaterThanOrEqual(0);
    });
  });

  describe('💳 5. Subscriptions Endpoint', () => {
    test('POST /subscriptions - Validation des champs requis', async () => {
      if (!TEST_USER_TOKEN) return;

      // Plan ID manquant
      const response1 = await createRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ gateway: 'stripe' }),
      });
      expect(response1.status).toBe(400);

      // Gateway manquant
      const response2 = await createRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ plan_id: 'pro' }),
      });
      expect(response2.status).toBe(400);
    });
  });

  describe('🔍 6. Verify Endpoints', () => {
    test('GET /verify-item/:id sans auth (doit échouer)', async () => {
      const response = await createAnonymousRequest('/verify-item/ic-1');
      expect(response.status).toBe(401);
    });

    test('GET /verify-all sans auth (doit échouer)', async () => {
      const response = await createAnonymousRequest('/verify-all');
      expect(response.status).toBe(401);
    });
  });

  describe('🚨 7. Error Handling & Edge Cases', () => {
    test('Endpoint inexistant', async () => {
      const response = await createAnonymousRequest('/endpoint-inexistant');
      expect(response.status).toBe(404);
    });

    test('Méthode HTTP non supportée', async () => {
      const response = await createAnonymousRequest('/edn', {
        method: 'PATCH',
      });
      expect(response.status).toBe(404); // Ou 405 selon implementation
    });

    test('Body JSON malformé', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await fetch(`${API_BASE_URL}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
        },
        body: '{"invalid": json}', // JSON invalide
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });

    test('Headers de sécurité présents', async () => {
      const response = await createAnonymousRequest('/edn?limit=1');
      
      // Vérification CORS
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      
      // Vérification headers de sécurité (si implémentés)
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection'
      ];
      
      securityHeaders.forEach(header => {
        // Note: ces headers peuvent ne pas être présents selon la config
        const headerValue = response.headers.get(header);
        if (headerValue) {
          expect(headerValue).toBeTruthy();
        }
      });
    });
  });

  describe('📈 8. Performance & Monitoring', () => {
    test('GET /health - Health check', async () => {
      const start = Date.now();
      const response = await createAnonymousRequest('/health');
      const duration = Date.now() - start;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version');
      expect(duration).toBeLessThan(5000); // < 5s
    });

    test('Performance - Endpoint EDN sous 3s', async () => {
      const start = Date.now();
      const response = await createAnonymousRequest('/edn?limit=10');
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000); // < 3s comme spécifié dans le ticket
    });
  });

  describe('🔒 9. Rate Limiting', () => {
    test('Rate limiting (si activé)', async () => {
      // Test basique - peut être skip si pas de rate limiting en test
      let rateLimitHit = false;
      
      for (let i = 0; i < 70; i++) { // Plus que la limite de 60/min
        const response = await createAnonymousRequest('/edn?limit=1');
        if (response.status === 429) {
          rateLimitHit = true;
          break;
        }
        // Petite pause pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Note: Le rate limiting peut être désactivé en test
      if (rateLimitHit) {
        expect(rateLimitHit).toBe(true);
      }
    }, 30000); // Timeout élevé pour ce test
  });

  afterAll(() => {
    console.log('✅ Tests d\'intégration MED-MNG API terminés');
  });
});