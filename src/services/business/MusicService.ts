/**
 * Service pour la gestion de la musique
 */

import { logger } from '@/lib/logger';
import { apiService } from '../core/ApiService';
import type { MusicTrack, Playlist, ApiResponse } from '@/types';

class MusicService {
  async getTracks(filters?: {
    genre?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<MusicTrack[]>> {
    try {
      logger.debug('Récupération des pistes musicales', {
        component: 'MusicService',
        action: 'get_tracks',
        metadata: { filters }
      });

      return await apiService.get<MusicTrack[]>('/api/music/tracks', {
        // TODO: Ajouter les paramètres de filtrage
      });
    } catch (error) {
      logger.error('Erreur récupération pistes', {
        component: 'MusicService',
        action: 'get_tracks',
        metadata: { error, filters }
      });
      throw error;
    }
  }

  async getTrack(id: string): Promise<ApiResponse<MusicTrack>> {
    try {
      return await apiService.get<MusicTrack>(`/api/music/tracks/${id}`);
    } catch (error) {
      logger.error('Erreur récupération piste', {
        component: 'MusicService',
        action: 'get_track',
        metadata: { error, trackId: id }
      });
      throw error;
    }
  }

  async createPlaylist(name: string, description?: string): Promise<ApiResponse<Playlist>> {
    try {
      logger.info('Création playlist', {
        component: 'MusicService',
        action: 'create_playlist',
        metadata: { name }
      });

      return await apiService.post<Playlist>('/api/music/playlists', {
        name,
        description
      });
    } catch (error) {
      logger.error('Erreur création playlist', {
        component: 'MusicService',
        action: 'create_playlist',
        metadata: { error, name }
      });
      throw error;
    }
  }

  async getPlaylists(): Promise<ApiResponse<Playlist[]>> {
    try {
      return await apiService.get<Playlist[]>('/api/music/playlists');
    } catch (error) {
      logger.error('Erreur récupération playlists', {
        component: 'MusicService',
        action: 'get_playlists',
        metadata: { error }
      });
      throw error;
    }
  }

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<ApiResponse<void>> {
    try {
      logger.info('Ajout piste à playlist', {
        component: 'MusicService',
        action: 'add_track_to_playlist',
        metadata: { playlistId, trackId }
      });

      return await apiService.post<void>(`/api/music/playlists/${playlistId}/tracks`, {
        track_id: trackId
      });
    } catch (error) {
      logger.error('Erreur ajout piste playlist', {
        component: 'MusicService',
        action: 'add_track_to_playlist',
        metadata: { error, playlistId, trackId }
      });
      throw error;
    }
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/api/music/playlists/${playlistId}/tracks/${trackId}`);
    } catch (error) {
      logger.error('Erreur suppression piste playlist', {
        component: 'MusicService',
        action: 'remove_track_from_playlist',
        metadata: { error, playlistId, trackId }
      });
      throw error;
    }
  }

  async generateMusic(prompt: string, style: string, duration: number): Promise<ApiResponse<MusicTrack>> {
    try {
      logger.info('Génération musique', {
        component: 'MusicService',
        action: 'generate_music',
        metadata: { style, duration }
      });

      return await apiService.post<MusicTrack>('/api/music/generate', {
        prompt,
        style,
        duration
      });
    } catch (error) {
      logger.error('Erreur génération musique', {
        component: 'MusicService',
        action: 'generate_music',
        metadata: { error, style, duration }
      });
      throw error;
    }
  }

  async getGenerationStatus(trackId: string): Promise<ApiResponse<{ status: string; progress?: number }>> {
    try {
      return await apiService.get<{ status: string; progress?: number }>(`/api/music/generate/${trackId}/status`);
    } catch (error) {
      logger.error('Erreur statut génération', {
        component: 'MusicService',
        action: 'get_generation_status',
        metadata: { error, trackId }
      });
      throw error;
    }
  }
}

export const musicService = new MusicService();