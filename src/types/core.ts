/**
 * Types centralisés pour la plateforme MED-MNG
 * Architecture unifiée selon le plan de refactorisation
 */

// Base Entity type
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// User Management
export interface User extends BaseEntity {
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'moderator';
  subscription_status: 'active' | 'inactive' | 'trial';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notifications: boolean;
  auto_play: boolean;
  volume: number;
}

// Medical Content Types
export interface MedicalItem extends BaseEntity {
  item_code: string;
  title: string;
  description?: string;
  competencies?: string[];
  category: string;
}

export interface EdnItem extends BaseEntity {
  item_code: string;
  title: string;
  description?: string;
  tableau_rang_a?: Record<string, unknown>;
  tableau_rang_b?: Record<string, unknown>;
  paroles_musicales?: string[];
  quiz_questions?: Record<string, unknown>;
  scene_immersive?: Record<string, unknown>;
  is_premium: boolean;
  content_status: 'draft' | 'published' | 'archived';
  theme?: string;
}

// Music Generation Types
export interface MusicTrack extends BaseEntity {
  title: string;
  artist?: string;
  duration: number;
  audio_url?: string;
  lyrics?: string[];
  genre: string;
  is_generated: boolean;
  generation_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  rang?: 'A' | 'B';
}

export interface GenerationRequest {
  type: 'music' | 'lyrics' | 'quiz' | 'content';
  prompt: string;
  parameters: Record<string, unknown>;
  user_id: string;
  item_code?: string;
  rang?: 'A' | 'B' | 'AB';
  lyrics?: string[];
  style?: string;
  duration?: number;
  fast_mode?: boolean;
  priority?: 'low' | 'normal' | 'high';
  language?: string;
}

export interface GenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  progress?: number;
  estimated_time?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export interface AppError extends Error {
  code?: string;
  context?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
}

export type ErrorContext = 
  | 'api_call' 
  | 'user_action' 
  | 'system_error' 
  | 'validation_error' 
  | 'auth_error'
  | 'generation_error';

// Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system';

// Legacy compatibility (to be migrated)
export type EDNItem = EdnItem;
export type SupabaseMusicTrack = MusicTrack;