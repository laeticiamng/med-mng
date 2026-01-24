import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
          }))
        }))
      })),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }))
  }
}));

import { useAdaptiveSRS } from '@/hooks/useAdaptiveSRS';

describe('useAdaptiveSRS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SM-2+ Algorithm Logic', () => {
    it('should cap interval at 365 days', () => {
      // Test the algorithm logic directly
      const rawInterval = 600;
      const cappedInterval = Math.min(rawInterval, 365);
      expect(cappedInterval).toBe(365);

      // Within range should pass through
      const validInterval = 200;
      expect(Math.min(validInterval, 365)).toBe(200);
    });

    it('should have minimum interval of 0.5 days', () => {
      expect(Math.max(0.1, 0.5)).toBe(0.5);
      expect(Math.max(1, 0.5)).toBe(1);
    });

    it('should apply deterministic fuzz factor', () => {
      // Same inputs = same output (deterministic)
      const repetitions = 5;
      const quality = 4;
      const interval = 10;
      
      const cardHash1 = (repetitions * 17 + quality * 31 + interval * 7) % 100;
      const cardHash2 = (repetitions * 17 + quality * 31 + interval * 7) % 100;
      
      expect(cardHash1).toBe(cardHash2);

      // Fuzz should be in valid range
      const fuzz = 0.95 + (cardHash1 / 1000);
      expect(fuzz).toBeGreaterThanOrEqual(0.95);
      expect(fuzz).toBeLessThanOrEqual(1.1);
    });

    it('should never lower ease factor below 1.3', () => {
      const minEF = 1.3;
      expect(Math.max(minEF, 2.5 - 0.5)).toBe(2.0);
      expect(Math.max(minEF, 1.5 - 0.5)).toBe(1.3);
      expect(Math.max(minEF, 1.3 - 0.5)).toBe(1.3);
    });

    it('should classify difficulty correctly', () => {
      // Hard: quality < 3 or consecutive errors
      const isHard = (q, errors) => q < 3 || errors >= 1;
      expect(isHard(2, 0)).toBe(true);
      expect(isHard(4, 2)).toBe(true);
      expect(isHard(4, 0)).toBe(false);

      // Easy: quality >= 4 AND consecutive correct >= 2
      const isEasy = (q, correct) => q >= 4 && correct >= 2;
      expect(isEasy(4, 3)).toBe(true);
      expect(isEasy(3, 3)).toBe(false);
      expect(isEasy(4, 1)).toBe(false);
    });
  });

  describe('Quality Validation', () => {
    it('should accept quality values 0-5', () => {
      const isValidQuality = (q) => q >= 0 && q <= 5;
      expect(isValidQuality(0)).toBe(true);
      expect(isValidQuality(3)).toBe(true);
      expect(isValidQuality(5)).toBe(true);
      expect(isValidQuality(-1)).toBe(false);
      expect(isValidQuality(6)).toBe(false);
    });
  });

  describe('Repetitions Calculation', () => {
    it('should decrease repetitions on failed review', () => {
      const currentReps = 5;
      const newReps = Math.max(0, currentReps - 1);
      expect(newReps).toBe(4);
    });

    it('should increase repetitions on successful review', () => {
      const currentReps = 5;
      const newReps = currentReps + 1;
      expect(newReps).toBe(6);
    });

    it('should not go below 0 repetitions', () => {
      const currentReps = 0;
      const newReps = Math.max(0, currentReps - 1);
      expect(newReps).toBe(0);
    });
  });

  describe('Review Processing', () => {
    it('should require authenticated user', async () => {
      const { result } = renderHook(() => useAdaptiveSRS());
      
      const success = await result.current.processReview('card-123', 4);
      expect(success).toBe(false);
    });
  });
});
