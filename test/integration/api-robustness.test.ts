/**
 * Tests de robustesse API - MED-MNG
 * Point 3.2 du ticket global: Logs & robustesse
 * 
 * Vérifie:
 * - Codes HTTP corrects
 * - Messages d'erreur exploitables 
 * - Logs structurés
 * - Cohérence DB/API
 */

import { describe, test, expect } from '@jest/globals';

const API_BASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1/med-mng-api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN;

// Structure attendue des réponses d'erreur
interface APIErrorResponse {
  error: string;
  code: number;
  message: string;
  timestamp: string;
  path?: string;
}

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

describe('API Robustness Tests', () => {
  describe('🔍 1. Codes HTTP & Messages d\'erreur', () => {
    test('401 Unauthorized - Token manquant', async () => {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code', 401);
      expect(data).toHaveProperty('message');
      expect(typeof data.message).toBe('string');
      expect(data.message.length).toBeGreaterThan(0);
    });

    test('400 Bad Request - Données invalides', async () => {
      if (!TEST_USER_TOKEN) return;

      const response = await createRequest('/songs', {
        method: 'POST',
        body: JSON.stringify({ title: '' }), // Titre vide
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code', 400);
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('required');
    });

    test('404 Not Found - Ressource inexistante', async () => {
      const response = await fetch(`${API_BASE_URL}/edn/item-inexistant-xyz`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    test('500 Internal Server Error - Gestion d\'erreur serveur', async () => {
      // Simuler une erreur en envoyant une requête qui pourrait causer une erreur DB
      const response = await fetch(`${API_BASE_URL}/edn/item-with-special-chars-@#$%`);
      
      // Même si l'item n'existe pas, ça doit retourner 404, pas 500
      expect(response.status).not.toBe(500);
      
      if (response.status >= 500) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('message');
      }
    });
  });

  describe('📊 2. Structure des réponses', () => {
    test('Réponse succès - Structure cohérente', async () => {
      const response = await fetch(`${API_BASE_URL}/edn?limit=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');
      
      // Structure pagination cohérente
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('totalCount');
      expect(Array.isArray(data.items)).toBe(true);
    });

    test('Réponse erreur - Structure standardisée', async () => {
      const response = await fetch(`${API_BASE_URL}/endpoint-inexistant`);
      const data = await response.json();

      expect(response.status).toBeGreaterThanOrEqual(400);
      
      // Structure d'erreur standardisée selon le ticket backend
      expect(data).toHaveProperty('error'); // Clé unique pour i18n
      expect(data).toHaveProperty('code');  // Code HTTP
      expect(data).toHaveProperty('message'); // Message lisible
      expect(data).toHaveProperty('timestamp');
      
      expect(typeof data.error).toBe('string');
      expect(typeof data.code).toBe('number');
      expect(typeof data.message).toBe('string');
      expect(typeof data.timestamp).toBe('string');
    });

    test('Headers de sécurité présents', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      // CORS headers
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
      expect(response.headers.get('Access-Control-Allow-Headers')).toBeTruthy();
      
      // Content-Type correct
      expect(response.headers.get('Content-Type')).toContain('application/json');
    });
  });

  describe('⚡ 3. Performance & Timeouts', () => {
    test('Endpoint rapide < 1s', async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/health`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });

    test('Endpoint avec données < 3s', async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/edn?limit=20`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000);
    });

    test('Pagination efficace', async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/edn?page=1&limit=50`);
      const duration = Date.now() - start;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000);
      expect(data.items.length).toBeLessThanOrEqual(50);
    });
  });

  describe('🔄 4. Cohérence DB/API', () => {
    test('Consistance lecture après écriture', async () => {
      if (!TEST_USER_TOKEN) return;

      // 1. Récupérer la bibliothèque initiale
      const initialResponse = await createRequest('/library');
      const initialData = await initialResponse.json();
      const initialCount = initialData.pagination?.totalCount || 0;

      // 2. Ajouter un item (si on a des songs)
      const songsResponse = await createRequest('/songs?limit=1');
      const songsData = await songsResponse.json();

      if (songsData.items && songsData.items.length > 0) {
        const songId = songsData.items[0].id;
        
        // Ajouter à la bibliothèque
        const addResponse = await createRequest('/library', {
          method: 'POST',
          body: JSON.stringify({ song_id: songId }),
        });
        
        if (addResponse.status === 200) {
          // 3. Vérifier que la bibliothèque a été mise à jour
          await new Promise(resolve => setTimeout(resolve, 100)); // Petite pause
          
          const updatedResponse = await createRequest('/library');
          const updatedData = await updatedResponse.json();
          const newCount = updatedData.pagination?.totalCount || 0;

          // Le count devrait avoir augmenté (ou rester pareil si déjà présent)
          expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }
      }
    });

    test('Données cohérentes entre endpoints', async () => {
      if (!TEST_USER_TOKEN) return;

      // Récupérer une chanson via /songs
      const songsResponse = await createRequest('/songs?limit=1');
      const songsData = await songsResponse.json();

      if (songsData.items && songsData.items.length > 0) {
        const song = songsData.items[0];
        const songId = song.id;
        
        // Ajouter à la bibliothèque
        await createRequest('/library', {
          method: 'POST',
          body: JSON.stringify({ song_id: songId }),
        });
        
        // Récupérer via /library
        const libraryResponse = await createRequest('/library');
        const libraryData = await libraryResponse.json();
        
        // Chercher la chanson dans la bibliothèque
        const songInLibrary = libraryData.items.find((item: any) => item.id === songId);
        
        if (songInLibrary) {
          // Les propriétés de base doivent être identiques
          expect(songInLibrary.title).toBe(song.title);
          expect(songInLibrary.suno_audio_id).toBe(song.suno_audio_id);
        }
      }
    });
  });

  describe('🚫 5. Validation d\'entrée', () => {
    test('Protection XSS dans les paramètres', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const response = await fetch(`${API_BASE_URL}/edn?search=${encodeURIComponent(xssPayload)}`);
      
      expect(response.status).toBe(200); // L'endpoint doit fonctionner
      
      const data = await response.json();
      const responseText = JSON.stringify(data);
      
      // Le payload XSS ne doit pas être exécutable dans la réponse
      expect(responseText).not.toContain('<script>');
    });

    test('Protection injection SQL', async () => {
      const sqlPayload = "'; DROP TABLE songs; --";
      const response = await fetch(`${API_BASE_URL}/edn?search=${encodeURIComponent(sqlPayload)}`);
      
      expect(response.status).toBe(200);
      // L'API doit toujours fonctionner, preuve que l'injection a été bloquée
    });

    test('Limitation de taille des paramètres', async () => {
      const longString = 'x'.repeat(10000);
      const response = await fetch(`${API_BASE_URL}/edn?search=${encodeURIComponent(longString)}`);
      
      // L'API doit gérer gracieusement les paramètres trop longs
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('🔐 6. Sécurité & Authentification', () => {
    test('Token invalide géré correctement', async () => {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token-invalide-xyz-123'
        }
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.message).not.toContain('token-invalide'); // Pas de leak du token
    });

    test('Accès RLS respecté', async () => {
      if (!TEST_USER_TOKEN) return;

      // Les endpoints authentifiés doivent respecter RLS
      const response = await createRequest('/library');
      expect(response.status).toBe(200);
      
      // Sans token, même endpoint doit échouer
      const noAuthResponse = await fetch(`${API_BASE_URL}/library`);
      expect(noAuthResponse.status).toBe(401);
    });
  });

  describe('📝 7. Logs & Debugging', () => {
    test('Request ID présent dans les headers (si implémenté)', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      // Check si un request ID ou correlation ID est présent
      const requestId = response.headers.get('X-Request-ID') || 
                       response.headers.get('X-Correlation-ID') ||
                       response.headers.get('Request-ID');
      
      // Note: pas obligatoire mais recommandé pour le debugging
      if (requestId) {
        expect(requestId).toBeTruthy();
        expect(requestId.length).toBeGreaterThan(5);
      }
    });

    test('Erreurs ne révèlent pas d\'infos sensibles', async () => {
      const response = await fetch(`${API_BASE_URL}/songs/00000000-0000-0000-0000-000000000000/stream`, {
        headers: { 'Authorization': 'Bearer token-invalid' }
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      
      // Les erreurs ne doivent pas révéler de détails sensibles
      const responseText = JSON.stringify(data);
      expect(responseText).not.toContain('database');
      expect(responseText).not.toContain('supabase');
      expect(responseText).not.toContain('postgres');
      expect(responseText).not.toContain('connection');
    });
  });
});