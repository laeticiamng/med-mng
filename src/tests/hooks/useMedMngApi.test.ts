import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { medMngApi, useMedMngApi } from '@/hooks/useMedMngApi';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    }
  }
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { supabase } from '@/integrations/supabase/client';

describe('useMedMngApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset CSRF token cache
    (medMngApi as any).csrfToken = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hook initialization', () => {
    it('should return the medMngApi instance', () => {
      const api = useMedMngApi();
      expect(api).toBe(medMngApi);
    });
  });

  describe('authentication', () => {
    it('should include Authorization header in requests', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'test-token-123' } as any },
        error: null
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [], pagination: {} })
      });

      await medMngApi.getLibrary();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      );
    });

    it('should throw error when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      await expect(medMngApi.getLibrary()).rejects.toThrow('Authentification requise');
    });
  });

  describe('CSRF token handling', () => {
    it('should fetch and cache CSRF token for write operations', async () => {
      // Mock authenticated session
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      // Mock CSRF token fetch
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ csrf_token: 'csrf-token-abc' })
        })
        // Mock actual API call
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, liked: true })
        });

      await medMngApi.toggleLike('song-123');

      // First call should be CSRF token fetch
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('/csrf-token'),
        expect.any(Object)
      );

      // Second call should include CSRF token header
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('/songs/song-123/like'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'csrf-token-abc'
          })
        })
      );
    });

    it('should reuse cached CSRF token', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      // Set cached token
      (medMngApi as any).csrfToken = 'cached-csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await medMngApi.toggleLike('song-456');

      // Should only make one call (no CSRF fetch)
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'cached-csrf-token'
          })
        })
      );
    });
  });

  describe('createSong', () => {
    it('should create a new song with metadata', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      const mockSong = { id: 'new-song', title: 'Test Song' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSong)
      });

      const result = await medMngApi.createSong('Test Song', 'suno-audio-123', { custom: 'meta' });

      expect(result).toEqual(mockSong);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/songs'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'Test Song',
            suno_audio_id: 'suno-audio-123',
            meta: { custom: 'meta' }
          })
        })
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid song data' })
      });

      await expect(medMngApi.createSong('', '', {})).rejects.toThrow('Invalid song data');
    });
  });

  describe('library operations', () => {
    it('should fetch user library with pagination', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      const mockLibrary = {
        items: [{ id: 'song-1' }, { id: 'song-2' }],
        pagination: { page: 1, total: 10 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLibrary)
      });

      const result = await medMngApi.getLibrary(1, 20);

      expect(result).toEqual([{ id: 'song-1' }, { id: 'song-2' }]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library?page=1&limit=20'),
        expect.any(Object)
      );
    });

    it('should add song to library', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await medMngApi.addToLibrary('song-123');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ song_id: 'song-123' })
        })
      );
    });

    it('should remove song from library', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await medMngApi.removeFromLibrary('song-123');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/library/song-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should return empty array on library fetch error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      const result = await medMngApi.getLibrary();

      expect(result).toEqual([]);
    });
  });

  describe('song operations', () => {
    it('should toggle like on a song', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ liked: true, likes_count: 10 })
      });

      const result = await medMngApi.toggleLike('song-123');

      expect(result).toEqual({ liked: true, likes_count: 10 });
    });

    it('should get song stream URL', () => {
      const url = medMngApi.getSongStreamUrl('song-123');
      expect(url).toContain('/songs/song-123/stream');
    });

    it('should fetch song lyrics', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      const mockLyrics = {
        text: 'Song lyrics here...',
        synchronized: [{ time: 0, text: 'First line' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLyrics)
      });

      const result = await medMngApi.getLyrics('song-123');

      expect(result).toEqual(mockLyrics);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/songs/song-123/lyrics'),
        expect.any(Object)
      );
    });
  });

  describe('quota operations', () => {
    it('should fetch remaining quota', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ remaining_credits: 75 })
      });

      const result = await medMngApi.getRemainingQuota();

      expect(result).toEqual({ remaining_credits: 75 });
    });

    it('should return default quota on error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      const result = await medMngApi.getRemainingQuota();

      expect(result).toEqual({ remaining_credits: 0 });
    });
  });

  describe('subscription operations', () => {
    it('should create user subscription', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      const mockSubscription = {
        id: 'sub-123',
        plan_id: 'premium',
        status: 'active'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubscription)
      });

      const result = await medMngApi.createUserSubscription('premium', 'stripe', 'stripe-sub-123');

      expect(result).toEqual(mockSubscription);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/subscriptions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            plan_id: 'premium',
            gateway: 'stripe',
            subscription_id: 'stripe-sub-123'
          })
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await medMngApi.getLibrary();

      expect(result).toEqual([]);
    });

    it('should extract error message from API response', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ message: 'Song already in library' })
      });

      await expect(medMngApi.addToLibrary('song-123')).rejects.toThrow('Song already in library');
    });

    it('should handle HTTP status when JSON parsing fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123', user: { id: 'user-123' } } as any },
        error: null
      });

      (medMngApi as any).csrfToken = 'csrf-token';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(medMngApi.createSong('Test', 'audio-id', {}))
        .rejects.toThrow('Erreur HTTP 500: Internal Server Error');
    });
  });
});
