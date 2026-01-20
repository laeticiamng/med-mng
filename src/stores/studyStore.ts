import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StudySession {
  id: string;
  itemId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  type: 'reading' | 'quiz' | 'flashcard' | 'music';
  score?: number;
}

interface DailyGoal {
  targetMinutes: number;
  completedMinutes: number;
  targetItems: number;
  completedItems: number;
}

interface StudyState {
  currentSession: StudySession | null;
  sessions: StudySession[];
  dailyGoal: DailyGoal;
  weeklyStats: {
    [day: string]: { minutes: number; items: number };
  };
  
  // Actions
  startSession: (itemId: string, type: StudySession['type']) => void;
  endSession: (score?: number) => void;
  updateDailyGoal: (goal: Partial<DailyGoal>) => void;
  getSessionsByDate: (date: string) => StudySession[];
  getTotalStudyTime: () => number;
  reset: () => void;
}

let sessionCounter = 0;
const generateId = () => `session-${Date.now()}-${(++sessionCounter).toString(36).padStart(6, '0')}`;

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      dailyGoal: {
        targetMinutes: 60,
        completedMinutes: 0,
        targetItems: 5,
        completedItems: 0,
      },
      weeklyStats: {},

      startSession: (itemId, type) => {
        const session: StudySession = {
          id: generateId(),
          itemId,
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 0,
          type,
        };
        set({ currentSession: session });
      },

      endSession: (score) => {
        const { currentSession, sessions, dailyGoal, weeklyStats } = get();
        if (!currentSession) return;

        const endTime = new Date().toISOString();
        const duration = Math.floor(
          (new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000
        );
        
        const completedSession: StudySession = {
          ...currentSession,
          endTime,
          duration,
          score,
        };

        const today = new Date().toISOString().split('T')[0];
        const durationMinutes = Math.floor(duration / 60);

        set({
          currentSession: null,
          sessions: [...sessions, completedSession],
          dailyGoal: {
            ...dailyGoal,
            completedMinutes: dailyGoal.completedMinutes + durationMinutes,
            completedItems: dailyGoal.completedItems + 1,
          },
          weeklyStats: {
            ...weeklyStats,
            [today]: {
              minutes: (weeklyStats[today]?.minutes || 0) + durationMinutes,
              items: (weeklyStats[today]?.items || 0) + 1,
            },
          },
        });
      },

      updateDailyGoal: (goal) => {
        set((state) => ({
          dailyGoal: { ...state.dailyGoal, ...goal },
        }));
      },

      getSessionsByDate: (date) => {
        return get().sessions.filter((s) => s.startTime.startsWith(date));
      },

      getTotalStudyTime: () => {
        return get().sessions.reduce((total, s) => total + s.duration, 0);
      },

      reset: () =>
        set({
          currentSession: null,
          sessions: [],
          dailyGoal: {
            targetMinutes: 60,
            completedMinutes: 0,
            targetItems: 5,
            completedItems: 0,
          },
          weeklyStats: {},
        }),
    }),
    {
      name: 'medmng-study',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
