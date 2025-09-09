/**
 * Service musical unifié - Consolidation des services musicaux existants
 * Combine les fonctionnalités de musicService.ts et business/MusicService.ts
 */

import { supabase } from "@/integrations/supabase/client";
import { analyticsService } from './UnifiedAnalyticsService';
import { logger } from '@/lib/logger';
import type { MusicTrack, Playlist, ApiResponse } from '@/types';

// Types spécifiques au service musical unifié
export interface MusicGenerationRequest {
  item_id: string;
  item_code: string;
  title: string;
  rang_type: 'A' | 'B' | 'mix';
  paroles?: string[];
  custom_prompt?: string;
  style?: string;
  duration?: number;
}

export interface GeneratedSong {
  id: string;
  song_uuid: string;
  audio_url: string;
  title: string;
  metadata: {
    suno_id: string;
    generation_time: string;
    prompt_used: string;
    model: string;
  };
}

export interface GenerationStats {
  total_generations: number;
  success_rate: number;
  average_duration: number;
  last_24h_count: number;
  status_breakdown: Record<string, number>;
  performance_alerts: number;
  slowest_generation: number;
  fastest_generation: number;
}

export interface UserSong {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  emotionscare_songs: {
    id: string;
    title: string;
    suno_audio_id: string;
    meta: any;
    created_at: string;
  };
}

export interface Favorite {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
}

export interface MusicGenerationResponse {
  success: boolean;
  generation_id: string;
  song?: GeneratedSong;
  duration_seconds?: number;
  added_to_library?: boolean;
  error?: string;
}

class UnifiedMusicService {
  private static instance: UnifiedMusicService;

  static getInstance(): UnifiedMusicService {
    if (!UnifiedMusicService.instance) {
      UnifiedMusicService.instance = new UnifiedMusicService();
    }
    return UnifiedMusicService.instance;
  }

  // Configuration dynamique basée sur l'environnement Supabase
  private get baseUrl(): string {
    return 'https://yaincoxihiqdksxgrsrk.supabase.co/functions/v1';
  }

  // ========== GÉNÉRATION MUSICALE (du musicService.ts) ==========

