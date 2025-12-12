import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIAQuota, checkAndUseCredits } from '@/hooks/useIAQuota';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn()
    },
    rpc: vi.fn(),
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

import { supabase } from '@/integrations/supabase/client';

describe('useIAQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state and fetchQuota', () => {
    it('should initialize with default quota for unauthenticated users', async () => {
      // Mock unauthenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(80);
    });

    it('should fetch quota from database for authenticated users', async () => {
      // Mock authenticated user
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } as any },
        error: null
      });

      // Mock RPC response
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 150 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(150);
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_ai_quota');
    });

    it('should handle RPC errors gracefully with default quota', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(80);
    });
  });

  describe('checkQuota', () => {
    it('should check if user has enough credits for operation', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { has_enough_credits: true, remaining_credits: 100 },
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 100 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const checkResult = await result.current.checkQuota('music', 'generation');

      expect(checkResult.canProceed).toBe(true);
      expect(checkResult.required).toBe(5); // music generation costs 5 credits
      expect(checkResult.remaining).toBe(100);
    });

    it('should return false when user lacks sufficient credits', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { has_enough_credits: false, remaining_credits: 2 },
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 2 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const checkResult = await result.current.checkQuota('bd', 'generation');

      expect(checkResult.canProceed).toBe(false);
      expect(checkResult.required).toBe(10); // BD generation costs 10 credits
    });
  });

  describe('useQuota', () => {
    it('should deduct credits after successful operation', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, remaining_credits: 95 },
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 100 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const useResult = await result.current.useQuota('music', 'generation', { item: 'test' });

      expect(useResult).toBe(true);
      expect(result.current.quota).toBe(95);
    });

    it('should return false and show toast when quota insufficient', async () => {
      const mockToast = vi.fn();
      vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: false, required_credits: 10, remaining_credits: 5 },
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 5 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const useResult = await result.current.useQuota('bd', 'generation');

      expect(useResult).toBe(false);
    });
  });

  describe('credit costs', () => {
    it('should return correct credit costs for each service type', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test via checkQuota which uses getCreditsRequired internally
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token' } as any },
        error: null
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { has_enough_credits: true, remaining_credits: 100 },
        error: null
      } as any);

      // Music generation = 5
      let check = await result.current.checkQuota('music', 'generation');
      expect(check.required).toBe(5);

      // QCM generation = 2
      check = await result.current.checkQuota('qcm', 'generation');
      expect(check.required).toBe(2);

      // BD generation = 10
      check = await result.current.checkQuota('bd', 'generation');
      expect(check.required).toBe(10);

      // Roman generation = 15
      check = await result.current.checkQuota('roman', 'generation');
      expect(check.required).toBe(15);

      // Chat message = 1
      check = await result.current.checkQuota('chat', 'message');
      expect(check.required).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should fetch usage statistics', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'token-123' } as any },
        error: null
      });

      const mockStats = {
        by_service: [
          { service_type: 'music', total_operations: 10, total_credits: 50 }
        ],
        daily_usage: [
          { usage_date: '2024-01-01', daily_credits: 10 }
        ],
        period_days: 30,
        total_operations: 10,
        total_credits_used: 50
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockStats,
        error: null
      } as any);

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ remaining_credits: 100 }],
        error: null
      } as any);

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats = await result.current.getStats(30);

      expect(stats).toEqual(mockStats);
      expect(stats?.total_credits_used).toBe(50);
    });
  });
});

describe('checkAndUseCredits utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when credits are successfully used', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'token-123' } as any },
      error: null
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { success: true },
      error: null
    } as any);

    const result = await checkAndUseCredits('music', 'generation', { test: true });

    expect(result).toBe(true);
  });

  it('should return false on API error', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'token-123' } as any },
      error: null
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: null,
      error: { message: 'API Error' }
    } as any);

    const result = await checkAndUseCredits('music', 'generation');

    expect(result).toBe(false);
  });
});
