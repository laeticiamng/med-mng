/**
 * Types globaux du projet MED-MNG
 * Centralise toutes les interfaces et types
 */

// Base types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// User types
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

// EDN types
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
}

// Music types
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

// Legacy types for compatibility
export type EDNItem = EdnItem;

export interface ColonneConfig {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ProcessingData {
  sections?: unknown[];
  competences?: unknown[];
  items?: unknown[];
}

export interface TableauResult {
  headers: string[];
  rows: unknown[][];
  metadata?: Record<string, unknown>;
}

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface MusicGenerationProgress {
  percentage: number;
  stage: string;
  estimated_time?: number;
}

export interface MedicalCategory {
  id: string;
  name: string;
  specialties: MedicalSpecialty[];
}

export interface MedicalSpecialty {
  id: string;
  name: string;
  items: MedicalItem[];
}

export interface MedicalItem {
  id: string;
  code: string;
  title: string;
  category: string;
}

export interface Playlist extends BaseEntity {
  name: string;
  description?: string;
  user_id: string;
  tracks: MusicTrack[];
  is_public: boolean;
  cover_image?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Generation types
export interface GenerationRequest {
  type: 'music' | 'lyrics' | 'quiz' | 'content';
  prompt: string;
  parameters: Record<string, unknown>;
  user_id: string;
}

export interface GenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  progress?: number;
  estimated_time?: number;
}

// Analytics types
export interface AnalyticsMetrics {
  daily_active_users: number;
  total_generations: number;
  success_rate: number;
  average_response_time: number;
  top_content: Array<{
    id: string;
    title: string;
    usage_count: number;
  }>;
}

// Component props types
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ComponentType<{ className?: string }>;
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

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  requiredRole?: User['role'];
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  filters_applied: SearchFilters;
  suggestions?: string[];
}