  /**
   * Génère une chanson via edge function Supabase
   */
  async generateSong(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('music-generation', {
        body: request,
        method: 'POST'
      });

      if (error) {
        throw new Error(`Erreur génération: ${error.message}`);
      }

      const duration = Date.now() - startTime;

      if (data.success) {
        this.trackGeneration(request, data.duration_seconds || 0, true);
        
        // Analytics
        analyticsService.trackUserAction('music', 'generation_success', {
          item_code: request.item_code,
          duration: data.duration_seconds,
          generation_time: duration
        });
        
        logger.info('Chanson générée avec succès', {
          component: 'UnifiedMusicService',
          action: 'generate_song',
          metadata: { item_code: request.item_code, duration: data.duration_seconds }
        });
      } else {
        this.trackGeneration(request, 0, false, data.error);
        
        analyticsService.trackError(new Error(data.error), { 
          action: 'music_generation', 
          item_code: request.item_code 
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      this.trackGeneration(request, 0, false, errorMessage);
      analyticsService.trackError(error as Error, { action: 'music_generation' });
      
      logger.error('Erreur génération musicale', {
        component: 'UnifiedMusicService',
        action: 'generate_song',
        metadata: { item_code: request.item_code }
      });
      
      throw new Error(`Erreur génération musicale: ${errorMessage}`);
    }
  }

  /**
   * Génération de musique avec prompt (approche business/MusicService)
   */
  async generateMusic(prompt: string, style: string, duration: number): Promise<ApiResponse<MusicTrack>> {
    try {
      const request: MusicGenerationRequest = {
        item_id: crypto.randomUUID(),
        item_code: 'CUSTOM',
        title: prompt.substring(0, 50),
        rang_type: 'mix',
        custom_prompt: prompt,
        style,
        duration
      };

      const result = await this.generateSong(request);
      
      if (result.success && result.song) {
        return {
          success: true,
          data: {
            id: result.song.id,
            title: result.song.title,
            artist: 'AI Generated',
            duration: result.duration_seconds || duration,
            audio_url: result.song.audio_url,
            genre: style || 'Generated',
            is_generated: true,
            generation_status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
      }

      return { success: false, error: result.error || 'Erreur génération' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur génération musique' 
      };
    }
  }

  /**
   * Récupère les statistiques de génération
   */
  async getGenerationStats(): Promise<GenerationStats> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch(`${this.baseUrl}/music-generation/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const stats = await response.json();
      
      analyticsService.trackUserAction('music', 'stats_retrieved', { stats_count: 1 });
      
      return stats;
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_generation_stats' });
      throw new Error(`Erreur récupération stats: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère le statut de génération d'une piste
   */
  async getGenerationStatus(trackId: string): Promise<ApiResponse<{ status: string; progress?: number }>> {
    try {
      // Pour l'instant, simulation car pas d'endpoint spécifique
      return {
        success: true,
        data: { status: 'completed', progress: 100 }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur statut génération'
      };
    }
  }

  // ========== BIBLIOTHÈQUE UTILISATEUR (du musicService.ts) ==========

  /**
   * Récupère la bibliothèque musicale de l'utilisateur
   */
  async getUserLibrary(): Promise<UserSong[]> {
    try {
      const { data, error } = await supabase
        .from('emotionscare_user_songs')
        .select(`
          *,
          emotionscare_songs (
            id,
            title,
            suno_audio_id,
            meta,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur base de données: ${error.message}`);
      }
      
      analyticsService.trackUserAction('music', 'library_accessed', { 
        songs_count: data?.length || 0 
      });
      
      return (data || []) as UserSong[];
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_user_library' });
      throw new Error(`Erreur récupération bibliothèque: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Ajoute une chanson à la bibliothèque
   */
  async addToLibrary(songId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { error } = await supabase
        .from('emotionscare_user_songs')
        .insert({
          user_id: user.id,
          song_id: songId,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Erreur base de données: ${error.message}`);
      }
      
      analyticsService.trackUserAction('music', 'song_added_to_library', { songId }, user.id);
      
      logger.info('Chanson ajoutée à la bibliothèque', {
        component: 'UnifiedMusicService',
        action: 'add_to_library',
        metadata: { songId, userId: user.id }
      });
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'add_to_library', songId });
      throw new Error(`Erreur ajout bibliothèque: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprime une chanson de la bibliothèque
   */
  async removeFromLibrary(songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emotionscare_user_songs')
        .delete()
        .eq('song_id', songId);

      if (error) {
        throw new Error(`Erreur base de données: ${error.message}`);
      }
      
      analyticsService.trackUserAction('music', 'song_removed_from_library', { songId });
      
      logger.info('Chanson supprimée de la bibliothèque', {
        component: 'UnifiedMusicService',
        action: 'remove_from_library',
        metadata: { songId }
      });
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'remove_from_library', songId });
      throw new Error(`Erreur suppression bibliothèque: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // ========== GESTION DES PISTES (du business/MusicService) ==========

  /**
   * Récupère les pistes musicales avec filtres
   */
  async getTracks(filters?: {
    genre?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MusicTrack[]>> {
    try {
      let query = supabase
        .from('emotionscare_songs')
        .select('*');

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const tracks: MusicTrack[] = (data || []).map(song => ({
        id: song.id,
        title: song.title,
        artist: 'AI Generated',
        duration: this.extractDurationFromMeta(song.meta) || 0,
        audio_url: song.suno_audio_id,
        genre: 'Generated',
        is_generated: true,
        generation_status: 'completed',
        created_at: song.created_at,
        updated_at: song.created_at
      }));

      analyticsService.trackUserAction('music', 'tracks_retrieved', { 
        count: tracks.length,
        filters 
      });

      return { success: true, data: tracks };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_tracks', filters });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur récupération pistes'
      };
    }
  }

  /**
   * Récupère une piste spécifique
   */
  async getTrack(id: string): Promise<ApiResponse<MusicTrack>> {
    try {
      const { data, error } = await supabase
        .from('emotionscare_songs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const track: MusicTrack = {
        id: data.id,
        title: data.title,
        artist: 'AI Generated',
        duration: this.extractDurationFromMeta(data.meta) || 0,
        audio_url: data.suno_audio_id,
        genre: 'Generated',
        is_generated: true,
        generation_status: 'completed',
        created_at: data.created_at,
        updated_at: data.created_at
      };

      analyticsService.trackUserAction('music', 'track_retrieved', { trackId: id });

      return { success: true, data: track };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_track', trackId: id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur récupération piste'
      };
    }
  }

  // ========== PLAYLISTS ==========

  /**
   * Récupère les playlists de l'utilisateur
   */
  async getPlaylists(): Promise<ApiResponse<Playlist[]>> {
    try {
      // Pour l'instant simulation, car les tables playlist ne sont pas encore créées
      return { success: true, data: [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur récupération playlists'
      };
    }
  }

  /**
   * Crée une nouvelle playlist
   */
  async createPlaylist(name: string, description?: string): Promise<ApiResponse<Playlist>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Simulation pour l'instant
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name,
        description,
        is_public: false,
        tracks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      analyticsService.trackUserAction('music', 'playlist_created', { 
        playlistName: name 
      }, user.id);

      logger.info('Playlist créée', {
        component: 'UnifiedMusicService',
        action: 'create_playlist',
        metadata: { name, userId: user.id }
      });

      return { success: true, data: newPlaylist };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'create_playlist', name });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur création playlist'
      };
    }
  }

