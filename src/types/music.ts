/**
 * Music generation and playback types
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

export interface MusicGenerationRequest {
  rang?: 'A' | 'B' | 'AB';
  itemCode?: string;
  lyrics: string | string[];
  style: string;
  duration?: number;
  model?: 'V3_5' | 'V4' | 'V4_5';
  language?: string;
  fastMode?: boolean;
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
  [key: string]: unknown;
}

export interface MusicGenerationStatus {
  taskId: string;
  status: 'generating' | 'text_complete' | 'completed' | 'failed';
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  progress?: number;
  metadata?: MusicGenerationMetadata;
  error?: string;
}

export interface PollingProgress {
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining: number;
}
