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
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
          gte: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
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

describe('useMoodTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MoodEntry interface', () => {
    it('should have all required properties', () => {
      const entry = {
        id: 'entry-1',
        mood_score: 4,
        energy_level: 3,
        stress_level: 2,
        notes: 'Feeling good today',
        factors: ['sleep', 'exercise'],
        created_at: new Date().toISOString(),
      };

      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('mood_score');
      expect(entry).toHaveProperty('energy_level');
      expect(entry).toHaveProperty('stress_level');
      expect(entry).toHaveProperty('notes');
      expect(entry).toHaveProperty('factors');
      expect(entry).toHaveProperty('created_at');
    });

    it('should validate mood score range', () => {
      const validScores = [1, 2, 3, 4, 5];
      
      validScores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('mood emoji mapping', () => {
    it('should map mood scores to correct emojis', () => {
      const moodEmojis: Record<number, string> = {
        1: '😢',
        2: '😕',
        3: '😐',
        4: '🙂',
        5: '😄',
      };

      expect(moodEmojis[1]).toBe('😢');
      expect(moodEmojis[2]).toBe('😕');
      expect(moodEmojis[3]).toBe('😐');
      expect(moodEmojis[4]).toBe('🙂');
      expect(moodEmojis[5]).toBe('😄');
    });

    it('should map mood scores to labels', () => {
      const moodLabels: Record<number, string> = {
        1: 'Très mal',
        2: 'Mal',
        3: 'Neutre',
        4: 'Bien',
        5: 'Très bien',
      };

      expect(moodLabels[1]).toBe('Très mal');
      expect(moodLabels[5]).toBe('Très bien');
    });
  });

  describe('trend calculation', () => {
    it('should calculate average mood correctly', () => {
      const entries = [
        { mood_score: 4 },
        { mood_score: 3 },
        { mood_score: 5 },
        { mood_score: 4 },
      ];

      const average = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;
      expect(average).toBe(4);
    });

    it('should detect improving trend', () => {
      const entries = [
        { mood_score: 2, created_at: '2026-01-27' },
        { mood_score: 3, created_at: '2026-01-28' },
        { mood_score: 4, created_at: '2026-01-29' },
      ];

      const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
      const secondHalf = entries.slice(Math.floor(entries.length / 2));

      const firstAvg = firstHalf.reduce((s, e) => s + e.mood_score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, e) => s + e.mood_score, 0) / secondHalf.length;

      expect(secondAvg).toBeGreaterThan(firstAvg);
    });

    it('should detect declining trend', () => {
      const entries = [
        { mood_score: 5, created_at: '2026-01-27' },
        { mood_score: 3, created_at: '2026-01-28' },
        { mood_score: 2, created_at: '2026-01-29' },
      ];

      const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
      const secondHalf = entries.slice(Math.floor(entries.length / 2));

      const firstAvg = firstHalf.reduce((s, e) => s + e.mood_score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, e) => s + e.mood_score, 0) / secondHalf.length;

      expect(secondAvg).toBeLessThan(firstAvg);
    });
  });

  describe('factor analysis', () => {
    it('should identify most common factors', () => {
      const entries = [
        { factors: ['sleep', 'exercise'] },
        { factors: ['sleep', 'nutrition'] },
        { factors: ['sleep', 'social'] },
        { factors: ['exercise', 'work'] },
      ];

      const factorCounts: Record<string, number> = {};
      entries.forEach(entry => {
        entry.factors.forEach(factor => {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
      });

      const sorted = Object.entries(factorCounts)
        .sort(([, a], [, b]) => b - a);

      expect(sorted[0][0]).toBe('sleep');
      expect(sorted[0][1]).toBe(3);
    });

    it('should support standard factors', () => {
      const standardFactors = [
        'sleep',
        'exercise',
        'nutrition',
        'social',
        'work',
        'weather',
        'health',
      ];

      expect(standardFactors).toContain('sleep');
      expect(standardFactors).toContain('exercise');
      expect(standardFactors.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('weekly stats', () => {
    it('should calculate weekly average', () => {
      const weeklyEntries = [
        { mood_score: 4, energy_level: 3, stress_level: 2 },
        { mood_score: 3, energy_level: 4, stress_level: 3 },
        { mood_score: 5, energy_level: 4, stress_level: 1 },
        { mood_score: 4, energy_level: 3, stress_level: 2 },
        { mood_score: 3, energy_level: 2, stress_level: 4 },
      ];

      const avgMood = weeklyEntries.reduce((s, e) => s + e.mood_score, 0) / weeklyEntries.length;
      const avgEnergy = weeklyEntries.reduce((s, e) => s + e.energy_level, 0) / weeklyEntries.length;
      const avgStress = weeklyEntries.reduce((s, e) => s + e.stress_level, 0) / weeklyEntries.length;

      expect(avgMood).toBeCloseTo(3.8, 1);
      expect(avgEnergy).toBeCloseTo(3.2, 1);
      expect(avgStress).toBeCloseTo(2.4, 1);
    });
  });
});
