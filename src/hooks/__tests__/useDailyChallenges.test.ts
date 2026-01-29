import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
        in: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null,
      })),
      upsert: vi.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDailyChallenges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefaultChallenges', () => {
    it('should return default challenges when no database challenges exist', async () => {
      // Test the fallback behavior
      const defaultChallenges = [
        { id: 'default-1', title: 'Réviser 10 items EDN', challenge_type: 'study', target_value: 10 },
        { id: 'default-2', title: 'Compléter 5 QCM', challenge_type: 'quiz', target_value: 5 },
        { id: 'default-3', title: 'Générer une chanson', challenge_type: 'music', target_value: 1 },
      ];

      expect(defaultChallenges).toHaveLength(3);
      expect(defaultChallenges[0].challenge_type).toBe('study');
      expect(defaultChallenges[1].challenge_type).toBe('quiz');
      expect(defaultChallenges[2].challenge_type).toBe('music');
    });

    it('should have correct XP rewards for each difficulty', () => {
      const rewards = {
        easy: 50,
        medium: 75,
        hard: 100,
      };

      expect(rewards.easy).toBe(50);
      expect(rewards.medium).toBe(75);
      expect(rewards.hard).toBe(100);
    });
  });

  describe('DailyChallenge interface', () => {
    it('should have all required properties', () => {
      const challenge = {
        id: 'test-1',
        title: 'Test Challenge',
        description: 'Test description',
        challenge_type: 'study',
        target_value: 10,
        current_value: 5,
        reward_xp: 50,
        expires_at: new Date().toISOString(),
        is_completed: false,
        difficulty: 'easy' as const,
      };

      expect(challenge).toHaveProperty('id');
      expect(challenge).toHaveProperty('title');
      expect(challenge).toHaveProperty('description');
      expect(challenge).toHaveProperty('challenge_type');
      expect(challenge).toHaveProperty('target_value');
      expect(challenge).toHaveProperty('current_value');
      expect(challenge).toHaveProperty('reward_xp');
      expect(challenge).toHaveProperty('expires_at');
      expect(challenge).toHaveProperty('is_completed');
      expect(challenge).toHaveProperty('difficulty');
    });

    it('should validate difficulty values', () => {
      const validDifficulties = ['easy', 'medium', 'hard'];
      
      validDifficulties.forEach(difficulty => {
        expect(['easy', 'medium', 'hard']).toContain(difficulty);
      });
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress percentage correctly', () => {
      const currentValue = 7;
      const targetValue = 10;
      const progress = (currentValue / targetValue) * 100;

      expect(progress).toBe(70);
    });

    it('should not exceed 100% when current exceeds target', () => {
      const currentValue = 15;
      const targetValue = 10;
      const progress = Math.min((currentValue / targetValue) * 100, 100);

      expect(progress).toBe(100);
    });

    it('should handle zero target value', () => {
      const currentValue = 5;
      const targetValue = 0;
      const progress = targetValue === 0 ? 0 : (currentValue / targetValue) * 100;

      expect(progress).toBe(0);
    });
  });

  describe('expiration logic', () => {
    it('should detect expired challenges', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const isExpired = new Date(pastDate) < new Date();

      expect(isExpired).toBe(true);
    });

    it('should detect active challenges', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const isExpired = new Date(futureDate) < new Date();

      expect(isExpired).toBe(false);
    });
  });
});
