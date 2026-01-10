/**
 * Music generation and playback types
 * ✅ Enrichi: Types complets pour génération, polling, batch et filtres
 */

export interface Track {
  id: string;
  title: string;
  item_code: string;
  type: 'rang_a' | 'rang_b' | 'mix';
  duration?: number;
  stream_url?: string;
  created_at: string;
  is_favorite?: boolean;
}

// Modèles Suno disponibles selon documentation officielle
export type SunoModel = 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5';
export type VocalGender = 'm' | 'f';

export interface MusicGenerationRequest {
  rang?: 'A' | 'B' | 'AB';
  itemCode?: string;
  lyrics: string | string[];
  style: string;
  duration?: number;
  model?: SunoModel;
  language?: string;
  
  // Paramètres Suno
  customMode?: boolean;
  instrumental?: boolean;
  title?: string;
  
  // Nouveaux paramètres V4.5+
  personaId?: string;
  negativeTags?: string;
  vocalGender?: VocalGender;
  styleWeight?: number;        // 0.00-1.00
  weirdnessConstraint?: number; // 0.00-1.00
  audioWeight?: number;        // 0.00-1.00
  
  [key: string]: unknown;
}

export interface MusicGenerationMetadata {
  progress?: number;
  stream_url?: string;
  image_url?: string;
  model?: string;
  prompt?: string;
  duration?: number;
  title?: string;
  itemCode?: string;
  rang?: string;
  style?: string;
  language?: string;
  generatedAt?: string;
  vocalGender?: VocalGender;
  negativeTags?: string;
  [key: string]: unknown;
}

export interface MusicGenerationStatus {
  taskId: string;
  status: 'generating' | 'text_complete' | 'completed' | 'failed' | 'cancelled';
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  progress?: number;
  metadata?: MusicGenerationMetadata;
  error?: string;
}

// ✅ Enrichi avec status et elapsedMs
export interface PollingProgress {
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining: number;
  status?: 'polling' | 'success' | 'error' | 'timeout' | 'cancelled';
  elapsedMs?: number;
}

// ✅ Types pour le téléchargement batch
export interface BatchDownloadTrack {
  id: string;
  title?: string;
  item_code?: string;
  rang?: string;
  audio_url: string;
  music_style?: string;
}

// ✅ Types pour l'historique de génération
export interface GeneratedTrack {
  id: string;
  item_code: string;
  rang: string;
  music_style: string;
  audio_url: string;
  created_at: string;
  title?: string;
  is_favorite?: boolean;
  duration?: number;
  metadata?: MusicGenerationMetadata;
  task_id?: string;
  generation_status?: 'generating' | 'completed' | 'failed' | 'cancelled';
}

// ✅ Types pour les filtres
export type GenerationFilterType = 'all' | 'favorites' | 'rang_a' | 'rang_b' | 'rang_ab' | 'completed' | 'generating';
export type GenerationSortType = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'duration_asc' | 'duration_desc';
export type GenerationDateRangeType = 'all' | 'today' | 'week' | 'month' | 'year';

// ✅ Types pour les tâches de génération
export interface GenerationTask {
  taskId: string;
  rang: 'A' | 'B' | 'AB';
  startTime: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
  itemCode?: string;
  style?: string;
  error?: string;
}

// ✅ Types pour les erreurs de génération
export interface GenerationError {
  code: string;
  message: string;
  retryable: boolean;
  suggestion?: string;
}

// ✅ Types pour les statistiques de génération
export interface GenerationStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageDuration: number;
  favoriteCount: number;
  byRang: {
    A: number;
    B: number;
    AB: number;
  };
  byStyle: Record<string, number>;
}

// ✅ Types pour les crédits Suno
export interface SunoCreditsInfo {
  credits: number;
  plan: string;
  used: number;
  total: number;
  hasLowCredits: boolean;
  hasNoCredits: boolean;
}
