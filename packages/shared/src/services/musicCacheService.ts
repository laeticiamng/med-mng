/**
 * 🎵 Service de Cache pour Génération Musicale
 *
 * Évite les régénérations identiques en cachant les résultats
 * Réduit les coûts API et améliore la performance
 */

import { supabase } from '../lib/supabase';

interface CacheKey {
  itemCode: string;
  rang: 'A' | 'B' | 'AB';
  style: string;
  language?: string;
}

interface CachedTrack {
  id: string;
  task_id: string;
  audio_url: string;
  stream_url?: string;
  image_url?: string;
  title: string;
  metadata: any;
  created_at: string;
  cache_hit_count?: number;
}

export class MusicCacheService {
  private static CACHE_DURATION_DAYS = 30; // Cache valide 30 jours

  /**
   * Générer une clé de cache unique
   */
  private static generateCacheKey(params: CacheKey): string {
    const { itemCode, rang, style, language = 'fr' } = params;
    return `${itemCode}:${rang}:${style}:${language}`.toLowerCase();
  }

  /**
   * Rechercher un track en cache
   */
  static async findCachedTrack(params: CacheKey): Promise<CachedTrack | null> {
    const cacheKey = this.generateCacheKey(params);
    console.log('🔍 Recherche en cache:', cacheKey);

    try {
      // Chercher dans la table avec le cache_key
      const { data: tracks, error } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .eq('cache_key', cacheKey)
        .eq('generation_status', 'completed')
        .not('audio_url', 'is', null)
        .gte('created_at', this.getMinCacheDate())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Erreur recherche cache:', error);
        return null;
      }

      if (!tracks || tracks.length === 0) {
        console.log('❌ Aucun cache trouvé pour:', cacheKey);
        return null;
      }

      const cachedTrack = tracks[0];
      console.log('✅ CACHE HIT! Track trouvé:', {
        id: cachedTrack.id,
        created_at: cachedTrack.created_at,
        cache_hit_count: cachedTrack.cache_hit_count || 0
      });

      // Incrémenter le compteur de hits
      await this.incrementCacheHit(cachedTrack.id);

      return {
        id: cachedTrack.id,
        task_id: cachedTrack.task_id,
        audio_url: cachedTrack.audio_url,
        stream_url: cachedTrack.metadata?.stream_url,
        image_url: cachedTrack.metadata?.image_url,
        title: cachedTrack.title,
        metadata: cachedTrack.metadata,
        created_at: cachedTrack.created_at,
        cache_hit_count: (cachedTrack.cache_hit_count || 0) + 1
      };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la recherche cache:', error);
      return null;
    }
  }

  /**
   * Enregistrer un track en cache
   */
  static async cacheTrack(params: CacheKey, trackId: string): Promise<void> {
    const cacheKey = this.generateCacheKey(params);
    console.log('💾 Enregistrement cache:', cacheKey, 'pour track:', trackId);

    try {
      // Mettre à jour le track avec la cache_key
      const { error } = await supabase
        .from('generated_music_tracks')
        .update({
          cache_key: cacheKey,
          cache_hit_count: 0,
          cache_created_at: new Date().toISOString()
        })
        .eq('id', trackId);

      if (error) {
        console.error('❌ Erreur enregistrement cache:', error);
      } else {
        console.log('✅ Cache enregistré avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'enregistrement cache:', error);
    }
  }

  /**
   * Incrémenter le compteur de hits
   */
  private static async incrementCacheHit(trackId: string): Promise<void> {
    try {
      // Utiliser RPC pour incrémenter atomiquement
      const { error } = await supabase.rpc('increment_cache_hit', {
        track_id: trackId
      });

      if (error) {
        console.warn('⚠️ Impossible d\'incrémenter cache hit:', error);
        // Non bloquant, on continue
      }
    } catch (error) {
      console.warn('⚠️ Erreur incrémentation cache hit:', error);
    }
  }

  /**
   * Date minimale pour cache valide
   */
  private static getMinCacheDate(): string {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() - this.CACHE_DURATION_DAYS);
    return minDate.toISOString();
  }

  /**
   * Obtenir les statistiques du cache
   */
  static async getCacheStats(): Promise<{
    totalCached: number;
    totalHits: number;
    topTracks: Array<{ itemCode: string; rang: string; hits: number }>;
    cacheHitRate: number;
  }> {
    try {
      // Compter les tracks cachés
      const { count: totalCached } = await supabase
        .from('generated_music_tracks')
        .select('*', { count: 'exact', head: true })
        .not('cache_key', 'is', null)
        .gte('created_at', this.getMinCacheDate());

      // Compter les hits totaux
      const { data: hitsData } = await supabase
        .from('generated_music_tracks')
        .select('cache_hit_count')
        .not('cache_key', 'is', null)
        .gte('created_at', this.getMinCacheDate());

      const totalHits = hitsData?.reduce((sum, track) => sum + (track.cache_hit_count || 0), 0) || 0;

      // Top tracks les plus réutilisés
      const { data: topTracks } = await supabase
        .from('generated_music_tracks')
        .select('metadata, cache_hit_count, cache_key')
        .not('cache_key', 'is', null)
        .gte('cache_hit_count', 1)
        .order('cache_hit_count', { ascending: false })
        .limit(10);

      const formattedTopTracks = topTracks?.map(track => {
        const [itemCode, rang] = track.cache_key?.split(':') || ['', ''];
        return {
          itemCode: itemCode,
          rang: rang,
          hits: track.cache_hit_count || 0
        };
      }) || [];

      // Taux de hit du cache
      const totalGenerations = (totalCached || 0) + (totalHits || 0);
      const cacheHitRate = totalGenerations > 0 ? Math.round((totalHits / totalGenerations) * 100) : 0;

      return {
        totalCached: totalCached || 0,
        totalHits: totalHits,
        topTracks: formattedTopTracks,
        cacheHitRate
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats cache:', error);
      return {
        totalCached: 0,
        totalHits: 0,
        topTracks: [],
        cacheHitRate: 0
      };
    }
  }

  /**
   * Invalider le cache pour un item spécifique
   */
  static async invalidateCache(params: CacheKey): Promise<void> {
    const cacheKey = this.generateCacheKey(params);
    console.log('🗑️ Invalidation cache:', cacheKey);

    try {
      const { error } = await supabase
        .from('generated_music_tracks')
        .update({
          cache_key: null,
          cache_hit_count: 0
        })
        .eq('cache_key', cacheKey);

      if (error) {
        console.error('❌ Erreur invalidation cache:', error);
      } else {
        console.log('✅ Cache invalidé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de l\'invalidation cache:', error);
    }
  }

  /**
   * Nettoyer les caches expirés
   */
  static async cleanExpiredCache(): Promise<number> {
    console.log('🧹 Nettoyage des caches expirés...');

    try {
      const minDate = this.getMinCacheDate();

      const { data: expiredTracks, error } = await supabase
        .from('generated_music_tracks')
        .update({
          cache_key: null,
          cache_hit_count: 0
        })
        .not('cache_key', 'is', null)
        .lt('created_at', minDate)
        .select('id');

      if (error) {
        console.error('❌ Erreur nettoyage cache:', error);
        return 0;
      }

      const cleanedCount = expiredTracks?.length || 0;
      console.log(`✅ ${cleanedCount} caches expirés nettoyés`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Erreur inattendue lors du nettoyage cache:', error);
      return 0;
    }
  }
}
