// ==========================================
// MED-MNG TYPES BARREL - Export centralisé
// ==========================================

// Music Types
export type {
  MusicTrack,
  MusicMetadata,
  GenerationRequest,
  GenerationStatus,
  GenerationStage,
  UserMusicPreferences,
  EqualizerSettings,
  Playlist,
  PlaybackSession,
  DeviceInfo,
  AudioCapabilities,
  MusicAnalytics,
  StyleStats,
  EngagementStats,
  PerformanceStats,
  RealtimeUpdate,
  SupabaseMusicTrack
} from './music';

// EDN Types
export type {
  EDNItem,
  ProcessingData,
  ColonneConfig,
  TableauResult
} from './edn';
export type {
  MedicalItem,
  MedicalItemMetadata,
  UsageStats,
  MedicalCategory,
  MedicalSpecialty,
  Competency,
  CompetencyLevel,
  CompetencyDomain,
  EcosScenario,
  EcosType,
  PatientInfo,
  VitalSigns,
  EcosStation,
  AssessmentPoint,
  AssessmentCriteria,
  LearningProgress,
  PerformanceMetrics,
  MedicalUserProfile,
  LearningPreferences,
  PerformanceSummary,
  Achievement
} from './medical';

// Hooks Types
export interface MusicGenerationProgress {
  rang: 'A' | 'B' | 'AB';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  stage: 'initializing' | 'generating_lyrics' | 'creating_music' | 'processing_audio' | 'finalizing' | 'uploading';
  currentTask?: string;
  estimatedTimeRemaining?: number;
}

export interface GlobalAudioState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  queue: MusicTrack[];
  currentIndex: number;
  repeatMode: 'none' | 'track' | 'queue';
  shuffleMode: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium' | 'professional' | 'institution';
  status: 'active' | 'canceled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  credits_remaining: number;
  credits_total: number;
  features_enabled: SubscriptionFeature[];
  auto_renew: boolean;
}

export interface SubscriptionFeature {
  feature_name: string;
  enabled: boolean;
  usage_limit?: number;
  usage_count: number;
}

// UI/UX Types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  reduced_motion: boolean;
  font_size: 'small' | 'normal' | 'large' | 'extra-large';
  focus_indicators: boolean;
  screen_reader_optimized: boolean;
  keyboard_navigation_enhanced: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  request_id: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  stack_trace?: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: MedicalCategory;
  specialty?: MedicalSpecialty;
  difficulty_level?: string[];
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  sort_by?: 'relevance' | 'date' | 'popularity' | 'difficulty';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total_count: number;
  search_time_ms: number;
  suggestions?: string[];
  filters_applied: SearchFilters;
}