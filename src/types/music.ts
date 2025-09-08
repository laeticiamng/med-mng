// ==========================================
// MED-MNG MUSIC TYPES - Architecture centralisée
// ==========================================

export interface MusicTrack {
  id: string;
  title: string;
  audio_url: string;
  metadata: MusicMetadata;
  created_at: string;
  updated_at: string;
  suno_track_id?: string;
  task_id?: string;
  user_id?: string;
  item_code?: string;
  rang?: 'A' | 'B' | 'AB';
  duration?: number;
  generation_status?: GenerationStatus;
  play_count?: number;
  favorite?: boolean;
}

export interface MusicMetadata {
  tags?: string[];
  style?: string;
  bpm?: number;
  key?: string;
  mood?: string;
  genre?: string;
  language?: string;
  lyrics?: string[];
  competencies?: string[];
  medical_concepts?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  learning_objectives?: string[];
}

export interface GenerationRequest {
  item_code: string;
  rang: 'A' | 'B' | 'AB';
  style: string;
  duration: number;
  lyrics: string[];
  language?: string;
  fast_mode?: boolean;
  priority?: 'low' | 'normal' | 'high';
  user_preferences?: UserMusicPreferences;
}

export interface GenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  stage: GenerationStage;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  retry_count?: number;
}

export type GenerationStage = 
  | 'initializing'
  | 'generating_lyrics' 
  | 'creating_music'
  | 'processing_audio'
  | 'finalizing'
  | 'uploading';

export interface UserMusicPreferences {
  preferred_styles: string[];
  preferred_duration: number;
  auto_play: boolean;
  volume_level: number;
  playback_speed: number;
  lyrics_display: boolean;
  equalizer_settings?: EqualizerSettings;
}

export interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
  preset?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  tracks: MusicTrack[];
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  tags: string[];
  cover_image?: string;
  total_duration: number;
}

export interface PlaybackSession {
  id: string;
  track_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_played: number;
  completion_percentage: number;
  playback_quality: 'low' | 'medium' | 'high';
  device_info: DeviceInfo;
}

export interface DeviceInfo {
  user_agent: string;
  screen_resolution: string;
  audio_capabilities: AudioCapabilities;
}

export interface AudioCapabilities {
  supports_hd: boolean;
  max_sample_rate: number;
  codec_support: string[];
}

// Analytics Types
export interface MusicAnalytics {
  total_generations: number;
  successful_generations: number;
  avg_generation_time: number;
  most_popular_styles: StyleStats[];
  user_engagement: EngagementStats;
  system_performance: PerformanceStats;
}

export interface StyleStats {
  style: string;
  count: number;
  avg_rating: number;
  most_used_for_items: string[];
}

export interface EngagementStats {
  avg_session_duration: number;
  tracks_per_session: number;
  repeat_play_rate: number;
  favorite_rate: number;
}

export interface PerformanceStats {
  avg_load_time: number;
  success_rate: number;
  error_rates: Record<string, number>;
  peak_concurrent_users: number;
}

// Real-time Updates
export interface RealtimeUpdate {
  type: 'track_completed' | 'track_updated' | 'generation_progress';
  data: MusicTrack | GenerationStatus;
  timestamp: string;
}

// Export type alias for backward compatibility
export type SupabaseMusicTrack = MusicTrack;