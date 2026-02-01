// ============================================
// HOOKS - Audio & Music (Architecture Unifiée)
// ============================================

// Hook unifié principal - RECOMMANDÉ
export { useUnifiedAudio, useAudioPlayer, useEnhancedAudioPlayer } from './useUnifiedAudio';
export type { 
  AudioTrack, 
  AudioPlayerState, 
  AudioPlayerControls, 
  UseUnifiedAudioOptions 
} from './useUnifiedAudio';

// Hooks legacy (rétrocompatibilité - utilisent useUnifiedAudio en interne)
export { useAudioBuffering } from '../useAudioBuffering';
export { useAudioCache } from '../useAudioCache';
export { useAudioControls } from '../useAudioControls';
export { useAudioMetrics } from '../useAudioMetrics';
export { useAudioWithCache } from '../useAudioWithCache';
export { useEcosLyrics } from '../useEcosLyrics';
export { useKaraokeSession } from '../useKaraokeSession';
export { useListeningModes } from '../useListeningModes';
export { useMusicGeneration } from '../useMusicGeneration';
export { useMusicGenerationState } from '../useMusicGenerationState';
export { useMusicGenerationStatus } from '../useMusicGenerationStatus';
export { useMusicGenerationWithTranslation } from '../useMusicGenerationWithTranslation';
export { useMusicLibrary } from '../useMusicLibrary';
export { useMusicMetrics } from '../useMusicMetrics';
export { useOpenAIGeneration } from '../useOpenAIGeneration';
export { useParolesMusicales } from '../useParolesMusicales';
export { usePlayer } from '../usePlayer';
export { usePlaylistPlayer } from '../usePlaylistPlayer';
export { usePlaylists } from '../usePlaylists';
export { useRealtimeGeneration } from '../useRealtimeGeneration';
export { useRetryGeneration } from '../useRetryGeneration';
export { useSecureStreaming } from '../useSecureStreaming';
export { useSongGeneration } from '../useSongGeneration';
export { useSpotifyAI } from '../useSpotifyAI';
export { useSunoCallbackListener } from '../useSunoCallbackListener';
export { useSunoCredits } from '../useSunoCredits';
export { useSunoGeneration } from '../useSunoGeneration';
export { useSunoPolling } from '../useSunoPolling';
export { useSupabaseMusicTracks } from '../useSupabaseMusicTracks';
export { useSynchronizedLyrics } from '../useSynchronizedLyrics';
