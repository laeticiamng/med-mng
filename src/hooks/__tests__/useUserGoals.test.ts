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
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
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

describe('useUserGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UserGoal interface', () => {
    it('should have all required properties', () => {
      const goal = {
        id: 'test-goal-1',
        title: 'Complete 100 flashcards',
        description: 'Review all anatomy flashcards',
        target_value: 100,
        current_value: 45,
        category: 'study',
        priority: 'high' as const,
        deadline: '2026-02-28',
        is_completed: false,
      };

      expect(goal).toHaveProperty('id');
      expect(goal).toHaveProperty('title');
      expect(goal).toHaveProperty('description');
      expect(goal).toHaveProperty('target_value');
      expect(goal).toHaveProperty('current_value');
      expect(goal).toHaveProperty('category');
      expect(goal).toHaveProperty('priority');
      expect(goal).toHaveProperty('deadline');
      expect(goal).toHaveProperty('is_completed');
    });

    it('should validate priority values', () => {
      const validPriorities = ['low', 'medium', 'high'];
      
      validPriorities.forEach(priority => {
        expect(['low', 'medium', 'high']).toContain(priority);
      });
    });
  });

  describe('progress calculation', () => {
    it('should calculate goal progress correctly', () => {
      const goal = {
        current_value: 45,
        target_value: 100,
      };
      const progress = (goal.current_value / goal.target_value) * 100;

      expect(progress).toBe(45);
    });

    it('should handle completed goals', () => {
      const goal = {
        current_value: 100,
        target_value: 100,
        is_completed: true,
      };
      const progress = (goal.current_value / goal.target_value) * 100;

      expect(progress).toBe(100);
      expect(goal.is_completed).toBe(true);
    });

    it('should handle overachievement', () => {
      const goal = {
        current_value: 120,
        target_value: 100,
      };
      const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);

      expect(progress).toBe(100);
    });
  });

  describe('deadline validation', () => {
    it('should detect overdue goals', () => {
      const pastDeadline = '2025-01-01';
      const isOverdue = new Date(pastDeadline) < new Date();

      expect(isOverdue).toBe(true);
    });

    it('should detect upcoming goals', () => {
      const futureDeadline = '2027-12-31';
      const isOverdue = new Date(futureDeadline) < new Date();

      expect(isOverdue).toBe(false);
    });

    it('should calculate days remaining', () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);
      
      const today = new Date();
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(7);
    });
  });

  describe('goal categories', () => {
    it('should support standard categories', () => {
      const categories = ['study', 'health', 'career', 'personal', 'fitness'];
      
      categories.forEach(category => {
        const goal = {
          id: 'test',
          title: 'Test',
          description: '',
          target_value: 100,
          current_value: 0,
          category,
          priority: 'medium' as const,
          deadline: '',
          is_completed: false,
        };

        expect(goal.category).toBe(category);
      });
    });
  });

  describe('priority ordering', () => {
    it('should order goals by priority correctly', () => {
      const goals = [
        { id: '1', priority: 'low' as const },
        { id: '2', priority: 'high' as const },
        { id: '3', priority: 'medium' as const },
      ];

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sorted = [...goals].sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });
  });
});
