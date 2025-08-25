// Music-related type definitions (extending existing from packages/types)
export * from '../../packages/types/src/music';

// Additional music types specific to the frontend
export interface MusicCardState {
  isClicked: boolean;
  isGenerating: boolean;
  generatedAudio?: string;
}

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
}

export interface MusicGenerationProgress {
  step: string;
  progress: number;
  message?: string;
}