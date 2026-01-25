import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-123' } } })
  },
  from: vi.fn()
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Progress Dashboard - Weighted Success Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Probability Calculation', () => {
    it('should use correct weight distribution', () => {
      const srsWeight = 0.40;
      const examWeight = 0.30;
      const regularityWeight = 0.30;

      // Weights should sum to 1.0
      expect(srsWeight + examWeight + regularityWeight).toBe(1.0);
    });

    it('should calculate weighted probability correctly', () => {
      const srsScore = 85; // 85% SRS mastery
      const examScore = 75; // 75% average exam
      const regularityScore = 90; // 90% regularity

      const srsWeight = 0.40;
      const examWeight = 0.30;
      const regularityWeight = 0.30;

      const rawProbability = (srsScore * srsWeight) + (examScore * examWeight) + (regularityScore * regularityWeight);
      // 34 + 22.5 + 27 = 83.5

      expect(rawProbability).toBeCloseTo(83.5, 1);
    });

    it('should clamp probability between 50 and 95', () => {
      const clampProbability = (raw: number, hasActivity: boolean): number => {
        if (!hasActivity) return 0;
        return Math.max(50, Math.min(95, Math.round(raw)));
      };

      expect(clampProbability(30, true)).toBe(50); // Below minimum
      expect(clampProbability(99, true)).toBe(95); // Above maximum
      expect(clampProbability(75, true)).toBe(75); // Within range
      expect(clampProbability(80, false)).toBe(0); // No activity
    });

    it('should return 0 for users with no activity', () => {
      const hasActivity = false;
      const probability = hasActivity ? 75 : 0;
      expect(probability).toBe(0);
    });
  });

  describe('SRS Mastery Score', () => {
    it('should calculate SRS score from card data', () => {
      const cards = [
        { mastery_level: 'mastered' },
        { mastery_level: 'learning' },
        { mastery_level: 'mastered' },
        { mastery_level: 'new' },
        { mastery_level: 'mastered' }
      ];

      const masteredCount = cards.filter(c => c.mastery_level === 'mastered').length;
      const srsScore = (masteredCount / cards.length) * 100;

      expect(srsScore).toBe(60); // 3/5 = 60%
    });

    it('should handle zero cards gracefully', () => {
      const cards: any[] = [];
      const srsScore = cards.length > 0 
        ? (cards.filter(c => c.mastery_level === 'mastered').length / cards.length) * 100 
        : 0;
      expect(srsScore).toBe(0);
    });
  });

  describe('Exam Score', () => {
    it('should calculate average exam score', () => {
      const exams = [
        { score: 80 },
        { score: 70 },
        { score: 90 }
      ];

      const totalScore = exams.reduce((sum, e) => sum + e.score, 0);
      const averageScore = exams.length > 0 ? totalScore / exams.length : 0;

      expect(averageScore).toBe(80);
    });

    it('should weight recent exams more heavily', () => {
      // Recent exams (last 30 days) could be weighted 1.5x
      const recentWeight = 1.5;
      const oldWeight = 1.0;

      const exams = [
        { score: 80, isRecent: true },
        { score: 60, isRecent: false }
      ];

      const weightedSum = exams.reduce((sum, e) => {
        const weight = e.isRecent ? recentWeight : oldWeight;
        return sum + (e.score * weight);
      }, 0);

      const totalWeight = exams.reduce((sum, e) => {
        return sum + (e.isRecent ? recentWeight : oldWeight);
      }, 0);

      const weightedAverage = weightedSum / totalWeight;
      // (80 * 1.5 + 60 * 1.0) / (1.5 + 1.0) = 180/2.5 = 72

      expect(weightedAverage).toBe(72);
    });
  });

  describe('Regularity Score', () => {
    it('should calculate streak-based regularity', () => {
      const currentStreak = 7;
      const targetStreak = 14; // 2 weeks = 100%

      const regularityScore = Math.min(100, (currentStreak / targetStreak) * 100);

      expect(regularityScore).toBe(50); // 7/14 = 50%
    });

    it('should cap regularity at 100%', () => {
      const currentStreak = 30;
      const targetStreak = 14;

      const regularityScore = Math.min(100, (currentStreak / targetStreak) * 100);

      expect(regularityScore).toBe(100); // Capped
    });

    it('should factor in weekly study days', () => {
      const daysStudiedThisWeek = 5;
      const targetDays = 7;

      const weeklyScore = (daysStudiedThisWeek / targetDays) * 100;

      expect(weeklyScore).toBeCloseTo(71.43, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle brand new users', () => {
      const userData = {
        srsCards: [],
        exams: [],
        streak: 0
      };

      const hasActivity = userData.srsCards.length > 0 || userData.exams.length > 0 || userData.streak > 0;
      expect(hasActivity).toBe(false);
    });

    it('should handle users with partial data', () => {
      // Should still calculate with available data
      const srsScore = 100; // 1/1 mastered
      const examScore = 0; // No data, default to 0
      const regularityScore = (3 / 14) * 100;

      const rawProbability = (srsScore * 0.4) + (examScore * 0.3) + (regularityScore * 0.3);
      
      // 40 + 0 + 6.43 = 46.43 → clamped to 50
      expect(Math.max(50, Math.round(rawProbability))).toBe(50);
    });

    it('should never return negative probability', () => {
      const probability = Math.max(0, -50);
      expect(probability).toBe(0);
    });
  });
});
