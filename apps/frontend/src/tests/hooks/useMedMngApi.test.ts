import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMedMngApi, medMngApi } from '@/hooks/useMedMngApi';
import { renderHook } from '@testing-library/react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Supabase
const mockSupabaseAuth = {
  getSession: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockSupabaseAuth.getSession(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useMedMngApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-access-token',
          user: { id: 'user-123' },
        },
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hook instantiation', () => {
    it('should return the medMngApi instance', () => {
      const { result } = renderHook(() => useMedMngApi());
      expect(result.current).toBe(medMngApi);
    });

    it('should have all required methods', () => {
      const { result } = renderHook(() => useMedMngApi());
      expect(typeof result.current.createSong).toBe('function');
      expect(typeof result.current.getLibrary).toBe('function');
      expect(typeof result.current.addToLibrary).toBe('function');
      expect(typeof result.current.removeFromLibrary).toBe('function');
      expect(typeof result.current.toggleLike).toBe('function');
      expect(typeof result.current.getLyrics).toBe('function');
      expect(typeof result.current.getRemainingQuota).toBe('function');
      expect(typeof result.current.getSongStreamUrl).toBe('function');
    });
  });

  describe('authentication', () => {
    it('should throw error when not authenticated', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const api = useMedMngApi();

      await expect(api.getLibrary()).rejects.toThrow('Authentification requise');
    });

    it('should include Authorization header in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [], pagination: {} }),
      });

      const api = useMedMngApi();
      await api.getLibrary();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });
  });

  describe('CSRF protection', () => {
    it('should fetch CSRF token for write operations', async () => {
      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf-token' }),
      });

      // Mock actual API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'song-123', title: 'Test Song' }),
      });

      const api = useMedMngApi();
      await api.createSong('Test Song', 'suno-123', {});

      // First call should be CSRF token fetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/csrf-token'),
        expect.any(Object)
      );

      // Second call should include CSRF token
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/songs'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-csrf-token',
          }),
        })
      );
    });
  });

  describe('createSong', () => {
    beforeEach(() => {
      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });
    });

    it('should create a song successfully', async () => {
      const mockSong = {
        id: 'song-123',
        title: 'Test Song',
        suno_audio_id: 'suno-456',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSong),
      });

      const api = useMedMngApi();
      const result = await api.createSong('Test Song', 'suno-456', { genre: 'pop' });

      expect(result).toEqual(mockSong);
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid song data' }),
      });

      const api = useMedMngApi();

      await expect(
        api.createSong('Test Song', 'suno-456', {})
      ).rejects.toThrow('Invalid song data');
    });
  });

  describe('getLibrary', () => {
    it('should fetch library with pagination', async () => {
      const mockLibrary = {
        items: [
          { id: 'song-1', title: 'Song 1' },
          { id: 'song-2', title: 'Song 2' },
        ],
        pagination: { page: 1, limit: 20, total: 2 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibrary),
      });

      const api = useMedMngApi();
      const result = await api.getLibrary(1, 20);

      expect(result).toEqual(mockLibrary.items);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('library?page=1&limit=20'),
        expect.any(Object)
      );
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const api = useMedMngApi();
      const result = await api.getLibrary();

      expect(result).toEqual([]);
    });
  });

  describe('addToLibrary', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });
    });

    it('should add song to library', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, song_id: 'song-123' }),
      });

      const api = useMedMngApi();
      const result = await api.addToLibrary('song-123');

      expect(result.success).toBe(true);
    });

    it('should throw error if already in library', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Song already in library' }),
      });

      const api = useMedMngApi();

      await expect(api.addToLibrary('song-123')).rejects.toThrow(
        'Song already in library'
      );
    });
  });

  describe('removeFromLibrary', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });
    });

    it('should remove song from library', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const api = useMedMngApi();
      const result = await api.removeFromLibrary('song-123');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/song-123'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('toggleLike', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });
    });

    it('should toggle like status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ liked: true, likes_count: 42 }),
      });

      const api = useMedMngApi();
      const result = await api.toggleLike('song-123');

      expect(result.liked).toBe(true);
      expect(result.likes_count).toBe(42);
    });
  });

  describe('getLyrics', () => {
    it('should fetch song lyrics', async () => {
      const mockLyrics = {
        song_id: 'song-123',
        lyrics: [
          { time: 0, text: 'First line' },
          { time: 5, text: 'Second line' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLyrics),
      });

      const api = useMedMngApi();
      const result = await api.getLyrics('song-123');

      expect(result).toEqual(mockLyrics);
    });

    it('should throw error for invalid song', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Song not found' }),
      });

      const api = useMedMngApi();

      await expect(api.getLyrics('invalid-id')).rejects.toThrow('Song not found');
    });
  });

  describe('getRemainingQuota', () => {
    it('should fetch remaining quota', async () => {
      const mockQuota = {
        remaining_credits: 50,
        total_credits: 100,
        can_generate: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuota),
      });

      const api = useMedMngApi();
      const result = await api.getRemainingQuota();

      expect(result).toEqual(mockQuota);
    });

    it('should return default quota on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const api = useMedMngApi();
      const result = await api.getRemainingQuota();

      expect(result).toEqual({ remaining_credits: 0 });
    });
  });

  describe('getSongStreamUrl', () => {
    it('should return correct stream URL', () => {
      const api = useMedMngApi();
      const url = api.getSongStreamUrl('song-123');

      expect(url).toContain('/songs/song-123/stream');
    });
  });

  describe('createUserSubscription', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });
    });

    it('should create subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        plan_id: 'premium',
        status: 'active',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription),
      });

      const api = useMedMngApi();
      const result = await api.createUserSubscription('premium', 'stripe', 'stripe-sub-123');

      expect(result).toEqual(mockSubscription);
      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/subscriptions'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('premium'),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const api = useMedMngApi();

      // getLibrary should return empty array
      const library = await api.getLibrary();
      expect(library).toEqual([]);

      // getRemainingQuota should return default
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const quota = await api.getRemainingQuota();
      expect(quota).toEqual({ remaining_credits: 0 });
    });

    it('should parse error messages from API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Custom error message' }),
      });

      const api = useMedMngApi();

      await expect(
        api.createSong('Test', 'suno-123', {})
      ).rejects.toThrow('Custom error message');
    });

    it('should fallback to HTTP status on parse error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'test-csrf' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const api = useMedMngApi();

      await expect(
        api.createSong('Test', 'suno-123', {})
      ).rejects.toThrow('Erreur HTTP 500: Internal Server Error');
    });
  });
});
