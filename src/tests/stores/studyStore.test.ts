/**
 * Tests complets pour studyStore
 *
 * Verifie la gestion des sessions d'etude.
 * Critique pour le suivi de progression des etudiants en medecine.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useStudyStore } from '@/stores/studyStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('studyStore', () => {
  beforeEach(() => {
    act(() => {
      useStudyStore.getState().reset();
    });
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Etat initial', () => {
    it('should have null currentSession initially', () => {
      const { result } = renderHook(() => useStudyStore());
      expect(result.current.currentSession).toBeNull();
    });

    it('should have empty sessions initially', () => {
      const { result } = renderHook(() => useStudyStore());
      expect(result.current.sessions).toEqual([]);
    });

    it('should have default daily goal', () => {
      const { result } = renderHook(() => useStudyStore());
      expect(result.current.dailyGoal).toEqual({
        targetMinutes: 60,
        completedMinutes: 0,
        targetItems: 5,
        completedItems: 0,
      });
    });

    it('should have empty weekly stats', () => {
      const { result } = renderHook(() => useStudyStore());
      expect(result.current.weeklyStats).toEqual({});
    });
  });

  describe('startSession', () => {
    it('should create a new session', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
      });

      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.itemId).toBe('item-1');
      expect(result.current.currentSession?.type).toBe('reading');
    });

    it('should set start time correctly', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'quiz');
      });

      expect(result.current.currentSession?.startTime).toBe('2024-01-15T10:00:00.000Z');
    });

    it('should have null endTime when starting', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'flashcard');
      });

      expect(result.current.currentSession?.endTime).toBeNull();
    });

    it('should have 0 duration when starting', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'music');
      });

      expect(result.current.currentSession?.duration).toBe(0);
    });

    it('should support all session types', () => {
      const { result } = renderHook(() => useStudyStore());
      const types = ['reading', 'quiz', 'flashcard', 'music'] as const;

      types.forEach((type, i) => {
        act(() => {
          result.current.startSession(`item-${i}`, type);
        });
        expect(result.current.currentSession?.type).toBe(type);
        act(() => {
          result.current.endSession();
        });
      });
    });
  });

  describe('endSession', () => {
    it('should do nothing if no session is active', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.endSession();
      });

      expect(result.current.sessions).toHaveLength(0);
    });

    it('should calculate duration correctly', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
      });

      act(() => {
        vi.advanceTimersByTime(300000); // 5 minutes = 300 seconds
        result.current.endSession();
      });

      expect(result.current.sessions[0].duration).toBe(300);
    });

    it('should add session to sessions array', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'quiz');
        vi.advanceTimersByTime(60000);
        result.current.endSession();
      });

      expect(result.current.sessions).toHaveLength(1);
    });

    it('should clear currentSession', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'flashcard');
        result.current.endSession();
      });

      expect(result.current.currentSession).toBeNull();
    });

    it('should include score if provided', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'quiz');
        result.current.endSession(85);
      });

      expect(result.current.sessions[0].score).toBe(85);
    });

    it('should update daily goal completed minutes', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(600000); // 10 minutes = 600 seconds
        result.current.endSession();
      });

      expect(result.current.dailyGoal.completedMinutes).toBe(10);
    });

    it('should increment daily goal completed items', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        result.current.endSession();
      });

      expect(result.current.dailyGoal.completedItems).toBe(1);
    });

    it('should update weekly stats', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(120000); // 2 minutes
        result.current.endSession();
      });

      expect(result.current.weeklyStats['2024-01-15']).toEqual({
        minutes: 2,
        items: 1,
      });
    });

    it('should accumulate weekly stats for same day', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));

        // First session
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(120000); // 2 minutes
        result.current.endSession();

        // Second session same day
        result.current.startSession('item-2', 'quiz');
        vi.advanceTimersByTime(180000); // 3 minutes
        result.current.endSession();
      });

      expect(result.current.weeklyStats['2024-01-15']).toEqual({
        minutes: 5,
        items: 2,
      });
    });
  });

  describe('updateDailyGoal', () => {
    it('should update target minutes', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.updateDailyGoal({ targetMinutes: 90 });
      });

      expect(result.current.dailyGoal.targetMinutes).toBe(90);
    });

    it('should update target items', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.updateDailyGoal({ targetItems: 10 });
      });

      expect(result.current.dailyGoal.targetItems).toBe(10);
    });

    it('should preserve other goal values', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(60000);
        result.current.endSession();
      });

      const beforeMinutes = result.current.dailyGoal.completedMinutes;

      act(() => {
        result.current.updateDailyGoal({ targetMinutes: 120 });
      });

      expect(result.current.dailyGoal.completedMinutes).toBe(beforeMinutes);
    });

    it('should update multiple values at once', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.updateDailyGoal({
          targetMinutes: 45,
          targetItems: 8,
        });
      });

      expect(result.current.dailyGoal.targetMinutes).toBe(45);
      expect(result.current.dailyGoal.targetItems).toBe(8);
    });
  });

  describe('getSessionsByDate', () => {
    it('should return empty array for date with no sessions', () => {
      const { result } = renderHook(() => useStudyStore());

      const sessions = result.current.getSessionsByDate('2024-01-15');
      expect(sessions).toEqual([]);
    });

    it('should return sessions for specific date', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        // Session on Jan 15
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
        result.current.endSession();

        // Session on Jan 16
        vi.setSystemTime(new Date('2024-01-16T10:00:00Z'));
        result.current.startSession('item-2', 'quiz');
        result.current.endSession();

        // Another session on Jan 15
        vi.setSystemTime(new Date('2024-01-15T14:00:00Z'));
        result.current.startSession('item-3', 'flashcard');
        result.current.endSession();
      });

      const jan15Sessions = result.current.getSessionsByDate('2024-01-15');
      expect(jan15Sessions).toHaveLength(2);

      const jan16Sessions = result.current.getSessionsByDate('2024-01-16');
      expect(jan16Sessions).toHaveLength(1);
    });

    it('should match partial date strings', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
        result.current.endSession();
      });

      // Should match with full date
      expect(result.current.getSessionsByDate('2024-01-15')).toHaveLength(1);

      // Should match with partial date (year-month)
      expect(result.current.getSessionsByDate('2024-01')).toHaveLength(1);
    });
  });

  describe('getTotalStudyTime', () => {
    it('should return 0 with no sessions', () => {
      const { result } = renderHook(() => useStudyStore());

      expect(result.current.getTotalStudyTime()).toBe(0);
    });

    it('should sum all session durations', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        // First session: 5 minutes
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(300000);
        result.current.endSession();

        // Second session: 10 minutes
        result.current.startSession('item-2', 'quiz');
        vi.advanceTimersByTime(600000);
        result.current.endSession();

        // Third session: 3 minutes
        result.current.startSession('item-3', 'flashcard');
        vi.advanceTimersByTime(180000);
        result.current.endSession();
      });

      expect(result.current.getTotalStudyTime()).toBe(1080); // 300 + 600 + 180
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        // Modify state
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(600000);
        result.current.endSession();

        result.current.updateDailyGoal({ targetMinutes: 120 });
      });

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.dailyGoal.targetMinutes).toBe(120);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessions).toEqual([]);
      expect(result.current.dailyGoal).toEqual({
        targetMinutes: 60,
        completedMinutes: 0,
        targetItems: 5,
        completedItems: 0,
      });
      expect(result.current.weeklyStats).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short sessions (< 1 second)', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(500); // 0.5 seconds
        result.current.endSession();
      });

      expect(result.current.sessions[0].duration).toBe(0);
    });

    it('should handle very long sessions', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(7200000); // 2 hours
        result.current.endSession();
      });

      expect(result.current.sessions[0].duration).toBe(7200);
    });

    it('should handle multiple concurrent startSession calls (last wins)', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        result.current.startSession('item-2', 'quiz');
      });

      expect(result.current.currentSession?.itemId).toBe('item-2');
      expect(result.current.currentSession?.type).toBe('quiz');
    });

    it('should handle session across midnight', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T23:55:00Z'));
        result.current.startSession('item-1', 'reading');
      });

      act(() => {
        vi.advanceTimersByTime(600000); // 10 minutes
        result.current.endSession();
      });

      // Session duration should still be correct
      expect(result.current.sessions[0].duration).toBe(600);

      // Weekly stats should be for end date
      expect(result.current.weeklyStats['2024-01-16']).toBeDefined();
    });

    it('should handle many sessions', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.startSession(`item-${i}`, 'reading');
          vi.advanceTimersByTime(60000); // 1 minute each
          result.current.endSession();
        }
      });

      expect(result.current.sessions).toHaveLength(100);
      expect(result.current.getTotalStudyTime()).toBe(6000); // 100 * 60 seconds
    });
  });

  describe('Persistence', () => {
    it('should persist sessions to localStorage', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(60000);
        result.current.endSession();
      });

      const stored = localStorageMock.getItem('medmng-study');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.sessions).toHaveLength(1);
    });

    it('should persist daily goal to localStorage', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        result.current.updateDailyGoal({ targetMinutes: 90 });
      });

      const stored = localStorageMock.getItem('medmng-study');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.dailyGoal.targetMinutes).toBe(90);
    });

    it('should persist weekly stats to localStorage', () => {
      const { result } = renderHook(() => useStudyStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.startSession('item-1', 'reading');
        vi.advanceTimersByTime(120000);
        result.current.endSession();
      });

      const stored = localStorageMock.getItem('medmng-study');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.weeklyStats['2024-01-15']).toBeDefined();
    });
  });
});
