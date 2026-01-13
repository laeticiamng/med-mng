import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoPlayMusic: boolean;
  showHints: boolean;
  compactView: boolean;
}

interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  completedItems: string[];
  favoriteItems: string[];
}

interface UserState {
  preferences: UserPreferences;
  progress: UserProgress;
  isOnboarded: boolean;
  
  // Actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  addCompletedItem: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  setOnboarded: (value: boolean) => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'fr',
  notificationsEnabled: true,
  soundEnabled: true,
  autoPlayMusic: false,
  showHints: true,
  compactView: false,
};

const defaultProgress: UserProgress = {
  totalXP: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  completedItems: [],
  favoriteItems: [],
};

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      progress: defaultProgress,
      isOnboarded: false,

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },

      addXP: (amount) => {
        set((state) => {
          const newTotalXP = state.progress.totalXP + amount;
          const newLevel = calculateLevel(newTotalXP);
          return {
            progress: {
              ...state.progress,
              totalXP: newTotalXP,
              level: newLevel,
            },
          };
        });
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastStudyDate, streak } = get().progress;
        
        if (lastStudyDate === today) {
          return; // Already studied today
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const newStreak = lastStudyDate === yesterdayStr ? streak + 1 : 1;
        
        set((state) => ({
          progress: {
            ...state.progress,
            streak: newStreak,
            lastStudyDate: today,
          },
        }));
      },

      addCompletedItem: (itemId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            completedItems: state.progress.completedItems.includes(itemId)
              ? state.progress.completedItems
              : [...state.progress.completedItems, itemId],
          },
        }));
      },

      toggleFavorite: (itemId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            favoriteItems: state.progress.favoriteItems.includes(itemId)
              ? state.progress.favoriteItems.filter((id) => id !== itemId)
              : [...state.progress.favoriteItems, itemId],
          },
        }));
      },

      setOnboarded: (value) => set({ isOnboarded: value }),

      reset: () =>
        set({
          preferences: defaultPreferences,
          progress: defaultProgress,
          isOnboarded: false,
        }),
    }),
    {
      name: 'medmng-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
