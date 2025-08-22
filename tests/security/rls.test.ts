import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Row Level Security (RLS) Tests', () => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
    process.env.VITE_SUPABASE_ANON_KEY || 'test-key'
  );

  let testUser1: any;
  let testUser2: any;

  beforeAll(async () => {
    // Create test users
    const { data: user1 } = await supabase.auth.signUp({
      email: 'test1@example.com',
      password: 'TestPassword123!'
    });
    
    const { data: user2 } = await supabase.auth.signUp({
      email: 'test2@example.com',
      password: 'TestPassword123!'
    });

    testUser1 = user1.user;
    testUser2 = user2.user;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.auth.signOut();
  });

  describe('User Generated Music RLS', () => {
    it('should only allow users to see their own music', async () => {
      // Sign in as user1
      await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'TestPassword123!'
      });

      // Create music for user1
      const { data: music1, error: error1 } = await supabase
        .from('user_generated_music')
        .insert({
          title: 'User1 Music',
          track_id: 'track123',
          metadata: { test: true }
        })
        .select();

      expect(error1).toBeFalsy();
      expect(music1).toHaveLength(1);

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: 'test2@example.com',
        password: 'TestPassword123!'
      });

      // Try to access user1's music - should fail
      const { data: musicList, error: error2 } = await supabase
        .from('user_generated_music')
        .select()
        .eq('track_id', 'track123');

      expect(musicList).toHaveLength(0); // Should not see other user's music
    });

    it('should prevent users from updating other users music', async () => {
      // Sign in as user1
      await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'TestPassword123!'
      });

      // Create music for user1
      const { data: music } = await supabase
        .from('user_generated_music')
        .insert({
          title: 'Original Title',
          track_id: 'track456'
        })
        .select()
        .single();

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: 'test2@example.com',
        password: 'TestPassword123!'
      });

      // Try to update user1's music - should fail
      const { error } = await supabase
        .from('user_generated_music')
        .update({ title: 'Hacked Title' })
        .eq('id', music?.id);

      expect(error).toBeTruthy();
    });
  });

  describe('User Quotas RLS', () => {
    it('should only allow users to access their own quotas', async () => {
      // Sign in as user1
      await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'TestPassword123!'
      });

      // Get user1's quotas
      const { data: quotas1 } = await supabase
        .from('user_quotas')
        .select();

      expect(quotas1).toBeDefined();

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: 'test2@example.com',
        password: 'TestPassword123!'
      });

      // Get quotas - should only see user2's quotas
      const { data: quotas2 } = await supabase
        .from('user_quotas')
        .select();

      // Should not see user1's quotas
      const user1Quotas = quotas2?.filter(q => q.user_id === testUser1?.id);
      expect(user1Quotas).toHaveLength(0);
    });
  });

  describe('Activity Logs RLS', () => {
    it('should protect user activity logs', async () => {
      // Sign in as user1
      await supabase.auth.signInWithPassword({
        email: 'test1@example.com',
        password: 'TestPassword123!'
      });

      // Create activity log
      const { error: insertError } = await supabase
        .from('user_activity_logs')
        .insert({
          activity_type: 'music_generation',
          activity_details: { test: true }
        });

      expect(insertError).toBeFalsy();

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: 'test2@example.com',
        password: 'TestPassword123!'
      });

      // Try to access user1's activity logs
      const { data: logs } = await supabase
        .from('user_activity_logs')
        .select()
        .eq('activity_type', 'music_generation');

      // Should not see other user's logs
      const user1Logs = logs?.filter(log => log.user_id === testUser1?.id);
      expect(user1Logs).toHaveLength(0);
    });
  });

  describe('Anonymous Access', () => {
    it('should prevent anonymous access to protected tables', async () => {
      // Sign out to become anonymous
      await supabase.auth.signOut();

      // Try to access user-specific tables
      const { data: music, error: musicError } = await supabase
        .from('user_generated_music')
        .select();

      const { data: quotas, error: quotasError } = await supabase
        .from('user_quotas')
        .select();

      // Should either return empty or throw an error
      expect(music).toHaveLength(0);
      expect(quotas).toHaveLength(0);
    });
  });
});