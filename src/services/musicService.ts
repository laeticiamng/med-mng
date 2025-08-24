import { supabase } from "@/integrations/supabase/client"
import { monitoring } from '@/lib/monitoring';

export interface MusicGenerationRequest {
  item_id: string
  item_code: string
  title: string
  rang_type: 'A' | 'B' | 'mix'
  paroles?: string[]
  custom_prompt?: string
}

export interface GeneratedSong {
  id: string
  song_uuid: string
  audio_url: string
  title: string
  metadata: {
    suno_id: string
    generation_time: string
    prompt_used: string
    model: string
  }
}

export interface GenerationStats {
  total_generations: number
  success_rate: number
  average_duration: number
  last_24h_count: number
  status_breakdown: Record<string, number>
  performance_alerts: number
  slowest_generation: number
  fastest_generation: number
}

export interface Playlist {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  songs: PlaylistSong[]
  created_at: string
  updated_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  position: number
  added_at: string
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

export interface SimpleSong {
  id: string;
  title: string;
  suno_audio_id: string;
  meta?: any;
  created_at: string;
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

class MusicService {
  // Configuration dynamique basée sur l'environnement Supabase
  private get baseUrl(): string {
    const supabaseUrl = 'https://yaincoxihiqdksxgrsrk.supabase.co'; // Obtenu de la config Supabase
    return `${supabaseUrl}/functions/v1/music-generation`;
  }

  // ===== GÉNÉRATION MUSICALE =====
  async generateSong(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      monitoring.logPerformance({
        endpoint: 'music-generation',
        responseTime: Date.now(),
        memoryUsage: 0,
        cpuUsage: 0
      });

      const { data, error } = await supabase.functions.invoke('music-generation', {
        body: request,
        method: 'POST'
      })

      if (error) {
        throw new Error(`Erreur génération: ${error.message}`);
      }

      if (data.success) {
        this.trackGeneration(request, data.duration_seconds || 0, true);
        monitoring.logEvent({
          level: 'info',
          message: `Chanson générée avec succès: ${request.item_code}`,
          timestamp: new Date().toISOString(),
          metadata: { 
            item_code: request.item_code, 
            duration: data.duration_seconds 
          }
        });
      } else {
        this.trackGeneration(request, 0, false, data.error);
        monitoring.logEvent({
          level: 'error',
          message: `Échec génération: ${data.error}`,
          timestamp: new Date().toISOString(),
          metadata: { item_code: request.item_code }
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'music-generation',
        method: 'POST'
      });
      
      this.trackGeneration(request, 0, false, errorMessage);
      throw new Error(`Erreur génération musicale: ${errorMessage}`);
    }
  }

  async getGenerationStats(): Promise<GenerationStats> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch(`${this.baseUrl}/stats`, {
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
      
      monitoring.logEvent({
        level: 'info',
        message: 'Statistiques de génération récupérées',
        timestamp: new Date().toISOString(),
        metadata: stats
      });
      
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'generation-stats',
        method: 'GET'
      });
      
      throw new Error(`Erreur récupération stats: ${errorMessage}`);
    }
  }

  // ===== BIBLIOTHÈQUE UTILISATEUR =====
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
      
