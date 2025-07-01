
// Client de base
export { SunoApiClient, SunoRequestError } from '../lib/sunoClient';

// Services de paroles
export { generateLyrics } from '../lyrics/generate';
export { getLyricsStatus, type LyricsStatus } from '../lyrics/status';

// Services de style
export { boostStyle } from '../style/boost';

// Services de musique
export { generateMusic, type GenerateMusicPayload, type GenerateMusicResponse } from '../music/generate';
export { getMusicStatus, type MusicStatus, type MusicStatusStage } from '../music/status';
export { getTimestampedLyrics, type TimestampedLyrics } from '../music/lyrics';
export { extendMusic, type ExtendMusicPayload } from '../music/extend';

// Utilitaires (placeholder)
export { convertToWav } from '../utils/wav';
export { removeVocals } from '../utils/vocal-remove';
export { generateVideo } from '../utils/video';
