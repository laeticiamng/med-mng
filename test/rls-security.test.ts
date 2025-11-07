/**
 * Tests automatisés RLS (Row Level Security)
 * Vérifie l'isolation des données entre utilisateurs et détecte les régressions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Test users
const testUser1Email = 'test-user-1@example.com';
const testUser2Email = 'test-user-2@example.com';
const testPassword = 'TestPassword123!';

let supabaseService: SupabaseClient;
let supabaseUser1: SupabaseClient;
let supabaseUser2: SupabaseClient;
let user1Id: string;
let user2Id: string;

describe('RLS Security Tests', () => {
  beforeAll(async () => {
    // Initialize service role client
    supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Create test users
    try {
      const { data: user1Data } = await supabaseService.auth.admin.createUser({
        email: testUser1Email,
        password: testPassword,
        email_confirm: true,
      });
      user1Id = user1Data?.user?.id || '';

      const { data: user2Data } = await supabaseService.auth.admin.createUser({
        email: testUser2Email,
        password: testPassword,
        email_confirm: true,
      });
      user2Id = user2Data?.user?.id || '';

      // Sign in as users
      supabaseUser1 = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseUser1.auth.signInWithPassword({
        email: testUser1Email,
        password: testPassword,
      });

      supabaseUser2 = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseUser2.auth.signInWithPassword({
        email: testUser2Email,
        password: testPassword,
      });
    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  afterAll(async () => {
    // Cleanup test users
    try {
      if (user1Id) {
        await supabaseService.auth.admin.deleteUser(user1Id);
      }
      if (user2Id) {
        await supabaseService.auth.admin.deleteUser(user2Id);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('med_mng_items Table RLS', () => {
    it('should allow users to create their own items', async () => {
      const { data, error } = await supabaseUser1.from('med_mng_items').insert({
        title: 'Test Item User 1',
        category: 'bd',
        user_id: user1Id,
      }).select();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.[0]?.user_id).toBe(user1Id);
    });

    it('should prevent users from accessing other users items', async () => {
      // User 1 creates an item
      const { data: created } = await supabaseUser1.from('med_mng_items').insert({
        title: 'Private Item User 1',
        category: 'bd',
        user_id: user1Id,
      }).select().single();

      // User 2 tries to read User 1's item
      const { data, error } = await supabaseUser2
        .from('med_mng_items')
        .select('*')
        .eq('id', created?.id);

      expect(data).toEqual([]);
      expect(data?.length).toBe(0);
    });

    it('should prevent users from updating other users items', async () => {
      // User 1 creates an item
      const { data: created } = await supabaseUser1.from('med_mng_items').insert({
        title: 'Item to Update',
        category: 'bd',
        user_id: user1Id,
      }).select().single();

      // User 2 tries to update User 1's item
      const { data, error } = await supabaseUser2
        .from('med_mng_items')
        .update({ title: 'Hacked!' })
        .eq('id', created?.id)
        .select();

      expect(data).toEqual([]);
      expect(error).toBeTruthy();
    });

    it('should prevent users from deleting other users items', async () => {
      // User 1 creates an item
      const { data: created } = await supabaseUser1.from('med_mng_items').insert({
        title: 'Item to Delete',
        category: 'bd',
        user_id: user1Id,
      }).select().single();

      // User 2 tries to delete User 1's item
      const { data, error } = await supabaseUser2
        .from('med_mng_items')
        .delete()
        .eq('id', created?.id)
        .select();

      expect(data).toEqual([]);

      // Verify item still exists
      const { data: stillExists } = await supabaseUser1
        .from('med_mng_items')
        .select('*')
        .eq('id', created?.id);

      expect(stillExists?.length).toBe(1);
    });

    it('should allow users to read only their own items', async () => {
      // Create items for both users
      await supabaseUser1.from('med_mng_items').insert({
        title: 'User 1 Item',
        category: 'bd',
        user_id: user1Id,
      });

      await supabaseUser2.from('med_mng_items').insert({
        title: 'User 2 Item',
        category: 'bd',
        user_id: user2Id,
      });

      // User 1 reads their items
      const { data: user1Items } = await supabaseUser1
        .from('med_mng_items')
        .select('*');

      // All items should belong to user 1
      expect(user1Items?.every(item => item.user_id === user1Id)).toBe(true);
    });
  });

  describe('Public Tables RLS', () => {
    it('should allow anyone to read edn_items_immersive', async () => {
      const { data, error } = await supabaseUser1
        .from('edn_items_immersive')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
    });

    it('should prevent users from modifying edn_items_immersive', async () => {
      const { error } = await supabaseUser1
        .from('edn_items_immersive')
        .insert({ title: 'Should Fail' });

      expect(error).toBeTruthy();
    });

    it('should allow anyone to read oic_competences', async () => {
      const { data, error } = await supabaseUser1
        .from('oic_competences')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
    });
  });

  describe('Audit Logs RLS', () => {
    it('should prevent users from accessing audit_logs', async () => {
      const { data, error } = await supabaseUser1
        .from('audit_logs')
        .select('*');

      expect(data).toEqual([]);
      expect(error).toBeTruthy();
    });

    it('should prevent users from inserting into audit_logs', async () => {
      const { error } = await supabaseUser1
        .from('audit_logs')
        .insert({
          action: 'test',
          table_name: 'test',
          user_id: user1Id,
        });

      expect(error).toBeTruthy();
    });
  });

  describe('Security Regression Detection', () => {
    it('should detect if RLS is disabled on critical tables', async () => {
      const { data: tables } = await supabaseService
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .in('tablename', ['med_mng_items', 'comic_panels', 'roman_versions', 'music_tracks']);

      expect(tables).toBeTruthy();
      tables?.forEach(table => {
        expect(table.rowsecurity).toBe(true);
      });
    });

    it('should verify RLS policies exist on user tables', async () => {
      const { data: policies } = await supabaseService.rpc('get_rls_policies');

      const criticalTables = ['med_mng_items', 'comic_panels', 'roman_versions'];
      criticalTables.forEach(tableName => {
        const tablePolicies = policies?.filter((p: any) => p.tablename === tableName);
        expect(tablePolicies?.length).toBeGreaterThan(0);
      });
    });
  });
});