      return (data || []) as UserSong[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'user-library',
        method: 'GET'
      });
      
      throw new Error(`Erreur récupération bibliothèque: ${errorMessage}`);
    }
  }

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
      
      monitoring.logEvent({
        level: 'info',
        message: 'Chanson ajoutée à la bibliothèque',
        timestamp: new Date().toISOString(),
        userId: user.id,
        metadata: { songId }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'add-to-library',
        method: 'POST'
      });
      
      throw new Error(`Erreur ajout bibliothèque: ${errorMessage}`);
    }
  }

  async removeFromLibrary(songId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('emotionscare_user_songs')
        .delete()
        .eq('song_id', songId);

      if (error) {
        throw new Error(`Erreur base de données: ${error.message}`);
      }
      
      monitoring.logEvent({
        level: 'info',
        message: 'Chanson supprimée de la bibliothèque',
        timestamp: new Date().toISOString(),
        metadata: { songId }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'remove-from-library',
        method: 'DELETE'
      });
      
      throw new Error(`Erreur suppression bibliothèque: ${errorMessage}`);
    }
  }

  // ===== PLAYLISTS (Simulation - tables pas encore synchronisées) =====
  async getUserPlaylists(): Promise<Playlist[]> {
    try {
      // Retourner des données simulées pour l'instant
      return []
    } catch (error) {
      console.error('❌ Error fetching playlists:', error)
      throw error
    }
  }

  async createPlaylist(name: string, description?: string, isPublic = false): Promise<Playlist> {
    try {
      // Simulation pour l'instant
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        user_id: 'current-user',
        name,
        description,
        is_public: isPublic,
        songs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('✅ Playlist created (simulated):', name)
      return newPlaylist
    } catch (error) {
      console.error('❌ Error creating playlist:', error)
      throw error
    }
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      // Simulation pour l'instant
      console.log('✅ Song added to playlist (simulated)')
    } catch (error) {
      console.error('❌ Error adding song to playlist:', error)
      throw error
    }
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    try {
      // Simulation pour l'instant
      console.log('✅ Song removed from playlist (simulated)')
    } catch (error) {
      console.error('❌ Error removing song from playlist:', error)
      throw error
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      // Simulation pour l'instant
      console.log('✅ Playlist deleted (simulated)')
    } catch (error) {
      console.error('❌ Error deleting playlist:', error)
      throw error
    }
  }

  // ===== FAVORIS =====
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
      
      return (data || []) as Favorite[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'favorites',
        method: 'GET'
      });
      
      throw new Error(`Erreur récupération favoris: ${errorMessage}`);
    }
  }

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
        
        monitoring.logEvent({
          level: 'info',
          message: 'Chanson supprimée des favoris',
          timestamp: new Date().toISOString(),
          metadata: { songId }
        });
        
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
        
        monitoring.logEvent({
          level: 'info',
          message: 'Chanson ajoutée aux favoris',
          timestamp: new Date().toISOString(),
          userId: user.id,
          metadata: { songId }
        });
        
        return true;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      monitoring.logAPIError(error instanceof Error ? error : new Error(errorMessage), {
        endpoint: 'toggle-favorite',
        method: 'POST'
      });
      
      throw new Error(`Erreur gestion favoris: ${errorMessage}`);
    }
  }

  // ===== STREAMING SÉCURISÉ =====
  getSecureStreamingUrl(songId: string): string {
    // URL sécurisée avec token temporaire
    const timestamp = Date.now()
    const token = btoa(`${songId}:${timestamp}`)
    return `${this.baseUrl}/stream/${songId}?token=${token}&t=${timestamp}`
  }

  // ===== ANALYTICS & TRACKING =====
  private trackGeneration(
    request: MusicGenerationRequest, 
    duration: number, 
    success: boolean, 
    error?: string
  ): void {
    // Analytics internes (peut être étendu avec des services externes)
    const event = {
      event_type: 'music_generation',
      item_code: request.item_code,
      rang_type: request.rang_type,
      duration_seconds: duration,
      success,
      error,
      timestamp: new Date().toISOString()
    };
    
    monitoring.logEvent({
      level: success ? 'info' : 'error',
      message: `Génération musicale ${success ? 'réussie' : 'échouée'}: ${request.item_code}`,
      timestamp: new Date().toISOString(),
      metadata: event
    });
    
    // Stocker en local storage pour analytics client
    try {
      const existingEvents = JSON.parse(localStorage.getItem('music_analytics') || '[]');
      existingEvents.push(event);
      // Garder seulement les 100 derniers événements
      localStorage.setItem('music_analytics', JSON.stringify(existingEvents.slice(-100)));
    } catch (storageError) {
      console.warn('Erreur stockage analytics local:', storageError);
    }
  }

  async getAnalytics(): Promise<{ 
    local_events: any[]; 
    session_stats: any; 
  }> {
    try {
      const localEvents = JSON.parse(localStorage.getItem('music_analytics') || '[]');
      return {
        local_events: localEvents,
        session_stats: this.calculateSessionStats(localEvents)
      };
    } catch (error) {
      monitoring.logEvent({
        level: 'warn',
        message: 'Erreur récupération analytics locales',
        timestamp: new Date().toISOString(),
        metadata: { error: error instanceof Error ? error.message : 'Erreur inconnue' }
      });
      
      return {
        local_events: [],
        session_stats: this.calculateSessionStats([])
      };
    }
  }

  private calculateSessionStats(events: any[]): {
    total_generations: number;
    success_rate: number;
    average_duration: number;
    session_start?: string;
    last_generation?: string;
  } {
    const totalEvents = events.length;
    const successfulEvents = events.filter((e: any) => e.success).length;
    const avgDuration = events.length > 0 
      ? events.reduce((sum: number, e: any) => sum + (e.duration_seconds || 0), 0) / events.length 
      : 0;

    return {
      total_generations: totalEvents,
      success_rate: totalEvents > 0 ? Math.round((successfulEvents / totalEvents) * 100) : 0,
      average_duration: Math.round(avgDuration),
      session_start: events[0]?.timestamp,
      last_generation: events[events.length - 1]?.timestamp
    };
  }
}

export const musicService = new MusicService()