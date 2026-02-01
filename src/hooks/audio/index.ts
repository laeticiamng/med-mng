/**
 * ============================================
 * HOOKS - Audio & Music (Architecture Unifiée Phase 2)
 * ============================================
 * 
 * ARCHITECTURE:
 * - Hook principal unifié: useUnifiedAudio (RECOMMANDÉ)
 * - Aliases de rétrocompatibilité: useAudioPlayer, useEnhancedAudioPlayer
 * - Hooks legacy disponibles mais deprecated
 * 
 * USAGE RECOMMANDÉ:
 * import { useUnifiedAudio } from '@/hooks/audio';
 * const { play, pause, audioState, controls } = useUnifiedAudio(audioUrl);
 */

// ═══════════════════════════════════════════════════════════════════════════
// HOOK UNIFIÉ PRINCIPAL - UTILISER CELUI-CI
// ═══════════════════════════════════════════════════════════════════════════
export { 
  useUnifiedAudio, 
  useAudioPlayer, 
  useEnhancedAudioPlayer 
} from './useUnifiedAudio';

export type { 
  AudioTrack, 
  AudioPlayerState, 
  AudioPlayerControls, 
  UseUnifiedAudioOptions 
} from './useUnifiedAudio';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS CORE (Fonctionnalités spécifiques)
// ═══════════════════════════════════════════════════════════════════════════
export { useAudioBuffering } from '../useAudioBuffering';
export { useAudioCache } from '../useAudioCache';
export { useAudioControls } from '../useAudioControls';
export { useAudioMetrics } from '../useAudioMetrics';
export { useAudioWithCache } from '../useAudioWithCache';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS MUSIQUE (Génération et gestion)
// ═══════════════════════════════════════════════════════════════════════════
export { useMusicGeneration } from '../useMusicGeneration';
export { useMusicGenerationState } from '../useMusicGenerationState';
export { useMusicGenerationStatus } from '../useMusicGenerationStatus';
export { useMusicGenerationWithTranslation } from '../useMusicGenerationWithTranslation';
export { useMusicLibrary } from '../useMusicLibrary';
export { useMusicMetrics } from '../useMusicMetrics';
export { useSongGeneration } from '../useSongGeneration';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS SUNO (Provider-specific)
// ═══════════════════════════════════════════════════════════════════════════
export { useSunoCallbackListener } from '../useSunoCallbackListener';
export { useSunoCredits } from '../useSunoCredits';
export { useSunoGeneration } from '../useSunoGeneration';
export { useSunoPolling } from '../useSunoPolling';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS PLAYER (Lecture et contrôle)
// ═══════════════════════════════════════════════════════════════════════════
export { usePlayer } from '../usePlayer';
export { usePlaylistPlayer } from '../usePlaylistPlayer';
export { usePlaylists } from '../usePlaylists';
export { useListeningModes } from '../useListeningModes';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS LYRICS & KARAOKE
// ═══════════════════════════════════════════════════════════════════════════
export { useEcosLyrics } from '../useEcosLyrics';
export { useKaraokeSession } from '../useKaraokeSession';
export { useParolesMusicales } from '../useParolesMusicales';
export { useSynchronizedLyrics } from '../useSynchronizedLyrics';

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════
export { useOpenAIGeneration } from '../useOpenAIGeneration';
export { useRealtimeGeneration } from '../useRealtimeGeneration';
export { useRetryGeneration } from '../useRetryGeneration';
export { useSecureStreaming } from '../useSecureStreaming';
export { useSpotifyAI } from '../useSpotifyAI';
export { useSupabaseMusicTracks } from '../useSupabaseMusicTracks';
