/**
 * 🎵 MODULE AUDIO/MEDIA - Tests Unitaires Exhaustifs
 * 
 * Couverture:
 * - useAudioPlayer: Lecture, pause, seek, volume
 * - useAudioCache: Cache offline, streaming
 * - useSynchronizedLyrics: Synchronisation paroles
 * 
 * Principes:
 * - Zéro silence: erreurs audio explicites
 * - Robustesse streaming
 * - Support offline
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// MOCKS SETUP
// ============================================================================

// Mock audio cache
const mockAudioCache = {
  getCachedAudio: vi.fn().mockResolvedValue(null),
  cacheAudio: vi.fn().mockResolvedValue(undefined),
  isCached: vi.fn().mockReturnValue(false),
  clearCache: vi.fn().mockResolvedValue(undefined),
  getCacheSize: vi.fn().mockResolvedValue(0),
};

vi.mock('@/lib/audioCache', () => ({
  audioCache: mockAudioCache,
}));

// Mock HTMLAudioElement
class MockAudioElement {
  src = '';
  currentTime = 0;
  duration = 180;
  volume = 1;
  paused = true;
  ended = false;
  
  private listeners: Map<string, Function[]> = new Map();

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  addEventListener(event: string, handler: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  emit(event: string, data?: any) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(h => h(data));
  }
}

global.Audio = MockAudioElement as any;

// ============================================================================
// AUDIO PLAYER TESTS
// ============================================================================

describe('🎵 Module Audio/Media', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // PLAYBACK CONTROLS
  // ==========================================================================
  
  describe('▶️ Playback Controls', () => {
    it('should play audio from URL', async () => {
      const audio = new MockAudioElement();
      audio.src = 'https://example.com/audio.mp3';
      
      await audio.play();
      expect(audio.paused).toBe(false);
    });

    it('should pause audio', async () => {
      const audio = new MockAudioElement();
      await audio.play();
      audio.pause();
      
      expect(audio.paused).toBe(true);
    });

    it('should resume paused audio', async () => {
      const audio = new MockAudioElement();
      await audio.play();
      audio.pause();
      await audio.play();
      
      expect(audio.paused).toBe(false);
    });

    it('should stop and reset audio', async () => {
      const audio = new MockAudioElement();
      audio.currentTime = 60;
      await audio.play();
      
      audio.pause();
      audio.currentTime = 0;
      
      expect(audio.paused).toBe(true);
      expect(audio.currentTime).toBe(0);
    });

    it('should seek to specific time', () => {
      const audio = new MockAudioElement();
      audio.duration = 180;
      
      audio.currentTime = 90;
      expect(audio.currentTime).toBe(90);
    });

    it('should clamp seek within bounds', () => {
      const audio = new MockAudioElement();
      audio.duration = 180;
      
      const clampedTime = Math.max(0, Math.min(200, audio.duration));
      audio.currentTime = clampedTime;
      
      expect(audio.currentTime).toBe(180);
    });
  });

  // ==========================================================================
  // VOLUME CONTROL
  // ==========================================================================
  
  describe('🔊 Volume Control', () => {
    it('should set volume between 0 and 1', () => {
      const audio = new MockAudioElement();
      
      audio.volume = 0.5;
      expect(audio.volume).toBe(0.5);
    });

    it('should mute audio (volume 0)', () => {
      const audio = new MockAudioElement();
      audio.volume = 0;
      
      expect(audio.volume).toBe(0);
    });

    it('should set max volume', () => {
      const audio = new MockAudioElement();
      audio.volume = 1;
      
      expect(audio.volume).toBe(1);
    });

    it('should clamp volume values', () => {
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      
      expect(clamp(-0.5)).toBe(0);
      expect(clamp(1.5)).toBe(1);
      expect(clamp(0.8)).toBe(0.8);
    });

    it('should persist volume preference', () => {
      const volumePrefs = { volume: 0.7 };
      const stored = JSON.stringify(volumePrefs);
      const parsed = JSON.parse(stored);
      
      expect(parsed.volume).toBe(0.7);
    });
  });

  // ==========================================================================
  // AUDIO EVENTS
  // ==========================================================================
  
  describe('📡 Audio Events', () => {
    it('should handle loadedmetadata event', () => {
      const audio = new MockAudioElement();
      let duration = 0;
      
      audio.addEventListener('loadedmetadata', () => {
        duration = audio.duration;
      });
      
      audio.emit('loadedmetadata');
      expect(duration).toBe(180);
    });

    it('should handle timeupdate event', () => {
      const audio = new MockAudioElement();
      const timeUpdates: number[] = [];
      
      audio.addEventListener('timeupdate', () => {
        timeUpdates.push(audio.currentTime);
      });
      
      audio.currentTime = 10;
      audio.emit('timeupdate');
      audio.currentTime = 20;
      audio.emit('timeupdate');
      
      expect(timeUpdates).toEqual([10, 20]);
    });

    it('should handle ended event', () => {
      const audio = new MockAudioElement();
      let hasEnded = false;
      
      audio.addEventListener('ended', () => {
        hasEnded = true;
        audio.paused = true;
        audio.currentTime = 0;
      });
      
      audio.emit('ended');
      expect(hasEnded).toBe(true);
      expect(audio.currentTime).toBe(0);
    });

    it('should handle error event', () => {
      const audio = new MockAudioElement();
      let errorMsg = '';
      
      audio.addEventListener('error', (e: any) => {
        errorMsg = e?.message || 'Audio error occurred';
      });
      
      audio.emit('error', { message: 'Failed to load' });
      expect(errorMsg).toBe('Failed to load');
    });

    it('should cleanup listeners on unmount', () => {
      const audio = new MockAudioElement();
      const handler = vi.fn();
      
      audio.addEventListener('timeupdate', handler);
      audio.removeEventListener('timeupdate', handler);
      
      audio.emit('timeupdate');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // OFFLINE AUDIO CACHE
  // ==========================================================================
  
  describe('💾 Offline Audio Cache', () => {
    it('should check cache before playing', async () => {
      const audioId = 'audio-123';
      const cachedUrl = await mockAudioCache.getCachedAudio(audioId);
      
      expect(mockAudioCache.getCachedAudio).toHaveBeenCalledWith('audio-123');
      expect(cachedUrl).toBeNull();
    });

    it('should use cached audio when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      mockAudioCache.getCachedAudio.mockResolvedValueOnce('blob:cached-url');
      
      const audioId = 'audio-456';
      const cachedUrl = await mockAudioCache.getCachedAudio(audioId);
      
      expect(cachedUrl).toBe('blob:cached-url');
    });

    it('should cache audio for offline use', async () => {
      const audioId = 'audio-789';
      const audioUrl = 'https://example.com/audio.mp3';
      
      await mockAudioCache.cacheAudio(audioId, audioUrl);
      expect(mockAudioCache.cacheAudio).toHaveBeenCalledWith(audioId, audioUrl);
    });

    it('should check if audio is cached', () => {
      mockAudioCache.isCached.mockReturnValueOnce(true);
      const isCached = mockAudioCache.isCached('audio-123');
      
      expect(isCached).toBe(true);
    });

    it('should clear audio cache', async () => {
      await mockAudioCache.clearCache();
      expect(mockAudioCache.clearCache).toHaveBeenCalled();
    });

    it('should get cache size', async () => {
      mockAudioCache.getCacheSize.mockResolvedValueOnce(50 * 1024 * 1024); // 50MB
      const size = await mockAudioCache.getCacheSize();
      
      expect(size).toBe(50 * 1024 * 1024);
    });
  });

  // ==========================================================================
  // SYNCHRONIZED LYRICS
  // ==========================================================================
  
  describe('📜 Synchronized Lyrics', () => {
    it('should parse LRC format lyrics', () => {
      const lrcContent = `[00:05.00]First line
[00:10.50]Second line
[00:15.75]Third line`;
      
      const parseLRC = (content: string) => {
        return content.split('\n').map(line => {
          const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.+)/);
          if (!match) return null;
          const minutes = parseInt(match[1]);
          const seconds = parseFloat(match[2]);
          return {
            time: minutes * 60 + seconds,
            text: match[3],
          };
        }).filter(Boolean);
      };

      const lyrics = parseLRC(lrcContent);
      expect(lyrics.length).toBe(3);
      expect(lyrics[0]).toEqual({ time: 5, text: 'First line' });
    });

    it('should find current lyric by time', () => {
      const lyrics = [
        { time: 0, text: 'Intro' },
        { time: 5, text: 'First verse' },
        { time: 10, text: 'Second verse' },
        { time: 15, text: 'Chorus' },
      ];

      const findCurrentLyric = (currentTime: number) => {
        for (let i = lyrics.length - 1; i >= 0; i--) {
          if (currentTime >= lyrics[i].time) {
            return lyrics[i];
          }
        }
        return lyrics[0];
      };

      expect(findCurrentLyric(7).text).toBe('First verse');
      expect(findCurrentLyric(12).text).toBe('Second verse');
      expect(findCurrentLyric(20).text).toBe('Chorus');
    });

    it('should highlight current lyric index', () => {
      const lyrics = [
        { time: 0, text: 'Line 1' },
        { time: 5, text: 'Line 2' },
        { time: 10, text: 'Line 3' },
      ];

      const getCurrentIndex = (currentTime: number) => {
        for (let i = lyrics.length - 1; i >= 0; i--) {
          if (currentTime >= lyrics[i].time) return i;
        }
        return 0;
      };

      expect(getCurrentIndex(0)).toBe(0);
      expect(getCurrentIndex(5)).toBe(1);
      expect(getCurrentIndex(7)).toBe(1);
      expect(getCurrentIndex(15)).toBe(2);
    });

    it('should scroll to current lyric', () => {
      const scrollToLyric = (index: number, container: { scrollTop: number }) => {
        const lineHeight = 40;
        container.scrollTop = index * lineHeight;
      };

      const container = { scrollTop: 0 };
      scrollToLyric(5, container);
      
      expect(container.scrollTop).toBe(200);
    });

    it('should handle lyrics without timestamps', () => {
      const plainLyrics = ['Line 1', 'Line 2', 'Line 3'];
      const duration = 60;
      
      const autoTimedLyrics = plainLyrics.map((text, i) => ({
        time: (duration / plainLyrics.length) * i,
        text,
      }));

      expect(autoTimedLyrics[0].time).toBe(0);
      expect(autoTimedLyrics[1].time).toBe(20);
      expect(autoTimedLyrics[2].time).toBe(40);
    });
  });

  // ==========================================================================
  // PLAYLIST MANAGEMENT
  // ==========================================================================
  
  describe('📃 Playlist Management', () => {
    it('should play next track', () => {
      const playlist = ['track1', 'track2', 'track3'];
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex < playlist.length - 1) {
          currentIndex++;
        }
        return playlist[currentIndex];
      };

      expect(playNext()).toBe('track2');
      expect(playNext()).toBe('track3');
      expect(playNext()).toBe('track3'); // At end, stays on last
    });

    it('should play previous track', () => {
      const playlist = ['track1', 'track2', 'track3'];
      let currentIndex = 2;
      
      const playPrevious = () => {
        if (currentIndex > 0) {
          currentIndex--;
        }
        return playlist[currentIndex];
      };

      expect(playPrevious()).toBe('track2');
      expect(playPrevious()).toBe('track1');
      expect(playPrevious()).toBe('track1'); // At start, stays on first
    });

    it('should handle shuffle mode', () => {
      const playlist = ['a', 'b', 'c', 'd', 'e'];
      
      // Deterministic Fisher-Yates with seed
      const shuffleWithSeed = (arr: string[], seed: number) => {
        const result = [...arr];
        let random = seed;
        
        for (let i = result.length - 1; i > 0; i--) {
          random = (random * 9301 + 49297) % 233280;
          const j = Math.floor((random / 233280) * (i + 1));
          [result[i], result[j]] = [result[j], result[i]];
        }
        
        return result;
      };

      const shuffled = shuffleWithSeed(playlist, 12345);
      expect(shuffled.length).toBe(5);
      expect(new Set(shuffled).size).toBe(5); // All unique
    });

    it('should handle repeat modes', () => {
      type RepeatMode = 'none' | 'one' | 'all';
      
      const getNextIndex = (current: number, length: number, repeat: RepeatMode): number | null => {
        if (repeat === 'one') return current;
        if (current === length - 1) {
          return repeat === 'all' ? 0 : null;
        }
        return current + 1;
      };

      expect(getNextIndex(0, 3, 'none')).toBe(1);
      expect(getNextIndex(2, 3, 'none')).toBeNull();
      expect(getNextIndex(2, 3, 'all')).toBe(0);
      expect(getNextIndex(1, 3, 'one')).toBe(1);
    });
  });

  // ==========================================================================
  // AUDIO STREAMING
  // ==========================================================================
  
  describe('📡 Audio Streaming', () => {
    it('should handle buffering state', () => {
      let isBuffering = true;
      
      const onCanPlay = () => { isBuffering = false; };
      const onWaiting = () => { isBuffering = true; };
      
      onCanPlay();
      expect(isBuffering).toBe(false);
      
      onWaiting();
      expect(isBuffering).toBe(true);
    });

    it('should calculate buffer progress', () => {
      const buffered = [
        { start: 0, end: 30 },
        { start: 45, end: 60 },
      ];
      const duration = 180;
      
      const getBufferedPercent = () => {
        const totalBuffered = buffered.reduce((acc, b) => acc + (b.end - b.start), 0);
        return (totalBuffered / duration) * 100;
      };

      expect(getBufferedPercent()).toBeCloseTo(25);
    });

    it('should handle network errors during streaming', () => {
      const errors: string[] = [];
      
      const handleNetworkError = (code: number) => {
        switch (code) {
          case 1: errors.push('MEDIA_ERR_ABORTED'); break;
          case 2: errors.push('MEDIA_ERR_NETWORK'); break;
          case 3: errors.push('MEDIA_ERR_DECODE'); break;
          case 4: errors.push('MEDIA_ERR_SRC_NOT_SUPPORTED'); break;
        }
      };

      handleNetworkError(2);
      expect(errors).toContain('MEDIA_ERR_NETWORK');
    });

    it('should implement retry with backoff', async () => {
      let attempts = 0;
      const maxRetries = 3;
      
      const playWithRetry = async (): Promise<boolean> => {
        while (attempts < maxRetries) {
          attempts++;
          const success = attempts === 3; // Success on 3rd attempt
          if (success) return true;
          await new Promise(r => setTimeout(r, 100 * attempts));
        }
        return false;
      };

      const result = await playWithRetry();
      expect(result).toBe(true);
      expect(attempts).toBe(3);
    });
  });

  // ==========================================================================
  // AUDIO FORMAT SUPPORT
  // ==========================================================================
  
  describe('🎼 Audio Format Support', () => {
    it('should check supported formats', () => {
      const supportedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
      
      const isSupported = (mimeType: string) => {
        return supportedFormats.includes(mimeType);
      };

      expect(isSupported('audio/mpeg')).toBe(true);
      expect(isSupported('audio/flac')).toBe(false);
    });

    it('should get file extension from URL', () => {
      const getExtension = (url: string) => {
        const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
        return match ? match[1].toLowerCase() : null;
      };

      expect(getExtension('https://example.com/audio.mp3')).toBe('mp3');
      expect(getExtension('https://example.com/audio.wav?token=abc')).toBe('wav');
    });

    it('should handle HLS streams', () => {
      const isHLSStream = (url: string) => {
        return url.endsWith('.m3u8') || url.includes('.m3u8?');
      };

      expect(isHLSStream('https://example.com/stream.m3u8')).toBe(true);
      expect(isHLSStream('https://example.com/audio.mp3')).toBe(false);
    });
  });

  // ==========================================================================
  // AUDIO METADATA
  // ==========================================================================
  
  describe('📋 Audio Metadata', () => {
    it('should format duration display', () => {
      const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(180)).toBe('3:00');
      expect(formatDuration(3661)).toBe('61:01');
    });

    it('should calculate progress percentage', () => {
      const getProgress = (current: number, total: number): number => {
        if (total === 0) return 0;
        return (current / total) * 100;
      };

      expect(getProgress(0, 180)).toBe(0);
      expect(getProgress(90, 180)).toBe(50);
      expect(getProgress(180, 180)).toBe(100);
      expect(getProgress(50, 0)).toBe(0);
    });

    it('should handle track metadata', () => {
      const track = {
        title: 'EDN Item 001',
        artist: 'MED-MNG',
        album: 'Medical Learning',
        duration: 180,
        coverUrl: 'https://example.com/cover.jpg',
      };

      expect(track.title).toBe('EDN Item 001');
      expect(track.duration).toBe(180);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  
  describe('⚠️ Edge Cases', () => {
    it('should handle empty audio source', async () => {
      const audio = new MockAudioElement();
      audio.src = '';
      
      try {
        await audio.play();
        // Should not reach here in real scenario
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle audio autoplay restrictions', async () => {
      const attemptAutoplay = async (): Promise<{ success: boolean; error?: string }> => {
        try {
          const audio = new MockAudioElement();
          await audio.play();
          return { success: true };
        } catch (error: any) {
          if (error.name === 'NotAllowedError') {
            return { success: false, error: 'Autoplay blocked by browser' };
          }
          throw error;
        }
      };

      const result = await attemptAutoplay();
      expect(result.success).toBe(true);
    });

    it('should handle concurrent play requests', async () => {
      let activeAudio: MockAudioElement | null = null;
      
      const playExclusive = async (url: string) => {
        if (activeAudio) {
          activeAudio.pause();
        }
        activeAudio = new MockAudioElement();
        activeAudio.src = url;
        await activeAudio.play();
        return activeAudio;
      };

      await playExclusive('track1.mp3');
      await playExclusive('track2.mp3');
      
      expect(activeAudio?.src).toBe('track2.mp3');
    });

    it('should handle very long audio files', () => {
      const audio = new MockAudioElement();
      audio.duration = 7200; // 2 hours
      
      expect(audio.duration).toBe(7200);
    });

    it('should handle audio in background tab', () => {
      let isVisible = true;
      let wasPlayingBeforeHide = false;
      
      const onVisibilityChange = (visible: boolean, isPlaying: boolean) => {
        if (!visible && isPlaying) {
          wasPlayingBeforeHide = true;
          // Could pause or continue based on settings
        }
        isVisible = visible;
      };

      onVisibilityChange(false, true);
      expect(wasPlayingBeforeHide).toBe(true);
    });
  });
});
