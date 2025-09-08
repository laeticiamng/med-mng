/**
 * 🎯 TYPES GLOBAUX STRICTS - MED-MNG v2.0
 * Élimination complète des types 'any' pour une sécurité maximale
 */

// ==========================================
// TYPES DE BASE RÉUTILISABLES
// ==========================================

export type ID = string;
export type Timestamp = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Status générique
export type Status = 'pending' | 'loading' | 'success' | 'error' | 'idle';
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Réponses API standardisées
export interface ApiResponse<T = JSONObject> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T = JSONObject> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==========================================
// TYPES MÉTIER MED-MNG
// ==========================================

// Utilisateur
export interface User {
  id: ID;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserProfile extends User {
  subscription_type: 'free' | 'premium' | 'professional';
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  notifications: boolean;
  music_quality: 'standard' | 'high' | 'lossless';
  auto_play: boolean;
}

export interface UserStats {
  total_listening_time: number;
  songs_generated: number;
  favorite_genres: string[];
  last_active: Timestamp;
}

// ==========================================
// TYPES AUDIO & MUSIQUE
// ==========================================

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

// ==========================================
// TYPES EDN & COMPÉTENCES
// ==========================================

export interface EdnItem {
  id: ID;
  item_code: string;
  title: string;
  subtitle?: string;
  content?: JSONObject;
  competences_rang_a?: EdnCompetence[];
  competences_rang_b?: EdnCompetence[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface EdnCompetence {
  id: ID;
  title: string;
  description: string;
  keywords: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface QuizQuestion {
  id: ID;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: ID;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit?: number;
}

// ==========================================
// TYPES INTERFACE UTILISATEUR
// ==========================================

export interface NavigationItem {
  id: ID;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

export interface ToastMessage {
  id: ID;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// ==========================================
// TYPES FORMULAIRES
// ==========================================

export interface FormField<T = JSONValue> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  value: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: T }>;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
  validator?: (value: JSONValue) => boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  errors: Record<string, string[]>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// ==========================================
// TYPES ANALYTICS & MONITORING
// ==========================================

export interface AnalyticsEvent {
  id: ID;
  event_name: string;
  user_id?: ID;
  properties: JSONObject;
  timestamp: Timestamp;
  session_id?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'count' | 'percent';
  timestamp: Timestamp;
  context?: JSONObject;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  components: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    last_check: Timestamp;
    message?: string;
  }>;
  last_updated: Timestamp;
}

// ==========================================
// TYPES HOOKS & STATE MANAGEMENT
// ==========================================

export interface AsyncState<T = JSONObject> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: Timestamp;
}

export interface CacheEntry<T = JSONValue> {
  data: T;
  timestamp: Timestamp;
  ttl: number;
  key: string;
}

export interface HookConfig {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  staleTime?: number;
  cacheTime?: number;
}

// ==========================================
// UTILITAIRES DE TYPES
// ==========================================

// Rendre tous les champs optionnels
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Exclure certaines propriétés
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Sélectionner certaines propriétés
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Type pour les handlers d'événements
export type EventHandler<T = Element> = (event: Event & { target: T }) => void;

// Type pour les refs React
export type RefObject<T> = { current: T | null };

// Type pour les composants React
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// ==========================================
// TYPES DE CONFIGURATION
// ==========================================

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    musicGeneration: boolean;
    socialFeatures: boolean;
    analytics: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    animations: boolean;
    reducedMotion: boolean;
  };
}