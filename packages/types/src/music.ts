export interface MusicGenerationRequest {
  lyrics: string[];
  style: string;
  duration: number;
  rang: 'A' | 'B' | 'AB';
  language?: string;
  itemCode?: string;
  model?: 'V3_5' | 'V4' | 'V4_5';
}

export interface MusicGenerationResponse {
  success: boolean;
  trackId?: string;
  message?: string;
  error?: string;
}

export interface GenerationStatus {
  taskId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed' | 'timeout';
  progress: number;
  audioUrl?: string;
  imageUrl?: string;
  streamUrl?: string;
  error?: string;
  startTime?: Date;
  elapsedTime?: number;
}

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number;
  rang: 'A' | 'B';
  style: string;
  lyrics?: string;
  itemCode?: string;
  createdAt: Date;
}

export interface AudioPlayer {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMinimized: boolean;
}

export interface MusicLibrary {
  tracks: Track[];
  favorites: string[];
  playlists: Playlist[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: Date;
  updatedAt: Date;
}