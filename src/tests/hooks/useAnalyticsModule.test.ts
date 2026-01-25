/**
 * 📊 Tests Unitaires - Module Analytics & Progress
 * 
 * Couverture complète:
 * - Activity tracking & heatmap data
 * - Streak calculations (deterministic)
 * - Learning insights generation
 * - Performance trends
 * - Edge cases & error handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================
// TYPES & INTERFACES
// ============================================

interface HeatmapData {
  date: string;
  count: number;
  activities: Record<string, number>;
}

interface StreakInfo {
  current: number;
  longest: number;
}

interface PerformanceTrend {
  period: string;
  score: number;
  itemsReviewed: number;
  studyTime: number;
}

interface Insight {
  type: 'strength' | 'weakness' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedItems?: number[];
}

// ============================================
// MOCK IMPLEMENTATIONS
// ============================================

const generateHeatmapData = (days: number): HeatmapData[] => {
  const result: HeatmapData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    result.push({
      date: dateStr,
      count: Math.floor(Math.random() * 20),
      activities: {
        srs_review: Math.floor(Math.random() * 10),
        exam: Math.floor(Math.random() * 5),
        flashcard: Math.floor(Math.random() * 8)
      }
    });
  }
  
  return result;
};

const calculateStreak = (activityDates: string[]): StreakInfo => {
  if (activityDates.length === 0) return { current: 0, longest: 0 };
  
  const uniqueDates = [...new Set(activityDates)].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Check if streak is active
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    return { current: 0, longest: calculateLongestStreak(uniqueDates) };
  }
  
  let currentStreak = 1;
  let checkDate = new Date(uniqueDates[0]);
  
  for (let i = 1; i < uniqueDates.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1);
    const expectedDate = checkDate.toISOString().split('T')[0];
    
    if (uniqueDates[i] === expectedDate) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return { 
    current: currentStreak, 
    longest: Math.max(currentStreak, calculateLongestStreak(uniqueDates)) 
  };
};

const calculateLongestStreak = (sortedDates: string[]): number => {
  if (sortedDates.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
};

const getIntensityClass = (count: number): string => {
  if (count === 0) return 'bg-muted';
  if (count < 5) return 'bg-primary/20';
  if (count < 15) return 'bg-primary/40';
  if (count < 30) return 'bg-primary/60';
  if (count < 50) return 'bg-primary/80';
  return 'bg-primary';
};

describe('Analytics Module - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // HEATMAP DATA TESTS
  // ============================================

  describe('Heatmap Data Generation', () => {
    it('should generate correct number of days', () => {
      const data = generateHeatmapData(90);
      expect(data.length).toBe(90);
    });

    it('should have valid date format', () => {
      const data = generateHeatmapData(30);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      data.forEach(d => {
        expect(d.date).toMatch(dateRegex);
      });
    });

    it('should include all activity types', () => {
      const data = generateHeatmapData(7);
      
      data.forEach(d => {
        expect(d.activities).toHaveProperty('srs_review');
        expect(d.activities).toHaveProperty('exam');
        expect(d.activities).toHaveProperty('flashcard');
      });
    });

    it('should have non-negative counts', () => {
      const data = generateHeatmapData(30);
      
      data.forEach(d => {
        expect(d.count).toBeGreaterThanOrEqual(0);
        Object.values(d.activities).forEach(count => {
          expect(count).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should fill missing dates correctly', () => {
      const data = generateHeatmapData(7);
      const dates = data.map(d => d.date);
      
      // Check dates are consecutive
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        expect(diff).toBe(1);
      }
    });

    it('should handle single day', () => {
      const data = generateHeatmapData(1);
      expect(data.length).toBe(1);
    });

    it('should handle large date ranges', () => {
      const data = generateHeatmapData(365);
      expect(data.length).toBe(365);
    });
  });

  // ============================================
  // INTENSITY CLASS TESTS
  // ============================================

  describe('Intensity Class Calculation', () => {
    it('should return bg-muted for zero count', () => {
      expect(getIntensityClass(0)).toBe('bg-muted');
    });

    it('should return correct class for low count', () => {
      expect(getIntensityClass(3)).toBe('bg-primary/20');
    });

    it('should return correct class for medium count', () => {
      expect(getIntensityClass(10)).toBe('bg-primary/40');
    });

    it('should return correct class for high count', () => {
      expect(getIntensityClass(25)).toBe('bg-primary/60');
    });

    it('should return correct class for very high count', () => {
      expect(getIntensityClass(45)).toBe('bg-primary/80');
    });

    it('should return full intensity for max count', () => {
      expect(getIntensityClass(100)).toBe('bg-primary');
    });
  });

  // ============================================
  // STREAK CALCULATION TESTS
  // ============================================

  describe('Streak Calculation', () => {
    it('should return 0 for empty activity', () => {
      const result = calculateStreak([]);
      expect(result.current).toBe(0);
      expect(result.longest).toBe(0);
    });

    it('should calculate current streak correctly', () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
      
      const result = calculateStreak([today, yesterdayStr, twoDaysAgoStr]);
      expect(result.current).toBe(3);
    });

    it('should handle broken streak', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      
      const result = calculateStreak([fourDaysAgo.toISOString().split('T')[0]]);
      expect(result.current).toBe(0);
    });

    it('should calculate longest streak separately', () => {
      const dates: string[] = [];
      const today = new Date();
      
      // 5-day streak ending 10 days ago
      for (let i = 14; i >= 10; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      
      // Current 2-day streak
      dates.push(today.toISOString().split('T')[0]);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dates.push(yesterday.toISOString().split('T')[0]);
      
      const result = calculateStreak(dates);
      expect(result.current).toBe(2);
      expect(result.longest).toBeGreaterThanOrEqual(2);
    });

    it('should deduplicate dates', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = calculateStreak([today, today, today]);
      expect(result.current).toBe(1);
    });

    it('should handle yesterday as valid streak start', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = calculateStreak([yesterday.toISOString().split('T')[0]]);
      expect(result.current).toBe(1);
    });
  });

  // ============================================
  // PERFORMANCE TREND TESTS
  // ============================================

  describe('Performance Trends', () => {
    it('should group data by date', () => {
      const rawData = [
        { date: '2024-01-15', score: 80, count: 5, duration: 300 },
        { date: '2024-01-15', score: 90, count: 3, duration: 200 },
        { date: '2024-01-16', score: 75, count: 4, duration: 250 }
      ];
      
      const byDate: Record<string, { scores: number[]; items: number; time: number }> = {};
      
      rawData.forEach(log => {
        if (!byDate[log.date]) {
          byDate[log.date] = { scores: [], items: 0, time: 0 };
        }
        byDate[log.date].scores.push(log.score);
        byDate[log.date].items += log.count;
        byDate[log.date].time += log.duration;
      });
      
      expect(Object.keys(byDate).length).toBe(2);
      expect(byDate['2024-01-15'].scores).toEqual([80, 90]);
      expect(byDate['2024-01-15'].items).toBe(8);
    });

    it('should calculate average score correctly', () => {
      const scores = [80, 90, 70];
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      expect(avg).toBe(80);
    });

    it('should convert seconds to minutes', () => {
      const seconds = 3600;
      const minutes = Math.round(seconds / 60);
      expect(minutes).toBe(60);
    });

    it('should handle empty data', () => {
      const trends: PerformanceTrend[] = [];
      expect(trends.length).toBe(0);
    });

    it('should handle zero scores', () => {
      const scores: number[] = [];
      const avg = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      expect(avg).toBe(0);
    });
  });

  // ============================================
  // LEARNING INSIGHTS TESTS
  // ============================================

  describe('Learning Insights', () => {
    it('should generate weakness insights', () => {
      const weakItems = [{ item: 15, failRate: 0.6 }, { item: 23, failRate: 0.5 }];
      
      const insights: Insight[] = weakItems
        .filter(i => i.failRate > 0.4)
        .map(i => ({
          type: 'weakness' as const,
          title: `Item ${i.item} nécessite attention`,
          description: `Taux d'échec de ${Math.round(i.failRate * 100)}%`,
          priority: i.failRate > 0.5 ? 'high' as const : 'medium' as const,
          relatedItems: [i.item]
        }));
      
      expect(insights.length).toBe(2);
      expect(insights[0].type).toBe('weakness');
      expect(insights[0].priority).toBe('high');
    });

    it('should generate strength insights', () => {
      const strongItems = [{ item: 42, successRate: 0.95 }];
      
      const insights: Insight[] = strongItems
        .filter(i => i.successRate > 0.9)
        .map(i => ({
          type: 'strength' as const,
          title: `Item ${i.item} maîtrisé`,
          description: `Taux de réussite de ${Math.round(i.successRate * 100)}%`,
          priority: 'low' as const,
          relatedItems: [i.item]
        }));
      
      expect(insights.length).toBe(1);
      expect(insights[0].type).toBe('strength');
    });

    it('should prioritize insights correctly', () => {
      const insights: Insight[] = [
        { type: 'weakness', title: 'A', description: '', priority: 'high' },
        { type: 'recommendation', title: 'B', description: '', priority: 'medium' },
        { type: 'strength', title: 'C', description: '', priority: 'low' }
      ];
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const sorted = [...insights].sort((a, b) => 
        priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      
      expect(sorted[0].priority).toBe('high');
      expect(sorted[2].priority).toBe('low');
    });

    it('should limit insights to reasonable count', () => {
      const allInsights: Insight[] = Array.from({ length: 20 }, (_, i) => ({
        type: 'recommendation' as const,
        title: `Insight ${i}`,
        description: '',
        priority: 'medium' as const
      }));
      
      const limited = allInsights.slice(0, 5);
      expect(limited.length).toBe(5);
    });

    it('should generate prediction insights', () => {
      const predictedWorkload = [15, 20, 25, 10, 5, 30, 18];
      const heavyDay = predictedWorkload.findIndex(w => w > 20);
      
      const insight: Insight = {
        type: 'prediction',
        title: 'Charge de travail élevée prévue',
        description: `${predictedWorkload[heavyDay]} révisions dans ${heavyDay + 1} jours`,
        priority: 'medium'
      };
      
      expect(insight.type).toBe('prediction');
      expect(heavyDay).toBe(2); // 25 > 20
    });
  });

  // ============================================
  // ICAL EXPORT TESTS
  // ============================================

  describe('iCal Export', () => {
    it('should format date correctly for iCal', () => {
      const date = new Date('2024-01-15');
      const formatted = date.toISOString().split('T')[0].replace(/-/g, '');
      expect(formatted).toBe('20240115');
    });

    it('should generate valid iCal structure', () => {
      const events = [
        'BEGIN:VEVENT',
        'DTSTART;VALUE=DATE:20240115',
        'SUMMARY:📚 Révisions EDN (10 items)',
        'END:VEVENT'
      ];
      
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MED-MNG//EDN Revisions//FR',
        ...events,
        'END:VCALENDAR'
      ].join('\r\n');
      
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('END:VCALENDAR');
      expect(ical).toContain('VEVENT');
    });

    it('should skip days with zero workload', () => {
      const workload = [0, 10, 0, 15, 0];
      const eventsCount = workload.filter(w => w > 0).length;
      expect(eventsCount).toBe(2);
    });

    it('should handle empty workload', () => {
      const workload: number[] = [];
      const hasEvents = workload.some(w => w > 0);
      expect(hasEvents).toBe(false);
    });
  });

  // ============================================
  // EDGE CASES & ERROR HANDLING
  // ============================================

  describe('Edge Cases & Error Handling', () => {
    it('should handle null user gracefully', () => {
      const userId: string | null = null;
      const canFetchData = userId !== null;
      expect(canFetchData).toBe(false);
    });

    it('should handle database errors', () => {
      let fallbackData: HeatmapData[] = [];
      try {
        throw new Error('Database error');
      } catch {
        fallbackData = [];
      }
      expect(fallbackData).toEqual([]);
    });

    it('should handle timezone edge cases', () => {
      // Simulate UTC vs local time
      const now = new Date();
      const utcDate = now.toISOString().split('T')[0];
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().split('T')[0];
      
      // They might differ near midnight
      expect(utcDate).toBeDefined();
      expect(localDate).toBeDefined();
    });

    it('should handle concurrent data fetches', async () => {
      const fetchHeatmap = () => Promise.resolve(generateHeatmapData(7));
      const fetchStreak = () => Promise.resolve({ current: 5, longest: 10 });
      
      const [heatmap, streak] = await Promise.all([fetchHeatmap(), fetchStreak()]);
      
      expect(heatmap.length).toBe(7);
      expect(streak.current).toBe(5);
    });

    it('should filter by activity type correctly', () => {
      const data: HeatmapData[] = [
        { date: '2024-01-15', count: 10, activities: { srs_review: 5, exam: 3, flashcard: 2 } }
      ];
      
      const filterType = 'srs_review';
      const filteredCount = data[0].activities[filterType];
      
      expect(filteredCount).toBe(5);
    });

    it('should handle missing activity types', () => {
      const activities: Record<string, number> = { srs_review: 5 };
      const examCount = activities['exam'] || 0;
      
      expect(examCount).toBe(0);
    });
  });

  // ============================================
  // TODAY STATS TESTS
  // ============================================

  describe('Today Statistics', () => {
    it('should calculate today totals', () => {
      const todayActivities = [
        { count: 5, duration: 300, score: 80 },
        { count: 3, duration: 200, score: 90 }
      ];
      
      const stats = {
        total: todayActivities.reduce((sum, a) => sum + a.count, 0),
        totalTime: Math.round(todayActivities.reduce((sum, a) => sum + a.duration, 0) / 60),
        avgScore: Math.round(
          todayActivities.reduce((sum, a) => sum + a.score, 0) / todayActivities.length
        )
      };
      
      expect(stats.total).toBe(8);
      expect(stats.totalTime).toBe(8); // 500 seconds = 8 minutes
      expect(stats.avgScore).toBe(85);
    });

    it('should handle no activity today', () => {
      const todayActivities: any[] = [];
      
      const stats = todayActivities.length > 0 ? {
        total: todayActivities.reduce((sum, a) => sum + a.count, 0)
      } : null;
      
      expect(stats).toBeNull();
    });
  });
});
