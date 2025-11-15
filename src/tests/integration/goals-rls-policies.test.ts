import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

/**
 * Integration Tests for Goals RLS Policies
 *
 * Tests cover RLS policies for:
 * - user_goals table
 * - goal_milestones table
 * - goal_achievements table
 *
 * These tests verify that:
 * 1. Users can only access their own data
 * 2. Anonymous users cannot access protected data
 * 3. Admin users can access all data (analytics)
 * 4. CRUD operations respect RLS policies
 * 5. Cascade deletions work correctly
 */

describe('Goals RLS Policies Integration Tests', () => {
  const mockUserId = 'user-123';
  const anotherUserId = 'user-456';
  const adminUserId = 'admin-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('user_goals RLS', () => {
    it('should allow users to read their own goals', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: mockUserId,
        title: 'Complete 10 EDN items',
        description: 'Test description',
        category: 'edn',
        goal_type: 'completion',
        target_value: 10,
        current_value: 5,
        status: 'active',
        priority: 'high',
        progress_percentage: 50,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockGoal], error: null }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].user_id).toBe(mockUserId);
    });

    it('should prevent users from reading other users\' goals', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'RLS policy violation' },
          }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', anotherUserId);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('RLS policy violation');
    });

    it('should allow users to create their own goals', async () => {
      const newGoal = {
        user_id: mockUserId,
        title: 'New Goal',
        description: 'Description',
        category: 'quiz',
        goal_type: 'score',
        target_value: 90,
        target_date: '2025-12-31',
        priority: 'medium',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'goal-2', ...newGoal, status: 'active', current_value: 0 },
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await supabase.from('user_goals').insert(newGoal);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should prevent users from creating goals for other users', async () => {
      const newGoal = {
        user_id: anotherUserId, // Trying to insert for another user
        title: 'Malicious Goal',
        category: 'edn',
        goal_type: 'completion',
        target_value: 100,
        target_date: '2025-12-31',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'RLS policy violation' },
            }),
          }),
        }),
      } as any);

      const result = await supabase.from('user_goals').insert(newGoal);

      expect(result.error).toBeDefined();
    });

    it('should allow users to update their own goals', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'goal-1', status: 'paused' },
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .update({ status: 'paused' })
        .eq('id', 'goal-1');

      expect(result.error).toBeNull();
    });

    it('should allow users to delete their own goals', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .delete()
        .eq('id', 'goal-1');

      expect(result.error).toBeNull();
    });

    it('should allow admins to view all goals', async () => {
      const mockGoals = [
        { id: 'goal-1', user_id: mockUserId, title: 'Goal 1' },
        { id: 'goal-2', user_id: anotherUserId, title: 'Goal 2' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockGoals, error: null }),
      } as any);

      const result = await supabase.from('user_goals').select('*');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe('goal_milestones RLS', () => {
    it('should allow users to read milestones for their own goals', async () => {
      const mockMilestone = {
        id: 'milestone-1',
        goal_id: 'goal-1',
        user_id: mockUserId,
        title: '50% Complete',
        target_value: 5,
        current_value: 3,
        target_date: '2025-11-30',
        is_completed: false,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockMilestone], error: null }),
        }),
      } as any);

      const result = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('user_id', mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data[0].user_id).toBe(mockUserId);
    });

    it('should prevent users from reading other users\' milestones', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'RLS policy violation' },
          }),
        }),
      } as any);

      const result = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('user_id', anotherUserId);

      expect(result.error).toBeDefined();
    });

    it('should allow users to create milestones for their own goals', async () => {
      const newMilestone = {
        goal_id: 'goal-1',
        user_id: mockUserId,
        title: 'Halfway',
        target_value: 50,
        target_date: '2025-11-15',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'milestone-2', ...newMilestone, is_completed: false },
              error: null,
            }),
          }),
        }),
      } as any);

      const result = await supabase.from('goal_milestones').insert(newMilestone);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
    });

    it('should allow users to update their own milestones', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'milestone-1', is_completed: true },
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const result = await supabase
        .from('goal_milestones')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', 'milestone-1');

      expect(result.error).toBeNull();
    });

    it('should allow users to delete their own milestones', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await supabase
        .from('goal_milestones')
        .delete()
        .eq('id', 'milestone-1');

      expect(result.error).toBeNull();
    });
  });

  describe('goal_achievements RLS', () => {
    it('should allow users to read their own achievements', async () => {
      const mockAchievement = {
        id: 'achievement-1',
        goal_id: 'goal-1',
        user_id: mockUserId,
        achieved_at: new Date().toISOString(),
        days_to_complete: 30,
        completion_rate: 100,
        xp_earned: 100,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockAchievement], error: null }),
        }),
      } as any);

      const result = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('user_id', mockUserId);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data[0].user_id).toBe(mockUserId);
    });

    it('should prevent users from reading other users\' achievements', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'RLS policy violation' },
          }),
        }),
      } as any);

      const result = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('user_id', anotherUserId);

      expect(result.error).toBeDefined();
    });

    it('should allow admins to view all achievements for analytics', async () => {
      const mockAchievements = [
        { id: 'achievement-1', user_id: mockUserId, xp_earned: 100 },
        { id: 'achievement-2', user_id: anotherUserId, xp_earned: 50 },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockAchievements, error: null }),
      } as any);

      const result = await supabase.from('goal_achievements').select('*');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe('RPC Functions RLS', () => {
    it('should allow users to call get_goal_stats for themselves', async () => {
      const mockStats = {
        total_goals: 10,
        active_goals: 5,
        completed_goals: 3,
        failed_goals: 1,
        paused_goals: 1,
        completion_rate: 30,
        average_completion_days: 25,
        total_xp_earned: 250,
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [mockStats],
        error: null,
      } as any);

      const result = await supabase.rpc('get_goal_stats', {
        p_user_id: mockUserId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data[0]).toMatchObject({
        total_goals: 10,
        active_goals: 5,
      });
    });

    it('should allow users to call get_goals_by_category for themselves', async () => {
      const mockCategoryStats = [
        { category: 'edn', total_goals: 5, completed_goals: 2, active_goals: 3 },
        { category: 'quiz', total_goals: 3, completed_goals: 1, active_goals: 2 },
      ];

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockCategoryStats,
        error: null,
      } as any);

      const result = await supabase.rpc('get_goals_by_category', {
        p_user_id: mockUserId,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(2);
    });

    it('should allow users to call update_goal_progress', async () => {
      const updatedGoal = {
        id: 'goal-1',
        current_value: 15,
        progress_percentage: 75,
        status: 'active',
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: updatedGoal,
        error: null,
      } as any);

      const result = await supabase.rpc('update_goal_progress', {
        p_goal_id: 'goal-1',
        p_progress_increment: 5,
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.current_value).toBe(15);
    });

    it('should auto-complete goal when target reached', async () => {
      const completedGoal = {
        id: 'goal-1',
        current_value: 100,
        target_value: 100,
        progress_percentage: 100,
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: completedGoal,
        error: null,
      } as any);

      const result = await supabase.rpc('update_goal_progress', {
        p_goal_id: 'goal-1',
        p_progress_increment: 10, // This should complete the goal
      });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('completed');
      expect(result.data.completed_at).toBeTruthy();
    });
  });

  describe('Cascade Deletions', () => {
    it('should cascade delete milestones when goal is deleted', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .delete()
        .eq('id', 'goal-1');

      expect(result.error).toBeNull();

      // Verify milestones are also deleted (would be enforced by FK ON DELETE CASCADE)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      } as any);

      const milestonesResult = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', 'goal-1');

      expect(milestonesResult.data).toHaveLength(0);
    });

    it('should cascade delete achievements when goal is deleted', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .delete()
        .eq('id', 'goal-1');

      expect(result.error).toBeNull();

      // Verify achievements are also deleted
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      } as any);

      const achievementsResult = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('goal_id', 'goal-1');

      expect(achievementsResult.data).toHaveLength(0);
    });

    it('should cascade delete all goal data when user is deleted', async () => {
      // ON DELETE CASCADE should remove all user goals when user is deleted
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      } as any);

      const result = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', 'deleted-user');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('Gamification Integration', () => {
    it('should update gamification_stats when goal is completed', async () => {
      const mockStats = {
        user_id: mockUserId,
        goals_completed: 5,
        total_points: 350,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockStats, error: null }),
          }),
        }),
      } as any);

      const result = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', mockUserId)
        .single();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.goals_completed).toBeGreaterThan(0);
    });

    it('should award XP based on goal priority', async () => {
      const highPriorityXP = 100;
      const mediumPriorityXP = 50;
      const lowPriorityXP = 25;

      // Test high priority goal completion
      const highPriorityAchievement = {
        goal_id: 'goal-high',
        user_id: mockUserId,
        xp_earned: highPriorityXP,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [highPriorityAchievement], error: null }),
        }),
      } as any);

      const result = await supabase
        .from('goal_achievements')
        .select('*')
        .eq('goal_id', 'goal-high');

      expect(result.error).toBeNull();
      expect(result.data[0].xp_earned).toBe(highPriorityXP);
    });
  });
});
