/**
 * 🎵 MUSIC MODULE TESTS
 * Tests for music generation, playlists, and audio features
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ────────────────────────────────────────────
// 🎶 MUSIC GENERATION TESTS
// ────────────────────────────────────────────

describe('Music - Generation', () => {
  interface GenerationRequest {
    title: string;
    lyrics: string;
    style: string;
    rang: 'A' | 'B';
    ednItemId?: string;
  }

  interface GenerationResult {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    audioUrl?: string;
    error?: string;
  }

  const validateGenerationRequest = (request: GenerationRequest): string[] => {
    const errors: string[] = [];
    
    if (!request.title || request.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (!request.lyrics || request.lyrics.length < 10) {
      errors.push('Lyrics must be at least 10 characters');
    }
    if (!request.style) {
      errors.push('Style is required');
    }
    if (!['A', 'B'].includes(request.rang)) {
      errors.push('Invalid rang value');
    }
    
    return errors;
  };

  const isGenerationComplete = (result: GenerationResult): boolean => {
    return result.status === 'completed' && !!result.audioUrl;
  };

  it('should validate complete request', () => {
    const request: GenerationRequest = {
      title: 'Test Song',
      lyrics: 'These are the lyrics for the test song',
      style: 'pop',
      rang: 'A',
    };

    const errors = validateGenerationRequest(request);
    expect(errors).toHaveLength(0);
  });

  it('should reject incomplete request', () => {
    const request: GenerationRequest = {
      title: '',
      lyrics: 'short',
      style: '',
      rang: 'A',
    };

    const errors = validateGenerationRequest(request);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Title must be at least 3 characters');
    expect(errors).toContain('Lyrics must be at least 10 characters');
    expect(errors).toContain('Style is required');
  });

  it('should detect completed generation', () => {
    const result: GenerationResult = {
      id: '1',
      status: 'completed',
      audioUrl: 'https://example.com/audio.mp3',
    };

    expect(isGenerationComplete(result)).toBe(true);
  });

  it('should detect incomplete generation', () => {
    const result: GenerationResult = {
      id: '1',
      status: 'processing',
    };

    expect(isGenerationComplete(result)).toBe(false);
  });
});

// ────────────────────────────────────────────
// 📚 PLAYLIST TESTS
// ────────────────────────────────────────────

describe('Music - Playlists', () => {
  interface Song {
    id: string;
    title: string;
    duration: number; // seconds
    ednItemId?: string;
  }

  interface Playlist {
    id: string;
    name: string;
    songs: Song[];
    isPublic: boolean;
    createdBy: string;
  }

  const calculatePlaylistDuration = (playlist: Playlist): number => {
    return playlist.songs.reduce((total, song) => total + song.duration, 0);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const addToPlaylist = (playlist: Playlist, song: Song): Playlist => {
    return {
      ...playlist,
      songs: [...playlist.songs, song],
    };
  };

  const removeFromPlaylist = (playlist: Playlist, songId: string): Playlist => {
    return {
      ...playlist,
      songs: playlist.songs.filter((s) => s.id !== songId),
    };
  };

  const reorderPlaylist = (
    playlist: Playlist,
    fromIndex: number,
    toIndex: number
  ): Playlist => {
    const songs = [...playlist.songs];
    const [removed] = songs.splice(fromIndex, 1);
    songs.splice(toIndex, 0, removed);
    return { ...playlist, songs };
  };

  it('should calculate total playlist duration', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test Playlist',
      songs: [
        { id: 's1', title: 'Song 1', duration: 180 },
        { id: 's2', title: 'Song 2', duration: 240 },
      ],
      isPublic: false,
      createdBy: 'user1',
    };

    expect(calculatePlaylistDuration(playlist)).toBe(420);
  });

  it('should format duration correctly', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(0)).toBe('0:00');
  });

  it('should add song to playlist', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test Playlist',
      songs: [],
      isPublic: false,
      createdBy: 'user1',
    };

    const newSong: Song = { id: 's1', title: 'New Song', duration: 180 };
    const updated = addToPlaylist(playlist, newSong);

    expect(updated.songs).toHaveLength(1);
    expect(updated.songs[0].title).toBe('New Song');
  });

  it('should remove song from playlist', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test Playlist',
      songs: [
        { id: 's1', title: 'Song 1', duration: 180 },
        { id: 's2', title: 'Song 2', duration: 240 },
      ],
      isPublic: false,
      createdBy: 'user1',
    };

    const updated = removeFromPlaylist(playlist, 's1');
    expect(updated.songs).toHaveLength(1);
    expect(updated.songs[0].id).toBe('s2');
  });

  it('should reorder playlist songs', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test Playlist',
      songs: [
        { id: 's1', title: 'Song 1', duration: 180 },
        { id: 's2', title: 'Song 2', duration: 240 },
        { id: 's3', title: 'Song 3', duration: 300 },
      ],
      isPublic: false,
      createdBy: 'user1',
    };

    const reordered = reorderPlaylist(playlist, 0, 2);
    expect(reordered.songs[0].id).toBe('s2');
    expect(reordered.songs[2].id).toBe('s1');
  });
});

// ────────────────────────────────────────────
// 🎧 AUDIO PLAYER TESTS
// ────────────────────────────────────────────

describe('Music - Audio Player', () => {
  interface AudioState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
  }

  const calculateProgress = (state: AudioState): number => {
    if (state.duration === 0) return 0;
    return (state.currentTime / state.duration) * 100;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEffectiveVolume = (state: AudioState): number => {
    return state.isMuted ? 0 : state.volume;
  };

  it('should calculate playback progress', () => {
    const state: AudioState = {
      isPlaying: true,
      currentTime: 60,
      duration: 180,
      volume: 1.0,
      isMuted: false,
      playbackRate: 1.0,
    };

    expect(calculateProgress(state)).toBeCloseTo(33.33, 1);
  });

  it('should handle zero duration', () => {
    const state: AudioState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1.0,
      isMuted: false,
      playbackRate: 1.0,
    };

    expect(calculateProgress(state)).toBe(0);
  });

  it('should format time correctly', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3600)).toBe('60:00');
  });

  it('should handle mute state for effective volume', () => {
    const mutedState: AudioState = {
      isPlaying: true,
      currentTime: 0,
      duration: 180,
      volume: 0.8,
      isMuted: true,
      playbackRate: 1.0,
    };

    const unmutedState: AudioState = {
      ...mutedState,
      isMuted: false,
    };

    expect(getEffectiveVolume(mutedState)).toBe(0);
    expect(getEffectiveVolume(unmutedState)).toBe(0.8);
  });
});

// ────────────────────────────────────────────
// 🔊 LYRICS SYNC TESTS
// ────────────────────────────────────────────

describe('Music - Lyrics Synchronization', () => {
  interface LyricLine {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
  }

  const getCurrentLyric = (
    lyrics: LyricLine[],
    currentTime: number
  ): LyricLine | null => {
    return lyrics.find(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    ) || null;
  };

  const getUpcomingLyrics = (
    lyrics: LyricLine[],
    currentTime: number,
    count: number = 3
  ): LyricLine[] => {
    return lyrics
      .filter((line) => line.startTime > currentTime)
      .slice(0, count);
  };

  it('should find current lyric line', () => {
    const lyrics: LyricLine[] = [
      { id: '1', text: 'Line 1', startTime: 0, endTime: 5 },
      { id: '2', text: 'Line 2', startTime: 5, endTime: 10 },
      { id: '3', text: 'Line 3', startTime: 10, endTime: 15 },
    ];

    const current = getCurrentLyric(lyrics, 7);
    expect(current?.text).toBe('Line 2');
  });

  it('should return null when no lyric matches', () => {
    const lyrics: LyricLine[] = [
      { id: '1', text: 'Line 1', startTime: 5, endTime: 10 },
    ];

    const current = getCurrentLyric(lyrics, 0);
    expect(current).toBeNull();
  });

  it('should get upcoming lyrics', () => {
    const lyrics: LyricLine[] = [
      { id: '1', text: 'Line 1', startTime: 0, endTime: 5 },
      { id: '2', text: 'Line 2', startTime: 5, endTime: 10 },
      { id: '3', text: 'Line 3', startTime: 10, endTime: 15 },
      { id: '4', text: 'Line 4', startTime: 15, endTime: 20 },
    ];

    const upcoming = getUpcomingLyrics(lyrics, 7, 2);
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].text).toBe('Line 3');
    expect(upcoming[1].text).toBe('Line 4');
  });
});
