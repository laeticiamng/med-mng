// Audio Components Index - Architecture Unifiée
// Note: AudioPlayer et MusicPlayer sont des alias de UnifiedAudioPlayer
// Pour éviter les conflits, importer directement depuis ce module:
// import { UnifiedAudioPlayer } from '@/components/audio';

export { UnifiedAudioPlayer } from './UnifiedAudioPlayer';
export type { UnifiedAudioPlayerProps } from './UnifiedAudioPlayer';
export { SecureAudioPlayer } from './SecureAudioPlayer';

// Alias internes (non exportés depuis index central pour éviter conflits)
export { AudioPlayer as UnifiedAudioPlayerAlias } from './UnifiedAudioPlayer';
