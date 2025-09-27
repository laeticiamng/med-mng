/**
 * Types globaux du projet MED-MNG
 * Architecture unifiée selon le plan de refactorisation
 */

// Export des types centralisés
export * from './core';
export * from './unified';
export * from './music-unified';

export interface ColonneConfig {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  // Propriétés legacy pour compatibilité
  nom?: string;
  couleur?: string;
  couleurCellule?: string;
  couleurTexte?: string;
}

export interface ProcessingData {
  sections?: unknown[];
  competences?: unknown[];
  items?: unknown[];
  item_code?: string;
  title?: string;
  theme?: string;
  rang?: 'A' | 'B';
}

export interface TableauResult {
  headers?: string[];
  rows?: unknown[][];
  metadata?: Record<string, unknown>;
  // Propriétés spécifiques au tableau
  lignesEnrichies?: string[][];
  colonnesUtiles?: ColonneConfig[];
  theme?: string;
  success?: boolean;
  isComplete?: boolean;
}

// Generation types complets
export interface GenerationRequest {
  type: 'music' | 'lyrics' | 'quiz' | 'content';
  prompt: string;
  parameters: Record<string, unknown>;
  user_id: string;
  // Propriétés étendues pour compatibilité
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

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  stage?: string;
  error_message?: string;
}

export interface MusicGenerationProgress {
  percentage?: number;
  stage: string;
  estimated_time?: number;
  rang?: 'A' | 'B' | 'AB';
  status?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  currentTask?: string;
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
  item_code?: string;
  description?: string;
  competencies?: string[];
}

export interface Playlist {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description?: string;
  user_id: string;
  tracks: string[]; // track IDs
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
  requiredRole?: 'admin' | 'user' | 'moderator';
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