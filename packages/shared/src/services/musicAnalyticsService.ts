/**
 * 🎵 Service d'Analytics Avancé pour Génération Musicale
 *
 * Collecte et analyse:
 * - Comportement utilisateur
 * - Performances du système
 * - ROI et coûts
 * - Tendances d'utilisation
 */

import { supabase } from '../lib/supabase';

export interface TrackEngagement {
  track_id: string;
  user_id: string;
  event_type: 'play' | 'pause' | 'skip' | 'complete' | 'favorite' | 'share' | 'download';
  timestamp: string;
  duration_listened?: number;
  metadata?: any;
}

export interface GenerationMetrics {
  date: string;
  total_generations: number;
  successful_generations: number;
  failed_generations: number;
  avg_duration_seconds: number;
  cache_hits: number;
  api_cost_eur: number;
}

export interface StylePopularity {
  style: string;
  generation_count: number;
  avg_listen_duration: number;
  completion_rate: number;
  favorite_count: number;
}

export interface UserBehavior {
  user_id: string;
  total_generations: number;
  favorite_styles: string[];
  avg_session_duration: number;
  most_listened_items: string[];
  engagement_score: number;
}

export class MusicAnalyticsService {
  /**
   * Enregistrer un événement d'engagement
   */
  static async trackEngagement(event: Omit<TrackEngagement, 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('music_track_engagement')
        .insert({
          ...event,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erreur enregistrement engagement:', error);
      } else {
        console.log('✅ Engagement enregistré:', event.event_type);
      }
    } catch (error) {
      console.error('❌ Erreur inattendue engagement:', error);
    }
  }

