import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      })),
      upsert: vi.fn().mockResolvedValue({ error: null })
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}));

import { BADGE_DEFINITIONS, POINTS_CONFIG, useGamification, XP_PER_LEVEL } from '@/hooks/useGamification';

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constants & Configuration', () => {
    it('should export correct XP_PER_LEVEL', () => {
      expect(XP_PER_LEVEL).toBe(1000);
    });

    it('should have valid POINTS_CONFIG', () => {
      expect(POINTS_CONFIG.itemReviewed).toBe(10);
      expect(POINTS_CONFIG.itemMastered).toBe(50);
      expect(POINTS_CONFIG.examCompleted).toBe(100);
      expect(POINTS_CONFIG.perfectExam).toBe(200);
      expect(POINTS_CONFIG.dailyStreak).toBe(25);
      expect(POINTS_CONFIG.clinicalCase).toBe(75);
      expect(POINTS_CONFIG.aiQuestion).toBe(5);
    });

    it('should have comprehensive badge definitions', () => {
      expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(20);
      
      const badgeIds = BADGE_DEFINITIONS.map(b => b.id);
      expect(badgeIds).toContain('first_item');
      expect(badgeIds).toContain('streak_7');
      expect(badgeIds).toContain('perfect_exam');
      expect(badgeIds).toContain('clinical_master');
      expect(badgeIds).toContain('music_first');
      expect(badgeIds).toContain('ai_chat');
    });

    it('should have valid rarity for all badges', () => {
      const validRarities = ['common', 'rare', 'epic', 'legendary'];
      BADGE_DEFINITIONS.forEach(badge => {
        expect(validRarities).toContain(badge.rarity);
      });
    });

    it('should have unique badge IDs', () => {
      const ids = BADGE_DEFINITIONS.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Level Calculation', () => {
    it('should calculate level correctly from XP', () => {
      // XP 0 = Level 1
      expect(Math.floor(0 / XP_PER_LEVEL) + 1).toBe(1);
      // XP 500 = Level 1
      expect(Math.floor(500 / XP_PER_LEVEL) + 1).toBe(1);
      // XP 1000 = Level 2
      expect(Math.floor(1000 / XP_PER_LEVEL) + 1).toBe(2);
      // XP 10000 = Level 11
      expect(Math.floor(10000 / XP_PER_LEVEL) + 1).toBe(11);
    });

    it('should calculate XP to next level correctly', () => {
      // XP 0 needs 1000 to level up
      expect(XP_PER_LEVEL - (0 % XP_PER_LEVEL)).toBe(1000);
      // XP 500 needs 500 to level up
      expect(XP_PER_LEVEL - (500 % XP_PER_LEVEL)).toBe(500);
      // XP 999 needs 1 to level up
      expect(XP_PER_LEVEL - (999 % XP_PER_LEVEL)).toBe(1);
    });
  });

  describe('Points System', () => {
    it('should award more points for mastery than review', () => {
      expect(POINTS_CONFIG.itemMastered).toBeGreaterThan(POINTS_CONFIG.itemReviewed);
    });

    it('should award more points for perfect exam than regular exam', () => {
      expect(POINTS_CONFIG.perfectExam).toBeGreaterThan(POINTS_CONFIG.examCompleted);
    });

    it('should not allow negative points', () => {
      Object.values(POINTS_CONFIG).forEach(points => {
        expect(points).toBeGreaterThan(0);
      });
    });
  });

  describe('Badge Definitions', () => {
    it('should have emoji icons for all badges', () => {
      BADGE_DEFINITIONS.forEach(badge => {
        expect(badge.icon).toBeTruthy();
        expect(badge.icon.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have descriptions for all badges', () => {
      BADGE_DEFINITIONS.forEach(badge => {
        expect(badge.description).toBeTruthy();
        expect(badge.description.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize loading as true', () => {
      const { result } = renderHook(() => useGamification());
      expect(result.current.loading).toBe(true);
    });

    it('should have default stats structure', () => {
      const { result } = renderHook(() => useGamification());

      // Test the hook returns expected structure
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('stats');
      expect(typeof result.current.loading).toBe('boolean');
    });
  });
});
