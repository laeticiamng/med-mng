// ============================================
// TYPES UNIFIÉS POUR LA PLATEFORME MUSICALE MÉDICALE
// ============================================

// Types de base pour l'audio et la musique médicale
export interface MedicalMusicTrack {
  id: string;
  title: string;
  audio_url: string;
  stream_url?: string;
  image_url?: string;
  duration?: number;
  
  // Métadonnées médicales
  medical_metadata: {
    item_code: string;
    rang: 'A' | 'B' | 'AB';
    style: string;
    difficulty_level: 1 | 2 | 3 | 4 | 5;
    medical_domain: string;
    learning_objectives: string[];
    keywords: string[];
    competencies: string[];
  };
  
  // Métadonnées de génération
  generation_metadata: {
    model_used: 'V3_5' | 'V4' | 'V4_5';
    language: string;
    suno_track_id?: string;
    task_id?: string;
    prompt_used?: string;
    generation_time?: number;
    quality_score?: number;
  };
  
  // Métadonnées d'interaction
  interaction_metadata: {
    play_count: number;
    like_count: number;
    is_liked?: boolean;
    is_in_library?: boolean;
    last_played?: string;
    completion_rate?: number;
  };
  
  created_at: string;
  updated_at: string;
}

// État du lecteur musical unifié
export interface UnifiedPlayerState {
  // État de lecture
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Progression temporelle
  currentTime: number;
  duration: number;
  bufferedTime: number;
  
  // Contrôles audio
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  
  // Mode de lecture
  repeatMode: 'none' | 'track' | 'playlist';
  shuffleMode: boolean;
  
  // Track actuel
  currentTrack?: MedicalMusicTrack;
  playlist: MedicalMusicTrack[];
  currentIndex: number;
  
  // États UI
  isMinimized: boolean;
  showLyrics: boolean;
  showVisualizer: boolean;
}

// Configuration d'accessibilité
export interface AccessibilityConfig {
  // Navigation clavier
  keyboardNavigation: boolean;
  focusVisible: boolean;
  
  // Screen reader
  ariaLabels: boolean;
  liveRegions: boolean;
  
  // Préférences utilisateur
  reducedMotion: boolean;
  highContrast: boolean;
  largeFonts: boolean;
  
  // Audio
  audioDescriptions: boolean;
  closedCaptions: boolean;
}

// Paramètres de génération musicale
export interface MusicGenerationParams {
  // Contenu médical
  lyrics: string | string[];
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  medical_context: {
    domain: string;
    competencies: string[];
    learning_level: 'beginner' | 'intermediate' | 'advanced';
  };
  
  // Paramètres musicaux
  style: string;
  duration: number;
  language: 'fr' | 'en' | 'es' | 'de';
  
  // Paramètres techniques
  model: 'V3_5' | 'V4' | 'V4_5';
  quality: 'draft' | 'standard' | 'premium';
  custom_mode: boolean;
  instrumental: boolean;
  
  // Options avancées
  voice_preference?: 'male' | 'female' | 'mixed';
  tempo_preference?: 'slow' | 'medium' | 'fast';
  mood?: 'educational' | 'motivational' | 'relaxing' | 'energetic';
}

// Statut de génération unifié
export interface GenerationStatus {
  task_id: string;
  status: 'queued' | 'generating' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  
  // Timestamps
  started_at: string;
  completed_at?: string;
  estimated_completion?: string;
  
  // Résultats
  audio_url?: string;
  stream_url?: string;
  image_url?: string;
  lyrics_synchronized?: string;
  
  // Diagnostics
  error_message?: string;
  quality_metrics?: {
    audio_quality: number;
    lyric_clarity: number;
    medical_accuracy: number;
  };
  
  // Métadonnées
  metadata?: Record<string, any>;
}

// Configuration du système de quotas
export interface QuotaConfig {
  user_id: string;
  subscription_tier: 'free' | 'standard' | 'pro' | 'premium';
  
  // Limites
  monthly_limit: number;
  daily_limit: number;
  
  // Utilisation actuelle
  monthly_used: number;
  daily_used: number;
  
  // Features disponibles
  available_models: ('V3_5' | 'V4' | 'V4_5')[];
  max_duration: number;
  priority_queue: boolean;
  
  // Dates
  quota_reset_date: string;
  last_generation: string;
}

// Analytics et métriques
export interface MusicAnalytics {
  // Métriques d'engagement
  total_plays: number;
  total_duration_played: number;
  average_completion_rate: number;
  unique_listeners: number;
  
  // Métriques pédagogiques
  learning_effectiveness_score: number;
  most_played_domains: string[];
  retention_rate: number;
  
  // Métriques techniques
  generation_success_rate: number;
  average_generation_time: number;
  audio_quality_average: number;
  
  // Préférences utilisateurs
  preferred_styles: string[];
  preferred_languages: string[];
  preferred_durations: number[];
  
  // Dates
  period_start: string;
  period_end: string;
}

// Events système pour l'orchestration
export interface MusicSystemEvent {
  id: string;
  type: 
    | 'generation_started'
    | 'generation_completed'
    | 'generation_failed'
    | 'playback_started'
    | 'playback_ended'
    | 'track_liked'
    | 'track_added_to_library'
    | 'quota_exceeded'
    | 'error_occurred';
  
  payload: Record<string, any>;
  timestamp: string;
  user_id?: string;
  session_id?: string;
}

// Configuration de performance
export interface PerformanceConfig {
  // Caching
  enable_audio_caching: boolean;
  cache_duration: number;
  
  // Préchargement
  preload_next_track: boolean;
  preload_thumbnails: boolean;
  
  // Optimisations réseau
  adaptive_bitrate: boolean;
  compression_level: 'low' | 'medium' | 'high';
  
  // Lazy loading
  lazy_load_playlist: boolean;
  virtual_scrolling: boolean;
  
  // Bundle optimization
  code_splitting: boolean;
  tree_shaking: boolean;
}

// Export consolidé de tous les types
export type {
  MedicalMusicTrack as Track,
  UnifiedPlayerState as PlayerState,
  MusicGenerationParams as GenerationParams,
  MusicAnalytics as Analytics,
  MusicSystemEvent as SystemEvent
};

// Constantes pour la configuration
export const MUSIC_CONSTANTS = {
  // Durées par défaut
  DEFAULT_DURATION: 240,
  MIN_DURATION: 30,
  MAX_DURATION: 600,
  
  // Formats audio supportés
  SUPPORTED_FORMATS: ['mp3', 'wav', 'aac', 'm4a'],
  
  // Langues supportées
  SUPPORTED_LANGUAGES: ['fr', 'en', 'es', 'de'] as const,
  
  // Modèles Suno
  SUNO_MODELS: ['V3_5', 'V4', 'V4_5'] as const,
  
  // Styles musicaux médicaux
  MEDICAL_STYLES: [
    'Éducatif Pop',
    'Folk Médical',
    'Hip-Hop Pédagogique',
    'Jazz Clinique',
    'Rock Anatomique',
    'Électro Diagnostic',
    'Classique Thérapeutique'
  ] as const,
  
  // Domaines médicaux
  MEDICAL_DOMAINS: [
    'Cardiologie',
    'Neurologie',
    'Pneumologie',
    'Gastroentérologie',
    'Endocrinologie',
    'Dermatologie',
    'Psychiatrie',
    'Pédiatrie',
    'Gynécologie',
    'Urologie',
    'Rhumatologie',
    'Ophtalmologie',
    'ORL',
    'Radiologie',
    'Anatomie',
    'Physiologie',
    'Pharmacologie'
  ] as const
} as const;