  /**
   * Ajoute une piste à une playlist
   */
  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<ApiResponse<void>> {
    try {
      // Simulation pour l'instant
      analyticsService.trackUserAction('music', 'track_added_to_playlist', { 
        playlistId, 
        trackId 
      });

      logger.info('Piste ajoutée à la playlist', {
        component: 'UnifiedMusicService',
        action: 'add_track_to_playlist',
        metadata: { playlistId, trackId }
      });

      return { success: true };
    } catch (error) {
      analyticsService.trackError(error as Error, { 
        action: 'add_track_to_playlist', 
        playlistId, 
        trackId 
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur ajout piste playlist'
      };
    }
  }

  /**
   * Supprime une piste d'une playlist
   */
  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<ApiResponse<void>> {
    try {
      // Simulation pour l'instant
      analyticsService.trackUserAction('music', 'track_removed_from_playlist', { 
        playlistId, 
        trackId 
      });

      return { success: true };
    } catch (error) {
      analyticsService.trackError(error as Error, { 
        action: 'remove_track_from_playlist', 
        playlistId, 
        trackId 
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur suppression piste playlist'
      };
    }
  }

  // ========== FAVORIS ==========

  /**
   * Récupère les favoris de l'utilisateur
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const { data, error } = await supabase
        .from('emotionscare_song_likes')
        .select(`
          *,
          emotionscare_songs (
            id,
            title,
            suno_audio_id,
            meta,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur base de données: ${error.message}`);
      }
      
      analyticsService.trackUserAction('music', 'favorites_retrieved', { 
        count: data?.length || 0 
      });
      
      return (data || []) as Favorite[];
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_favorites' });
      throw new Error(`Erreur récupération favoris: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Toggle le statut favori d'une chanson
   */
  async toggleFavorite(songId: string): Promise<boolean> {
    try {
      // Vérifier si déjà en favori
      const { data: existing } = await supabase
        .from('emotionscare_song_likes')
        .select('id')
        .eq('song_id', songId)
        .single();

      if (existing) {
        // Retirer des favoris
        const { error } = await supabase
          .from('emotionscare_song_likes')
          .delete()
          .eq('song_id', songId);

        if (error) {
          throw new Error(`Erreur base de données: ${error.message}`);
        }
        
        analyticsService.trackUserAction('music', 'favorite_removed', { songId });
        return false;
      } else {
        // Ajouter aux favoris
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non authentifié');
        }

        const { error } = await supabase
          .from('emotionscare_song_likes')
          .insert({
            user_id: user.id,
            song_id: songId,
            created_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Erreur base de données: ${error.message}`);
        }
        
        analyticsService.trackUserAction('music', 'favorite_added', { songId }, user.id);
        return true;
      }
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'toggle_favorite', songId });
      throw new Error(`Erreur gestion favoris: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // ========== STREAMING SÉCURISÉ ==========

  /**
   * Génère une URL de streaming sécurisée
   */
  getSecureStreamingUrl(songId: string): string {
    const timestamp = Date.now();
    const token = btoa(`${songId}:${timestamp}`);
    return `${this.baseUrl}/music-generation/stream/${songId}?token=${token}&t=${timestamp}`;
  }

  // ========== MÉTHODES PRIVÉES ==========

  private extractDurationFromMeta(meta: any): number {
    try {
      if (!meta) return 0;
      if (typeof meta === 'object' && meta.duration) {
        return typeof meta.duration === 'number' ? meta.duration : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private trackGeneration(
    request: MusicGenerationRequest, 
    duration: number, 
    success: boolean, 
    error?: string
  ): void {
    const event = {
      event_type: 'music_generation',
      item_code: request.item_code,
      rang_type: request.rang_type,
      duration_seconds: duration,
      success,
      error,
      timestamp: new Date().toISOString()
    };
    
    logger.debug('Tracking génération musicale', {
      component: 'UnifiedMusicService',
      action: 'track_generation',
      metadata: event
    });
    
    // Stocker en local storage pour analytics client
    try {
      const existingEvents = JSON.parse(localStorage.getItem('music_analytics') || '[]');
      existingEvents.push(event);
      // Garder seulement les 100 derniers événements
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      localStorage.setItem('music_analytics', JSON.stringify(existingEvents));
    } catch (storageError) {
      logger.error('Erreur stockage analytics local', {
        component: 'UnifiedMusicService',
        action: 'track_generation'
      });
    }
  }
}

// Export instance et types
export const musicService = UnifiedMusicService.getInstance();
export default UnifiedMusicService;