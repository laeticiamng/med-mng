/**
 * Tests unitaires pour le store Supabase de rate limiting
 * Teste l'intégration avec Supabase et les fonctions SQL
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseRateLimitStore } from '@/services/stores/SupabaseRateLimitStore';

// Mock Supabase client
const mockSupabase = {
  rpc: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('SupabaseRateLimitStore', () => {
  let store: SupabaseRateLimitStore;

  beforeEach(() => {
    store = new SupabaseRateLimitStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAndIncrement', () => {
    it('should successfully increment counter and return status', async () => {
      // Arrange
      const mockResponse = {
        identifier: 'test-user',
        current_count: 5,
        max_requests: 10,
        window_start: '2025-08-22T10:00:00Z',
        window_end: '2025-08-22T10:01:00Z',
        rate_limited: false,
        remaining_requests: 5,
        reset_time: '2025-08-22T10:01:00Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement('test-user', 60, 10);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(5);
      expect(result.remainingRequests).toBe(5);
      expect(result.identifier).toBe('test-user');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_rate_limit_counter', {
        p_identifier: 'test-user',
        p_window_duration_seconds: 60,
        p_max_requests: 10
      });
    });

    it('should handle rate limit exceeded scenario', async () => {
      // Arrange
      const mockResponse = {
        identifier: 'test-user',
        current_count: 11,
        max_requests: 10,
        window_start: '2025-08-22T10:00:00Z',
        window_end: '2025-08-22T10:01:00Z',
        rate_limited: true,
        remaining_requests: 0,
        reset_time: '2025-08-22T10:01:00Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement('test-user', 60, 10);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.currentCount).toBe(11);
      expect(result.remainingRequests).toBe(0);
    });

    it('should handle Supabase errors gracefully', async () => {
      // Arrange
      const mockError = { message: 'Database connection failed' };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(store.checkAndIncrement('test-user', 60, 10))
        .rejects.toThrow('Failed to increment rate limit counter: Database connection failed');
    });

    it('should handle missing response data', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act & Assert
      await expect(store.checkAndIncrement('test-user', 60, 10))
        .rejects.toThrow('No data returned from rate limit counter');
    });

    it('should validate input parameters', async () => {
      // Act & Assert
      await expect(store.checkAndIncrement('', 60, 10))
        .rejects.toThrow('Identifier cannot be empty');
      
      await expect(store.checkAndIncrement('test-user', 0, 10))
        .rejects.toThrow('Window duration must be positive');
      
      await expect(store.checkAndIncrement('test-user', 60, 0))
        .rejects.toThrow('Max requests must be positive');
    });
  });

  describe('getStatus', () => {
    it('should get current rate limit status without incrementing', async () => {
      // Arrange
      const mockResponse = {
        identifier: 'test-user',
        current_count: 3,
        max_requests: 10,
        window_start: '2025-08-22T10:00:00Z',
        window_end: '2025-08-22T10:01:00Z',
        rate_limited: false,
        remaining_requests: 7,
        reset_time: '2025-08-22T10:01:00Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.getStatus('test-user', 60, 10);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.currentCount).toBe(3);
      expect(result.remainingRequests).toBe(7);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_rate_limit_status', {
        p_identifier: 'test-user',
        p_window_duration_seconds: 60,
        p_max_requests: 10
      });
    });

    it('should handle status check errors', async () => {
      // Arrange
      const mockError = { message: 'Connection timeout' };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(store.getStatus('test-user', 60, 10))
        .rejects.toThrow('Failed to get rate limit status: Connection timeout');
    });
  });

  describe('cleanup', () => {
    it('should clean up expired counters and return count', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ data: 15, error: null });

      // Act
      const result = await store.cleanup();

      // Assert
      expect(result).toBe(15);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('cleanup_expired_rate_limit_counters');
    });

    it('should handle cleanup errors', async () => {
      // Arrange
      const mockError = { message: 'Cleanup failed' };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      // Act & Assert
      await expect(store.cleanup())
        .rejects.toThrow('Failed to cleanup expired counters: Cleanup failed');
    });

    it('should return 0 when no data returned from cleanup', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      // Act
      const result = await store.cleanup();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('Date Parsing', () => {
    it('should correctly parse ISO date strings', async () => {
      // Arrange
      const mockResponse = {
        identifier: 'test-user',
        current_count: 1,
        max_requests: 10,
        window_start: '2025-08-22T10:00:00.000Z',
        window_end: '2025-08-22T10:01:00.000Z',
        rate_limited: false,
        remaining_requests: 9,
        reset_time: '2025-08-22T10:01:00.000Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement('test-user', 60, 10);

      // Assert
      expect(result.windowStart).toBeInstanceOf(Date);
      expect(result.windowEnd).toBeInstanceOf(Date);
      expect(result.resetTime).toBeInstanceOf(Date);
      expect(result.windowStart.toISOString()).toBe('2025-08-22T10:00:00.000Z');
      expect(result.windowEnd.toISOString()).toBe('2025-08-22T10:01:00.000Z');
      expect(result.resetTime.toISOString()).toBe('2025-08-22T10:01:00.000Z');
    });

    it('should handle invalid date strings gracefully', async () => {
      // Arrange
      const mockResponse = {
        identifier: 'test-user',
        current_count: 1,
        max_requests: 10,
        window_start: 'invalid-date',
        window_end: 'invalid-date',
        rate_limited: false,
        remaining_requests: 9,
        reset_time: 'invalid-date'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement('test-user', 60, 10);

      // Assert
      expect(result.windowStart).toBeInstanceOf(Date);
      expect(result.windowEnd).toBeInstanceOf(Date);
      expect(result.resetTime).toBeInstanceOf(Date);
      // Invalid dates should be converted to current time as fallback
      expect(result.windowStart.getTime()).toBeCloseTo(Date.now(), -2); // Within 2 decimal places (100ms)
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long identifiers', async () => {
      // Arrange
      const longIdentifier = 'a'.repeat(1000);
      const mockResponse = {
        identifier: longIdentifier,
        current_count: 1,
        max_requests: 10,
        window_start: '2025-08-22T10:00:00Z',
        window_end: '2025-08-22T10:01:00Z',
        rate_limited: false,
        remaining_requests: 9,
        reset_time: '2025-08-22T10:01:00Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement(longIdentifier, 60, 10);

      // Assert
      expect(result.identifier).toBe(longIdentifier);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_rate_limit_counter', {
        p_identifier: longIdentifier,
        p_window_duration_seconds: 60,
        p_max_requests: 10
      });
    });

    it('should handle large window durations', async () => {
      // Arrange
      const largeWindow = 86400; // 1 day in seconds
      const mockResponse = {
        identifier: 'test-user',
        current_count: 1,
        max_requests: 1000,
        window_start: '2025-08-22T00:00:00Z',
        window_end: '2025-08-23T00:00:00Z',
        rate_limited: false,
        remaining_requests: 999,
        reset_time: '2025-08-23T00:00:00Z'
      };
      mockSupabase.rpc.mockResolvedValue({ data: mockResponse, error: null });

      // Act
      const result = await store.checkAndIncrement('test-user', largeWindow, 1000);

      // Assert
      expect(result.allowed).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_rate_limit_counter', {
        p_identifier: 'test-user',
        p_window_duration_seconds: largeWindow,
        p_max_requests: 1000
      });
    });
  });
});