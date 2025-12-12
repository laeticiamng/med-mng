import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { medMngApi } from '@/hooks/useMedMngApi';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            user: { id: 'test-user-id' }
          }
        }
      })
    }
  }
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useMedMngApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getLibrary', () => {
    it('should return library items on success', async () => {
      const mockItems = [
        { id: '1', title: 'Song 1' },
        { id: '2', title: 'Song 2' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: mockItems, pagination: {} })
      });

      const result = await medMngApi.getLibrary();
      expect(result).toEqual(mockItems);
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await medMngApi.getLibrary();
      expect(result).toEqual([]);
    });

    it('should handle pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [], pagination: { page: 2, limit: 10 } })
      });

      await medMngApi.getLibrary(2, 10);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=10'),
        expect.any(Object)
      );
    });
  });

  describe('getRemainingQuota', () => {
    it('should return quota on success', async () => {
      const mockQuota = { remaining_credits: 50 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuota)
      });

      const result = await medMngApi.getRemainingQuota();
      expect(result).toEqual(mockQuota);
    });

    it('should return zero credits on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      const result = await medMngApi.getRemainingQuota();
      expect(result).toEqual({ remaining_credits: 0 });
    });
  });

  describe('createSong', () => {
    it('should create song successfully', async () => {
      const mockSong = { id: 'new-song-id', title: 'New Song' };

      // First call for CSRF token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'mock-csrf' })
      });

      // Second call for create song
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSong)
      });

      const result = await medMngApi.createSong('New Song', 'suno-123', { genre: 'pop' });
      expect(result).toEqual(mockSong);
    });

    it('should throw error on failed creation', async () => {
      // CSRF token success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'mock-csrf' })
      });

      // Create song failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'Invalid song data' })
      });

      await expect(medMngApi.createSong('', '', {})).rejects.toThrow('Invalid song data');
    });
  });

  describe('addToLibrary', () => {
    it('should add song to library', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'mock-csrf' })
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await medMngApi.addToLibrary('song-123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('toggleLike', () => {
    it('should toggle like status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ csrf_token: 'mock-csrf' })
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ liked: true })
      });

      const result = await medMngApi.toggleLike('song-123');
      expect(result).toEqual({ liked: true });
    });
  });

  describe('getSongDetails', () => {
    it('should return song details', async () => {
      const mockDetails = { id: 'song-123', title: 'Test Song', duration: 180 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDetails)
      });

      const result = await medMngApi.getSongDetails('song-123');
      expect(result).toEqual(mockDetails);
    });

    it('should return null on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'));

      const result = await medMngApi.getSongDetails('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('getUserStats', () => {
    it('should return user stats', async () => {
      const mockStats = { total_songs: 10, total_likes: 25, total_plays: 100 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStats)
      });

      const result = await medMngApi.getUserStats();
      expect(result).toEqual(mockStats);
    });

    it('should return default stats on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server error'));

      const result = await medMngApi.getUserStats();
      expect(result).toEqual({
        total_songs: 0,
        total_likes: 0,
        total_plays: 0
      });
    });
  });
});
