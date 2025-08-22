/**
 * Structure d'une erreur audio HTML5
 */
export interface AudioError {
  code: number;
  message: string;
  type: AudioErrorType;
  url?: string;
  timestamp: string;
  element?: HTMLAudioElement;
}

/**
 * Types d'erreurs audio possibles
 */
export type AudioErrorType = 
  | 'MEDIA_ERR_ABORTED'
  | 'MEDIA_ERR_NETWORK' 
  | 'MEDIA_ERR_DECODE'
  | 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  | 'UNKNOWN_ERROR';

/**
 * Détails de l'événement d'erreur audio
 */
export interface AudioErrorEvent {
  target: HTMLAudioElement;
  type: string;
  currentTarget: HTMLAudioElement;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  timeStamp: number;
}

/**
 * Informations sur l'état de l'audio
 */
export interface AudioState {
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  paused: boolean;
  ended: boolean;
  buffered: TimeRanges;
  networkState: number;
  readyState: number;
  seeking: boolean;
  playbackRate: number;
}

/**
 * Métriques de performance audio
 */
export interface AudioMetrics {
  loadStartTime?: number;
  metadataLoadTime?: number;
  canPlayTime?: number;
  playStartTime?: number;
  totalLoadTime?: number;
  bufferHealthScore?: number;
  errors: string[];
  url: string;
  timestamp: string;
}

/**
 * Configuration de qualité audio
 */
export interface AudioQualityConfig {
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials' | null;
}

/**
 * Événements audio personnalisés
 */
export interface AudioEventData {
  type: 'play' | 'pause' | 'ended' | 'error' | 'loading' | 'progress';
  track?: {
    url: string;
    title: string;
    rang: 'A' | 'B' | 'AB';
  };
  currentTime?: number;
  duration?: number;
  error?: AudioError;
  timestamp: string;
}

/**
 * Handler d'événement audio
 */
export type AudioEventHandler = (event: AudioEventData) => void;

/**
 * Configuration du lecteur audio
 */
export interface AudioPlayerConfig {
  autoplay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  volume?: number;
  muted?: boolean;
  loop?: boolean;
  crossOrigin?: 'anonymous' | 'use-credentials' | null;
  controls?: boolean;
}