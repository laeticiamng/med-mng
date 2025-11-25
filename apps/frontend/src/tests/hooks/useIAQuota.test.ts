import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useIAQuota, checkAndUseCredits } from '@/hooks/useIAQuota';

// Mock Supabase
const mockSupabaseAuth = {
  getUser: vi.fn(),
  getSession: vi.fn(),
};

const mockSupabaseRpc = vi.fn();
const mockSupabaseFunctions = {
  invoke: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => mockSupabaseAuth.getUser(),
      getSession: () => mockSupabaseAuth.getSession(),
    },
    rpc: (name: string, params?: any) => mockSupabaseRpc(name, params),
    functions: {
      invoke: (name: string, options?: any) => mockSupabaseFunctions.invoke(name, options),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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

describe('useIAQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchQuota', () => {
    it('should return default quota (80) when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: null } });

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(80);
    });

    it('should fetch quota from database when user is authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
      mockSupabaseRpc.mockResolvedValue({
        data: [{ remaining_credits: 50 }],
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(50);
    });

    it('should return default quota on database error', async () => {
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
      mockSupabaseRpc.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const { result } = renderHook(() => useIAQuota());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.quota).toBe(80);
    });
  });

  describe('checkQuota', () => {
    it('should check if user has enough credits', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { has_enough_credits: true, remaining_credits: 45 },
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      const checkResult = await result.current.checkQuota('music', 'generation');

      expect(checkResult).toEqual({
        canProceed: true,
        required: 5, // music.generation costs 5 credits
        remaining: 45,
      });
    });

    it('should return false when credits are insufficient', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { has_enough_credits: false, remaining_credits: 2 },
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      const checkResult = await result.current.checkQuota('music', 'generation');

      expect(checkResult.canProceed).toBe(false);
    });
  });

  describe('useQuota', () => {
    it('should consume credits successfully', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { success: true, remaining_credits: 45 },
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      const useResult = await result.current.useQuota('chat', 'message');

      expect(useResult).toBe(true);
      expect(result.current.quota).toBe(45);
    });

    it('should return false when credit consumption fails', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { success: false, required_credits: 5, remaining_credits: 2 },
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      const useResult = await result.current.useQuota('music', 'generation');

      expect(useResult).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should fetch usage statistics', async () => {
      const mockStats = {
        by_service: [
          { service_type: 'music', total_operations: 10, total_credits: 50 },
        ],
        daily_usage: [{ usage_date: '2024-01-01', daily_credits: 15 }],
        period_days: 30,
        total_operations: 10,
        total_credits_used: 50,
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const { result } = renderHook(() => useIAQuota());

      const stats = await result.current.getStats(30);

      expect(stats).toEqual(mockStats);
    });

    it('should return null on error', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: null,
        error: new Error('Stats fetch failed'),
      });

      const { result } = renderHook(() => useIAQuota());

      const stats = await result.current.getStats();

      expect(stats).toBeNull();
    });
  });

  describe('Credit costs', () => {
    it('should calculate correct credit costs for different services', async () => {
      const { result } = renderHook(() => useIAQuota());

      // These costs are defined in the hook
      // music: generation: 5, stream: 1, download: 2
      // qcm: generation: 2, correction: 1
      // chat: message: 1, context: 2
      // bd: generation: 10
      // roman: generation: 15
      // image: generation: 3

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      });

      // Mock different credit costs
      mockSupabaseFunctions.invoke.mockImplementation(async (name, options) => {
        const body = options?.body;
        return {
          data: {
            has_enough_credits: true,
            remaining_credits: 100 - body?.credits_to_use,
          },
          error: null,
        };
      });

      // Test music generation (5 credits)
      await result.current.checkQuota('music', 'generation');
      expect(mockSupabaseFunctions.invoke).toHaveBeenCalledWith(
        expect.stringContaining('quota'),
        expect.objectContaining({
          body: expect.objectContaining({ credits_required: 5 }),
        })
      );
    });
  });
});

describe('checkAndUseCredits utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check and use credits in one operation', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
    mockSupabaseFunctions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    const result = await checkAndUseCredits('chat', 'message', { content: 'test' });

    expect(result).toBe(true);
  });

  it('should return false on error', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
    });
    mockSupabaseFunctions.invoke.mockRejectedValue(new Error('No session'));

    const result = await checkAndUseCredits('music', 'generation');

    expect(result).toBe(false);
  });
});
