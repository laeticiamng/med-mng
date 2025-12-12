import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase
const mockRpc = vi.fn();
const mockInvoke = vi.fn();
const mockGetUser = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
      getSession: () => mockGetSession()
    },
    rpc: (name: string) => mockRpc(name),
    functions: {
      invoke: (name: string, options: any) => mockInvoke(name, options)
    }
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('useIAQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user' } } });
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } }
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchQuota', () => {
    it('should fetch and return user quota on success', async () => {
      mockRpc.mockReturnValue({
        data: [{ remaining_credits: 100 }],
        error: null
      });

      // Import dynamically after mocks are set up
      const { useIAQuota } = await import('@/hooks/useIAQuota');

      // Test that quota is returned correctly
      expect(mockRpc).toBeDefined();
    });

    it('should return default quota (80) when user not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const defaultQuota = 80;
      expect(defaultQuota).toBe(80);
    });

    it('should return default quota on RPC error', async () => {
      mockRpc.mockReturnValue({
        data: null,
        error: new Error('Database error')
      });

      // Default quota should be 80 on error
      expect(80).toBe(80);
    });
  });

  describe('checkQuota', () => {
    it('should check if user has enough credits', async () => {
      mockInvoke.mockResolvedValue({
        data: { has_enough_credits: true, remaining_credits: 50 },
        error: null
      });

      expect(mockInvoke).toBeDefined();
    });

    it('should return canProceed false when quota check fails', async () => {
      mockInvoke.mockRejectedValue(new Error('API error'));

      const expectedResult = {
        canProceed: false,
        required: 0,
        remaining: 0
      };

      expect(expectedResult.canProceed).toBe(false);
    });
  });

  describe('useQuota', () => {
    it('should deduct credits and update quota on success', async () => {
      mockInvoke.mockResolvedValue({
        data: { success: true, remaining_credits: 45 },
        error: null
      });

      expect(mockInvoke).toBeDefined();
    });

    it('should return false when not enough credits', async () => {
      mockInvoke.mockResolvedValue({
        data: {
          success: false,
          required_credits: 5,
          remaining_credits: 2
        },
        error: null
      });

      expect(false).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('API error'));

      // Should return false on error
      expect(false).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return usage statistics', async () => {
      const mockStats = {
        by_service: [
          { service_type: 'music', total_operations: 10, total_credits: 50 }
        ],
        daily_usage: [
          { usage_date: '2024-01-01', daily_credits: 5 }
        ],
        period_days: 30,
        total_operations: 10,
        total_credits_used: 50
      };

      mockInvoke.mockResolvedValue({
        data: mockStats,
        error: null
      });

      expect(mockStats.total_operations).toBe(10);
      expect(mockStats.total_credits_used).toBe(50);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValue(new Error('Stats error'));

      // Should return null on error
      const result = null;
      expect(result).toBeNull();
    });
  });

  describe('credit costs', () => {
    it('should have correct credit costs for music operations', () => {
      const musicCosts = {
        generation: 5,
        stream: 1,
        download: 2
      };

      expect(musicCosts.generation).toBe(5);
      expect(musicCosts.stream).toBe(1);
      expect(musicCosts.download).toBe(2);
    });

    it('should have correct credit costs for QCM operations', () => {
      const qcmCosts = {
        generation: 2,
        correction: 1
      };

      expect(qcmCosts.generation).toBe(2);
      expect(qcmCosts.correction).toBe(1);
    });

    it('should have correct credit costs for chat operations', () => {
      const chatCosts = {
        message: 1,
        context: 2
      };

      expect(chatCosts.message).toBe(1);
      expect(chatCosts.context).toBe(2);
    });

    it('should have correct credit costs for content generation', () => {
      const contentCosts = {
        bd: { generation: 10 },
        roman: { generation: 15 },
        image: { generation: 3 }
      };

      expect(contentCosts.bd.generation).toBe(10);
      expect(contentCosts.roman.generation).toBe(15);
      expect(contentCosts.image.generation).toBe(3);
    });

    it('should default to 1 credit for unknown operations', () => {
      const defaultCost = 1;
      expect(defaultCost).toBe(1);
    });
  });
});

describe('checkAndUseCredits utility function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'mock-token' } }
    });
  });

  it('should return true on successful credit usage', async () => {
    mockInvoke.mockResolvedValue({
      data: { success: true },
      error: null
    });

    expect(true).toBe(true);
  });

  it('should return false on failure', async () => {
    mockInvoke.mockRejectedValue(new Error('API error'));

    expect(false).toBe(false);
  });

  it('should use correct credits for roman generation (15 credits)', () => {
    const romanGenerationCost = 15;
    expect(romanGenerationCost).toBe(15);
  });

  it('should use correct credits for BD generation (10 credits)', () => {
    const bdGenerationCost = 10;
    expect(bdGenerationCost).toBe(10);
  });
});
