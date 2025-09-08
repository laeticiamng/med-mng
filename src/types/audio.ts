/**
 * 🎯 TYPES AUDIO & MUSIQUE - MED-MNG v3.0
 * Types pour la génération et gestion audio
 */

import type { ID, Timestamp } from './core';

// ==========================================
// TYPES AUDIO & MUSIQUE
// ==========================================

export type AudioErrorType = 
  | 'UNKNOWN_ERROR'
  | 'MEDIA_ERR_ABORTED'
  | 'MEDIA_ERR_NETWORK'
  | 'MEDIA_ERR_DECODE'
  | 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  | 'network'
  | 'format'
  | 'permissions'
  | 'unknown';

export interface AudioTrack {
  id: ID;
  title: string;
  artist?: string;
  duration: number;
  url: string;
  format: 'mp3' | 'wav' | 'flac';
  quality: 'standard' | 'high' | 'lossless';
  created_at: Timestamp;
}

export interface MusicGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  instrumental?: boolean;
  mood?: string;
  tempo?: 'slow' | 'medium' | 'fast';
}

export interface MusicGenerationResponse {
  id: ID;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  audio_url?: string;
  lyrics?: string[];
  metadata: {
    style?: string;
    duration?: number;
    tempo?: string;
    created_at: Timestamp;
  };
}

export interface Playlist {
  id: ID;
  name: string;
  description?: string;
  tracks: AudioTrack[];
  user_id: ID;
  is_public: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}