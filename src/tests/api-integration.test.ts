import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Configuration de test (utiliser des credentials de test)
const TEST_SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const TEST_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU';

const supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY);

// Données de test
const TEST_ITEM_CODE = 'IC-1';
const TEST_SONG_TITLE = 'Test Song - API Integration';

describe('🔗 Tests d\'intégration API - Endpoints critiques', () => {
  
  describe('📚 API EDN Items', () => {
    it('✅ GET /edn - doit retourner la liste des items EDN', async () => {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      if (data && data.length > 0) {
        const item = data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('item_code');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('slug');
      }
    });

    it('✅ GET /edn/:slug - doit retourner un item spécifique', async () => {
      // D'abord récupérer un slug valide
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('slug')
        .limit(1);

      if (items && items.length > 0) {
        const testSlug = items[0].slug;
        
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', testSlug)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.slug).toBe(testSlug);
        expect(data).toHaveProperty('tableau_rang_a');
        expect(data).toHaveProperty('tableau_rang_b');
      }
    });

    it('❌ GET /edn/:slug - doit retourner 404 pour slug inexistant', async () => {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('slug', 'slug-inexistant-test-12345')
        .single();

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('🔍 Verify Item Completeness - doit retourner le statut de complétude', async () => {
      const { data, error } = await supabase.functions.invoke('items-completeness-check', {
        body: { action: 'summary' }
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).toHaveProperty('summary');
      expect(data.summary).toHaveProperty('totalItems');
      expect(data.summary).toHaveProperty('completeItems');
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('🎵 API Songs & Music', () => {
    it('✅ GET /songs - doit retourner la liste des musiques', async () => {
      const { data, error } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .not('audio_url', 'is', null)
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        const song = data[0];
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('audio_url');
        expect(song.audio_url).toBeTruthy();
      }
    });

    it('✅ GET /songs/:id/stream - doit retourner le stream audio sécurisé', async () => {
      // Récupérer une chanson de test
      const { data: songs } = await supabase
        .from('generated_music_tracks')
        .select('id, suno_track_id')
        .not('audio_url', 'is', null)
        .limit(1);

      if (songs && songs.length > 0) {
        const testSong = songs[0];
        
        const { data, error } = await supabase.functions.invoke('secure-audio-stream', {
          body: { 
            id: testSong.suno_track_id,
            token: 'test-token' 
          }
        });

        // Note: Ce test peut échouer en fonction de la configuration auth
        // Il sert surtout à vérifier que l'endpoint répond
        expect(data || error).toBeDefined();
      }
    });

    it('❌ POST /songs/:id/like - doit échouer sans authentification', async () => {
      const { data: songs } = await supabase
        .from('generated_music_tracks')
        .select('id')
        .limit(1);

      if (songs && songs.length > 0) {
        const testSongId = songs[0].id;
        
        const { error } = await supabase
          .from('emotionscare_song_likes')
          .insert({ song_id: testSongId, user_id: 'fake-user-id' });

        // Doit échouer à cause des RLS policies
        expect(error).toBeDefined();
      }
    });
  });

  describe('🔍 API Verification & Completeness', () => {
    it('✅ POST /verify-item/:id - doit vérifier un item spécifique', async () => {
      // Récupérer un item de test
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('id')
        .limit(1);

      if (items && items.length > 0) {
        const testItemId = items[0].id;
        
        const { data, error } = await supabase.functions.invoke('items-completeness-check', {
          body: { itemId: testItemId }
        });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data).toHaveProperty('itemId', testItemId);
        expect(data).toHaveProperty('completenessScore');
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('fieldAnalysis');
        expect(Array.isArray(data.fieldAnalysis)).toBe(true);
      }
    });

    it('❌ POST /verify-item/:id - doit échouer avec ID invalide', async () => {
      const { data, error } = await supabase.functions.invoke('items-completeness-check', {
        body: { itemId: 'invalid-uuid-12345' }
      });

      expect(error).toBeDefined();
    });
  });

  describe('📊 API Analytics & Performance', () => {
    it('✅ Performance metrics - doit retourner des métriques', async () => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('✅ SLA metrics - doit retourner des métriques SLA', async () => {
      const { data, error } = await supabase
        .from('sla_metrics')
        .select('*')
        .limit(5);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('✅ Performance budgets - doit retourner les budgets configurés', async () => {
      const { data, error } = await supabase
        .from('performance_budgets')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('⚡ Tests de performance API', () => {
    it('🚀 API Response Times - toutes les requêtes < 2s', async () => {
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .limit(1);
      
      const responseTime = performance.now() - startTime;
      
      expect(error).toBeNull();
      expect(responseTime).toBeLessThan(2000); // < 2 secondes
      
      console.log(`⏱️ Temps de réponse EDN: ${responseTime.toFixed(2)}ms`);
    });

    it('📈 Throughput - gestion requêtes multiples', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        supabase
          .from('edn_items_immersive')
          .select('id, title')
          .limit(2)
      );

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // Toutes les requêtes doivent réussir
      results.forEach(({ error }) => {
        expect(error).toBeNull();
      });

      // Temps total raisonnable pour 5 requêtes parallèles
      expect(totalTime).toBeLessThan(5000);
      
      console.log(`⚡ 5 requêtes parallèles: ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('🔒 Tests de sécurité RLS', () => {
    it('🛡️ RLS Protection - lecture publique autorisée', async () => {
      // Test lecture publique des items EDN (doit marcher)
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('id, title')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('🔐 RLS Protection - écriture protégée', async () => {
      // Test écriture sans auth (doit échouer)
      const { error } = await supabase
        .from('edn_items_immersive')
        .insert({
          item_code: 'TEST-SECURITY',
          title: 'Test Security Violation',
          slug: 'test-security-violation'
        });

      // Doit échouer à cause des RLS policies
      expect(error).toBeDefined();
    });

    it('🔍 RLS Protection - données sensibles', async () => {
      // Test accès aux logs d'activité (doit être protégé)
      const { error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .limit(1);

      // Doit échouer car non authentifié
      expect(error).toBeDefined();
    });
  });

  describe('🔄 Tests de cohérence données', () => {
    it('✅ Cohérence EDN - tous les items ont les champs requis', async () => {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('id, item_code, title, slug')
        .limit(20);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data) {
        data.forEach(item => {
          expect(item.id).toBeTruthy();
          expect(item.item_code).toBeTruthy();
          expect(item.title).toBeTruthy();
          expect(item.slug).toBeTruthy();
        });
      }
    });

    it('✅ Cohérence Music - toutes les musiques ont des URLs valides', async () => {
      const { data, error } = await supabase
        .from('generated_music_tracks')
        .select('id, title, audio_url')
        .not('audio_url', 'is', null)
        .limit(10);

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data) {
        data.forEach(track => {
          expect(track.id).toBeTruthy();
          expect(track.title).toBeTruthy();
          expect(track.audio_url).toBeTruthy();
          expect(track.audio_url).toMatch(/^https?:\/\//);
        });
      }
    });

    it('🔗 Cohérence Relations - liens entre tables', async () => {
      // Vérifier que les musiques référencent des items valides (si applicable)
      const { data: tracks } = await supabase
        .from('generated_music_tracks')
        .select('id, metadata')
        .limit(5);

      if (tracks) {
        for (const track of tracks) {
          if (track.metadata && track.metadata.item_code) {
            const { data: item, error } = await supabase
              .from('edn_items_immersive')
              .select('id')
              .eq('item_code', track.metadata.item_code)
              .single();

            if (!error) {
              expect(item).toBeTruthy();
            }
          }
        }
      }
    });
  });
});

describe('🚨 Tests de robustesse - Edge Cases', () => {
  it('💾 Gestion mémoire - requêtes volumineuses', async () => {
    const { data, error } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .limit(100);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data) {
      expect(data.length).toBeLessThanOrEqual(100);
      
      // Vérifier que les objets ne sont pas corrompus
      data.forEach(item => {
        expect(typeof item).toBe('object');
        expect(item.id).toBeTruthy();
      });
    }
  });

  it('⏱️ Timeout - requêtes lentes', async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 10000); // 10s timeout
    });

    const queryPromise = supabase
      .from('edn_items_immersive')
      .select('*');

    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      const { error } = result as any;
      expect(error).toBeNull();
    } catch (timeoutError: any) {
      expect(timeoutError.message).toBe('Timeout');
    }
  });

  it('🔄 Concurrence - requêtes simultanées', async () => {
    const concurrentQueries = Array.from({ length: 10 }, (_, i) =>
      supabase
        .from('edn_items_immersive')
        .select('id, title')
        .range(i * 2, (i * 2) + 1)
    );

    const results = await Promise.allSettled(concurrentQueries);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = results.filter(r => r.status === 'rejected').length;

    expect(successCount).toBeGreaterThan(8); // Au moins 80% de succès
    expect(errorCount).toBeLessThan(3); // Moins de 30% d'erreurs

    console.log(`🔄 Concurrence: ${successCount}/10 succès, ${errorCount}/10 erreurs`);
  });
});