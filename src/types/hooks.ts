/**
 * Types pour les hooks et interfaces génériques
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface MusicGenerationProgress {
  progress: number;
  attempts: number;
  maxAttempts: number;
  estimatedTimeRemaining: number;
  stage?: 'generating' | 'processing' | 'complete' | 'error';
  percentage?: number;
  message?: string;
  rang?: 'A' | 'B';
}

export interface AudioMetrics {
  duration?: number;
  currentTime?: number;
  volume?: number;
  isPlaying: boolean;
  source?: string;
}

export interface ContentGenerationPayload extends Record<string, unknown> {
  userId: string;
  itemCode?: string;
  contentType?: 'comic' | 'novel' | 'poem' | 'lyrics' | 'music' | 'voice' | 'image';
  rang?: 'A' | 'B';
  prompt?: string;
  text?: string;
  lyrics?: string;
  style?: string;
  mood?: string;
  voiceId?: string;
  duration?: number;
  size?: string;
  quality?: string;
  language?: string;
  fastMode?: boolean;
}

export interface QuotaUsageRequest {
  serviceType: string;
  operationType: string;
  requestDetails?: Record<string, unknown>;
}

export interface ErrorDetails extends Record<string, unknown> {
  code?: string;
  message?: string;
  timestamp?: string;
  component?: string;
  userId?: string;
}

export interface UserAnalytics extends Record<string, unknown> {
  sessionId: string;
  userId: string;
  eventType: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface CompetenceData extends Record<string, unknown> {
  id: string;
  title: string;
  level: 'A' | 'B';
  status: 'completed' | 'in_progress' | 'not_started';
  progress?: number;
}