  /**
   * Obtenir les métriques de génération par période
   */
  static async getGenerationMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<GenerationMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('music_generation_metrics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agréger par jour
      const metricsByDay = new Map<string, GenerationMetrics>();

      data?.forEach(metric => {
        const day = metric.created_at.split('T')[0];

        if (!metricsByDay.has(day)) {
          metricsByDay.set(day, {
            date: day,
            total_generations: 0,
            successful_generations: 0,
            failed_generations: 0,
            avg_duration_seconds: 0,
            cache_hits: 0,
            api_cost_eur: 0
          });
        }

        const dayMetrics = metricsByDay.get(day)!;
        dayMetrics.total_generations++;

        if (metric.status === 'completed') {
          dayMetrics.successful_generations++;
          dayMetrics.avg_duration_seconds += metric.generation_duration_seconds || 0;
        } else if (metric.status === 'failed') {
          dayMetrics.failed_generations++;
        }

        if (metric.cache_hit) {
          dayMetrics.cache_hits++;
        } else {
          // Estimation coût API: 0.5€ par génération
          dayMetrics.api_cost_eur += 0.5;
        }
      });

      // Calculer moyenne des durées
      const metrics = Array.from(metricsByDay.values()).map(m => ({
        ...m,
        avg_duration_seconds: m.successful_generations > 0
          ? Math.round(m.avg_duration_seconds / m.successful_generations)
          : 0
      }));

      return metrics;
    } catch (error) {
      console.error('❌ Erreur récupération métriques:', error);
      return [];
    }
  }

  /**
   * Obtenir la popularité des styles musicaux
   */
  static async getStylePopularity(limit: number = 20): Promise<StylePopularity[]> {
    try {
      // Requête pour compter les générations par style
      const { data: generationData } = await supabase
        .from('generated_music_tracks')
        .select('id, metadata')
        .not('metadata', 'is', null);

      // Requête pour les écoutes et favoris
      const { data: engagementData } = await supabase
        .from('music_track_engagement')
        .select('track_id, event_type, duration_listened');

      if (!generationData) return [];

      // Agréger par style
      const styleStats = new Map<string, {
        count: number;
        total_listen_duration: number;
        complete_count: number;
        favorite_count: number;
      }>();

      generationData.forEach(track => {
        const style = track.metadata?.style || 'unknown';

        if (!styleStats.has(style)) {
          styleStats.set(style, {
            count: 0,
            total_listen_duration: 0,
            complete_count: 0,
            favorite_count: 0
          });
        }

        const stats = styleStats.get(style)!;
        stats.count++;

        // Ajouter stats d'engagement
        const trackEngagements = engagementData?.filter(e => e.track_id === track.id) || [];
        trackEngagements.forEach(engagement => {
          if (engagement.duration_listened) {
            stats.total_listen_duration += engagement.duration_listened;
          }
          if (engagement.event_type === 'complete') {
            stats.complete_count++;
          }
          if (engagement.event_type === 'favorite') {
            stats.favorite_count++;
          }
        });
      });

      // Convertir en tableau et calculer les métriques
      const popularity: StylePopularity[] = Array.from(styleStats.entries()).map(([style, stats]) => ({
        style,
        generation_count: stats.count,
        avg_listen_duration: stats.count > 0
          ? Math.round(stats.total_listen_duration / stats.count)
          : 0,
        completion_rate: stats.count > 0
          ? Math.round((stats.complete_count / stats.count) * 100)
          : 0,
        favorite_count: stats.favorite_count
      }));

      // Trier par nombre de générations
      popularity.sort((a, b) => b.generation_count - a.generation_count);

      return popularity.slice(0, limit);
    } catch (error) {
      console.error('❌ Erreur récupération popularité styles:', error);
      return [];
    }
  }

  /**
   * Obtenir le comportement utilisateur
   */
  static async getUserBehavior(userId?: string): Promise<UserBehavior | null> {
    try {
      // Obtenir l'utilisateur actuel si non fourni
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        userId = user.id;
      }

      // Compter les générations
      const { count: totalGenerations } = await supabase
        .from('generated_music_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Récupérer les tracks de l'utilisateur
      const { data: userTracks } = await supabase
        .from('generated_music_tracks')
        .select('metadata, id')
        .eq('user_id', userId);

      // Styles favoris
      const styleCount = new Map<string, number>();
      userTracks?.forEach(track => {
        const style = track.metadata?.style || 'unknown';
        styleCount.set(style, (styleCount.get(style) || 0) + 1);
      });
      const favoriteStyles = Array.from(styleCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([style]) => style);

      // Items les plus écoutés
      const { data: engagements } = await supabase
        .from('music_track_engagement')
        .select('track_id, duration_listened')
        .eq('user_id', userId)
        .eq('event_type', 'play');

      const trackListenTime = new Map<string, number>();
      engagements?.forEach(e => {
        const current = trackListenTime.get(e.track_id) || 0;
        trackListenTime.set(e.track_id, current + (e.duration_listened || 0));
      });

      const topTrackIds = Array.from(trackListenTime.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trackId]) => trackId);

      // Récupérer les détails des top tracks
      const { data: topTracks } = await supabase
        .from('generated_music_tracks')
        .select('metadata')
        .in('id', topTrackIds);

      const mostListenedItems = topTracks?.map(t => t.metadata?.itemCode || 'Unknown') || [];

      // Durée moyenne de session (temps total / nombre de sessions)
      const totalListenTime = Array.from(trackListenTime.values()).reduce((a, b) => a + b, 0);
      const avgSessionDuration = engagements && engagements.length > 0
        ? Math.round(totalListenTime / engagements.length)
        : 0;

      // Score d'engagement (0-100)
      const engagementScore = this.calculateEngagementScore({
        totalGenerations: totalGenerations || 0,
        totalListenTime,
        avgSessionDuration
      });

      return {
        user_id: userId,
        total_generations: totalGenerations || 0,
        favorite_styles: favoriteStyles,
        avg_session_duration: avgSessionDuration,
        most_listened_items: mostListenedItems,
        engagement_score: engagementScore
      };
    } catch (error) {
      console.error('❌ Erreur récupération comportement utilisateur:', error);
      return null;
    }
  }

  /**
   * Calculer le score d'engagement (0-100)
   */
  private static calculateEngagementScore(params: {
    totalGenerations: number;
    totalListenTime: number;
    avgSessionDuration: number;
  }): number {
    const { totalGenerations, totalListenTime, avgSessionDuration } = params;

    // Pondération des facteurs
    const generationScore = Math.min(totalGenerations * 5, 40); // Max 40 points
    const listenScore = Math.min(totalListenTime / 60, 30); // Max 30 points (1 point par minute)
    const sessionScore = Math.min(avgSessionDuration / 10, 30); // Max 30 points

    return Math.round(generationScore + listenScore + sessionScore);
  }

  /**
   * Obtenir les tendances temporelles
   */
  static async getTimeTrends(days: number = 30): Promise<{
    labels: string[];
    generations: number[];
    cacheHits: number[];
    avgDuration: number[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await this.getGenerationMetrics(startDate, endDate);

      const labels = metrics.map(m => m.date);
      const generations = metrics.map(m => m.total_generations);
      const cacheHits = metrics.map(m => m.cache_hits);
      const avgDuration = metrics.map(m => m.avg_duration_seconds);

      return {
        labels,
        generations,
        cacheHits,
        avgDuration
      };
    } catch (error) {
      console.error('❌ Erreur récupération tendances:', error);
      return {
        labels: [],
        generations: [],
        cacheHits: [],
        avgDuration: []
      };
    }
  }

  /**
   * Obtenir le ROI du cache
   */
  static async getCacheROI(days: number = 30): Promise<{
    totalSaved: number;
    cacheCost: number;
    netSavings: number;
    roi: number;
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await this.getGenerationMetrics(startDate, endDate);

      const totalCacheHits = metrics.reduce((sum, m) => sum + m.cache_hits, 0);
      const totalSaved = totalCacheHits * 0.5; // 0.5€ par hit

      // Coût du cache (stockage, maintenance)
      const cacheCost = days * 0.1; // 0.1€ par jour

      const netSavings = totalSaved - cacheCost;
      const roi = cacheCost > 0 ? Math.round((netSavings / cacheCost) * 100) : 0;

      return {
        totalSaved,
        cacheCost,
        netSavings,
        roi
      };
    } catch (error) {
      console.error('❌ Erreur calcul ROI cache:', error);
      return {
        totalSaved: 0,
        cacheCost: 0,
        netSavings: 0,
        roi: 0
      };
    }
  }
}
