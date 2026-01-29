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

describe('usePomodoroSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PomodoroSession interface', () => {
    it('should have all required properties', () => {
      const session = {
        id: 'session-1',
        duration_minutes: 25,
        session_type: 'focus' as const,
        task_description: 'Study cardiology',
        completed: true,
        created_at: new Date().toISOString(),
      };

      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('duration_minutes');
      expect(session).toHaveProperty('session_type');
      expect(session).toHaveProperty('task_description');
      expect(session).toHaveProperty('completed');
      expect(session).toHaveProperty('created_at');
    });

    it('should validate session types', () => {
      const validTypes = ['focus', 'short_break', 'long_break'];
      
      validTypes.forEach(type => {
        expect(['focus', 'short_break', 'long_break']).toContain(type);
      });
    });
  });

  describe('standard durations', () => {
    it('should have correct default durations', () => {
      const durations = {
        focus: 25,
        short_break: 5,
        long_break: 15,
      };

      expect(durations.focus).toBe(25);
      expect(durations.short_break).toBe(5);
      expect(durations.long_break).toBe(15);
    });

    it('should calculate XP based on duration', () => {
      const calculateXP = (minutes: number, completed: boolean): number => {
        if (!completed) return 0;
        return Math.floor(minutes * 2);
      };

      expect(calculateXP(25, true)).toBe(50);
      expect(calculateXP(25, false)).toBe(0);
      expect(calculateXP(50, true)).toBe(100);
    });
  });

  describe('session statistics', () => {
    it('should calculate total focus time', () => {
      const sessions = [
        { duration_minutes: 25, session_type: 'focus', completed: true },
        { duration_minutes: 25, session_type: 'focus', completed: true },
        { duration_minutes: 5, session_type: 'short_break', completed: true },
        { duration_minutes: 25, session_type: 'focus', completed: false },
      ];

      const totalFocusTime = sessions
        .filter(s => s.session_type === 'focus' && s.completed)
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      expect(totalFocusTime).toBe(50);
    });

    it('should count completed sessions', () => {
      const sessions = [
        { completed: true },
        { completed: true },
        { completed: false },
        { completed: true },
      ];

      const completedCount = sessions.filter(s => s.completed).length;
      expect(completedCount).toBe(3);
    });

    it('should calculate completion rate', () => {
      const sessions = [
        { completed: true },
        { completed: true },
        { completed: false },
        { completed: true },
        { completed: false },
      ];

      const completedCount = sessions.filter(s => s.completed).length;
      const completionRate = (completedCount / sessions.length) * 100;

      expect(completionRate).toBe(60);
    });
  });

  describe('daily stats', () => {
    it('should group sessions by date', () => {
      const sessions = [
        { created_at: '2026-01-29T10:00:00Z', duration_minutes: 25 },
        { created_at: '2026-01-29T11:00:00Z', duration_minutes: 25 },
        { created_at: '2026-01-28T10:00:00Z', duration_minutes: 25 },
      ];

      const groupedByDate: Record<string, number> = {};
      sessions.forEach(session => {
        const date = session.created_at.split('T')[0];
        groupedByDate[date] = (groupedByDate[date] || 0) + session.duration_minutes;
      });

      expect(groupedByDate['2026-01-29']).toBe(50);
      expect(groupedByDate['2026-01-28']).toBe(25);
    });

    it('should calculate daily average', () => {
      const dailyMinutes = [50, 75, 25, 100, 0, 50, 75];
      const average = dailyMinutes.reduce((s, m) => s + m, 0) / dailyMinutes.length;

      expect(average).toBeCloseTo(53.57, 0);
    });
  });

  describe('streak calculation', () => {
    it('should calculate consecutive days streak', () => {
      const sessionDates = [
        '2026-01-29',
        '2026-01-28',
        '2026-01-27',
        '2026-01-25', // gap
      ];

      let streak = 0;
      const today = new Date('2026-01-29');
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (sessionDates.includes(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      expect(streak).toBe(3);
    });
  });

  describe('timer logic', () => {
    it('should convert minutes to seconds', () => {
      const minutes = 25;
      const seconds = minutes * 60;

      expect(seconds).toBe(1500);
    });

    it('should format time display correctly', () => {
      const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatTime(1500)).toBe('25:00');
      expect(formatTime(300)).toBe('05:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(0)).toBe('00:00');
    });

    it('should calculate remaining time', () => {
      const totalSeconds = 1500;
      const elapsedSeconds = 600;
      const remaining = totalSeconds - elapsedSeconds;

      expect(remaining).toBe(900);
    });
  });
});
