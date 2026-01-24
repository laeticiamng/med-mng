/**
 * Tests complets pour userStore
 *
 * Verifie la gestion des preferences et progression utilisateur.
 * Important pour la conformite RGPD (donnees utilisateur).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUserStore } from '@/stores/userStore';

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

describe('userStore', () => {
  beforeEach(() => {
    act(() => {
      useUserStore.getState().reset();
    });
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Etat initial', () => {
    it('should have default preferences', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.preferences).toEqual({
        theme: 'system',
        language: 'fr',
        notificationsEnabled: true,
        soundEnabled: true,
        autoPlayMusic: false,
        showHints: true,
        compactView: false,
      });
    });

    it('should have default progress', () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.progress).toEqual({
        totalXP: 0,
        level: 1,
        streak: 0,
        lastStudyDate: null,
        completedItems: [],
        favoriteItems: [],
      });
    });

    it('should not be onboarded initially', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe('updatePreferences', () => {
    it('should update a single preference', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      expect(result.current.preferences.theme).toBe('dark');
      // Other preferences unchanged
      expect(result.current.preferences.language).toBe('fr');
    });

    it('should update multiple preferences', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updatePreferences({
          theme: 'light',
          language: 'en',
          soundEnabled: false,
        });
      });

      expect(result.current.preferences.theme).toBe('light');
      expect(result.current.preferences.language).toBe('en');
      expect(result.current.preferences.soundEnabled).toBe(false);
    });

    it('should preserve existing preferences when updating', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updatePreferences({ compactView: true });
      });

      act(() => {
        result.current.updatePreferences({ showHints: false });
      });

      expect(result.current.preferences.compactView).toBe(true);
      expect(result.current.preferences.showHints).toBe(false);
    });
  });

  describe('addXP', () => {
    it('should add XP to total', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(50);
      });

      expect(result.current.progress.totalXP).toBe(50);
    });

    it('should accumulate XP', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(50);
        result.current.addXP(30);
        result.current.addXP(20);
      });

      expect(result.current.progress.totalXP).toBe(100);
    });

    it('should calculate level based on XP', () => {
      const { result } = renderHook(() => useUserStore());

      // Level formula: floor(sqrt(xp/100)) + 1
      // 0 XP -> level 1
      expect(result.current.progress.level).toBe(1);

      // 100 XP -> sqrt(1) + 1 = 2
      act(() => {
        result.current.addXP(100);
      });
      expect(result.current.progress.level).toBe(2);

      // 400 XP -> sqrt(4) + 1 = 3
      act(() => {
        result.current.addXP(300);
      });
      expect(result.current.progress.level).toBe(3);

      // 900 XP -> sqrt(9) + 1 = 4
      act(() => {
        result.current.addXP(500);
      });
      expect(result.current.progress.level).toBe(4);
    });

    it('should handle large XP amounts', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(10000);
      });

      expect(result.current.progress.totalXP).toBe(10000);
      expect(result.current.progress.level).toBe(11); // sqrt(100) + 1
    });
  });

  describe('updateStreak', () => {
    it('should start streak at 1 on first study', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.updateStreak();
      });

      expect(result.current.progress.streak).toBe(1);
      expect(result.current.progress.lastStudyDate).toBe('2024-01-15');
    });

    it('should increment streak for consecutive days', () => {
      const { result } = renderHook(() => useUserStore());

      // Day 1
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1);

      // Day 2
      act(() => {
        vi.setSystemTime(new Date('2024-01-16T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(2);

      // Day 3
      act(() => {
        vi.setSystemTime(new Date('2024-01-17T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(3);
    });

    it('should reset streak if day is skipped', () => {
      const { result } = renderHook(() => useUserStore());

      // Day 1
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1);

      // Skip Day 2, study Day 3
      act(() => {
        vi.setSystemTime(new Date('2024-01-17T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1); // Reset to 1
    });

    it('should not change streak if already studied today', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1);

      // Same day, later
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T18:00:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1); // Still 1
    });

    it('should handle timezone edge cases', () => {
      const { result } = renderHook(() => useUserStore());

      // Study late night
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T23:59:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(1);

      // Study early next morning
      act(() => {
        vi.setSystemTime(new Date('2024-01-16T00:01:00Z'));
        result.current.updateStreak();
      });
      expect(result.current.progress.streak).toBe(2);
    });
  });

  describe('addCompletedItem', () => {
    it('should add item to completedItems', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addCompletedItem('item-1');
      });

      expect(result.current.progress.completedItems).toContain('item-1');
    });

    it('should not add duplicate items', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addCompletedItem('item-1');
        result.current.addCompletedItem('item-1');
        result.current.addCompletedItem('item-1');
      });

      expect(result.current.progress.completedItems).toEqual(['item-1']);
    });

    it('should handle multiple different items', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addCompletedItem('item-1');
        result.current.addCompletedItem('item-2');
        result.current.addCompletedItem('item-3');
      });

      expect(result.current.progress.completedItems).toEqual(['item-1', 'item-2', 'item-3']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add item to favorites', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleFavorite('item-1');
      });

      expect(result.current.progress.favoriteItems).toContain('item-1');
    });

    it('should remove item from favorites if already exists', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleFavorite('item-1');
      });
      expect(result.current.progress.favoriteItems).toContain('item-1');

      act(() => {
        result.current.toggleFavorite('item-1');
      });
      expect(result.current.progress.favoriteItems).not.toContain('item-1');
    });

    it('should toggle multiple times correctly', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleFavorite('item-1');
      });
      expect(result.current.progress.favoriteItems).toHaveLength(1);

      act(() => {
        result.current.toggleFavorite('item-1');
      });
      expect(result.current.progress.favoriteItems).toHaveLength(0);

      act(() => {
        result.current.toggleFavorite('item-1');
      });
      expect(result.current.progress.favoriteItems).toHaveLength(1);
    });

    it('should handle multiple favorites', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleFavorite('item-1');
        result.current.toggleFavorite('item-2');
        result.current.toggleFavorite('item-3');
      });

      expect(result.current.progress.favoriteItems).toEqual(['item-1', 'item-2', 'item-3']);

      act(() => {
        result.current.toggleFavorite('item-2');
      });

      expect(result.current.progress.favoriteItems).toEqual(['item-1', 'item-3']);
    });
  });

  describe('setOnboarded', () => {
    it('should set onboarded to true', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setOnboarded(true);
      });

      expect(result.current.isOnboarded).toBe(true);
    });

    it('should set onboarded to false', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setOnboarded(true);
      });

      act(() => {
        result.current.setOnboarded(false);
      });

      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => useUserStore());

      // Modify state
      act(() => {
        result.current.updatePreferences({ theme: 'dark', language: 'en' });
        result.current.addXP(500);
        result.current.addCompletedItem('item-1');
        result.current.toggleFavorite('item-2');
        result.current.setOnboarded(true);
      });

      // Verify modified
      expect(result.current.preferences.theme).toBe('dark');
      expect(result.current.progress.totalXP).toBe(500);
      expect(result.current.isOnboarded).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify reset
      expect(result.current.preferences.theme).toBe('system');
      expect(result.current.preferences.language).toBe('fr');
      expect(result.current.progress.totalXP).toBe(0);
      expect(result.current.progress.completedItems).toEqual([]);
      expect(result.current.progress.favoriteItems).toEqual([]);
      expect(result.current.isOnboarded).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist preferences to localStorage', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      const stored = localStorageMock.getItem('medmng-user');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.preferences.theme).toBe('dark');
    });

    it('should persist progress to localStorage', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(100);
        result.current.addCompletedItem('item-1');
      });

      const stored = localStorageMock.getItem('medmng-user');
      const parsed = JSON.parse(stored!);

      expect(parsed.state.progress.totalXP).toBe(100);
      expect(parsed.state.progress.completedItems).toContain('item-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty item IDs', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addCompletedItem('');
      });

      expect(result.current.progress.completedItems).toContain('');
    });

    it('should handle special characters in item IDs', () => {
      const { result } = renderHook(() => useUserStore());
      const specialId = 'item-!@#$%^&*()_+-=[]{}|;:\'",.<>?/';

      act(() => {
        result.current.addCompletedItem(specialId);
      });

      expect(result.current.progress.completedItems).toContain(specialId);
    });

    it('should handle very long item IDs', () => {
      const { result } = renderHook(() => useUserStore());
      const longId = 'a'.repeat(1000);

      act(() => {
        result.current.addCompletedItem(longId);
      });

      expect(result.current.progress.completedItems).toContain(longId);
    });

    it('should handle negative XP (should not happen but be safe)', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(-50);
      });

      // XP can go negative (edge case to be handled at caller level)
      expect(result.current.progress.totalXP).toBe(-50);
    });

    it('should handle very large XP values', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addXP(Number.MAX_SAFE_INTEGER);
      });

      expect(result.current.progress.totalXP).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
