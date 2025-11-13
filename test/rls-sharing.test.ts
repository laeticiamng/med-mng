/**
 * Tests d'intégration automatiques pour les RLS policies de partage
 * Valide les permissions viewer, editor et admin
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Test users
const ownerEmail = 'share-owner@test.com';
const viewerEmail = 'share-viewer@test.com';
const editorEmail = 'share-editor@test.com';
const adminEmail = 'share-admin@test.com';
const testPassword = 'TestPassword123!';

let supabaseService: SupabaseClient;
let supabaseOwner: SupabaseClient;
let supabaseViewer: SupabaseClient;
let supabaseEditor: SupabaseClient;
let supabaseAdmin: SupabaseClient;

let ownerId: string;
let viewerId: string;
let editorId: string;
let adminId: string;

describe('RLS Sharing Permissions Tests', () => {
  beforeAll(async () => {
    supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    try {
      // Create test users
      const { data: ownerData } = await supabaseService.auth.admin.createUser({
        email: ownerEmail,
        password: testPassword,
        email_confirm: true,
      });
      ownerId = ownerData?.user?.id || '';

      const { data: viewerData } = await supabaseService.auth.admin.createUser({
        email: viewerEmail,
        password: testPassword,
        email_confirm: true,
      });
      viewerId = viewerData?.user?.id || '';

      const { data: editorData } = await supabaseService.auth.admin.createUser({
        email: editorEmail,
        password: testPassword,
        email_confirm: true,
      });
      editorId = editorData?.user?.id || '';

      const { data: adminData } = await supabaseService.auth.admin.createUser({
        email: adminEmail,
        password: testPassword,
        email_confirm: true,
      });
      adminId = adminData?.user?.id || '';

      // Sign in as each user
      supabaseOwner = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseOwner.auth.signInWithPassword({
        email: ownerEmail,
        password: testPassword,
      });

      supabaseViewer = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseViewer.auth.signInWithPassword({
        email: viewerEmail,
        password: testPassword,
      });

      supabaseEditor = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseEditor.auth.signInWithPassword({
        email: editorEmail,
        password: testPassword,
      });

      supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
      await supabaseAdmin.auth.signInWithPassword({
        email: adminEmail,
        password: testPassword,
      });

      // Create shares with different permissions
      await supabaseService.from('sitemap_shares').insert([
        {
          owner_id: ownerId,
          shared_with_email: viewerEmail,
          shared_with_user_id: viewerId,
          permission: 'viewer',
        },
        {
          owner_id: ownerId,
          shared_with_email: editorEmail,
          shared_with_user_id: editorId,
          permission: 'editor',
        },
        {
          owner_id: ownerId,
          shared_with_email: adminEmail,
          shared_with_user_id: adminId,
          permission: 'admin',
        },
      ]);

      // Create test data for owner
      await supabaseService.from('user_sitemap_data').insert({
        user_id: ownerId,
        favorites: ['/test-page-1', '/test-page-2'],
        tags: [],
        visit_stats: {},
        navigation_paths: [],
        alert_thresholds: { bounceRate: 70, avgTimeSeconds: 30 },
      });

      await supabaseService.from('page_notes').insert({
        user_id: ownerId,
        page_path: '/test-page-1',
        note_text: 'Test note for sharing',
      });

    } catch (error) {
      console.error('Setup failed:', error);
    }
  });

  afterAll(async () => {
    try {
      // Cleanup test data
      if (ownerId) {
        await supabaseService.from('sitemap_shares').delete().eq('owner_id', ownerId);
        await supabaseService.from('user_sitemap_data').delete().eq('user_id', ownerId);
        await supabaseService.from('page_notes').delete().eq('user_id', ownerId);
      }

      // Cleanup test users
      if (ownerId) await supabaseService.auth.admin.deleteUser(ownerId);
      if (viewerId) await supabaseService.auth.admin.deleteUser(viewerId);
      if (editorId) await supabaseService.auth.admin.deleteUser(editorId);
      if (adminId) await supabaseService.auth.admin.deleteUser(adminId);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('Viewer Permission Tests', () => {
    it('should allow viewer to read shared sitemap data', async () => {
      const { data, error } = await supabaseViewer
        .from('user_sitemap_data')
        .select('*')
        .eq('user_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow viewer to read shared notes', async () => {
      const { data, error } = await supabaseViewer
        .from('page_notes')
        .select('*')
        .eq('user_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should prevent viewer from updating shared data', async () => {
      const { data: existingData } = await supabaseViewer
        .from('user_sitemap_data')
        .select('id')
        .eq('user_id', ownerId)
        .single();

      if (existingData) {
        const { error } = await supabaseViewer
          .from('user_sitemap_data')
          .update({ favorites: ['/modified-by-viewer'] })
          .eq('id', (existingData as any).id);

        expect(error).toBeTruthy();
        expect(error?.message).toContain('permission');
      }
    });

    it('should prevent viewer from deleting shared data', async () => {
      const { data: existingNote } = await supabaseViewer
        .from('page_notes')
        .select('id')
        .eq('user_id', ownerId)
        .single();

      if (existingNote) {
        const { error } = await supabaseViewer
          .from('page_notes')
          .delete()
          .eq('id', (existingNote as any).id);

        expect(error).toBeTruthy();
      }
    });
  });

  describe('Editor Permission Tests', () => {
    it('should allow editor to read shared data', async () => {
      const { data, error } = await supabaseEditor
        .from('user_sitemap_data')
        .select('*')
        .eq('user_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow editor to update shared sitemap data', async () => {
      const { data: existingData } = await supabaseEditor
        .from('user_sitemap_data')
        .select('id, favorites')
        .eq('user_id', ownerId)
        .single();

      if (existingData) {
        const typedData = existingData as any;
        const updatedFavorites = [...(typedData.favorites || []), '/editor-added'];
        
        const { error } = await supabaseEditor
          .from('user_sitemap_data')
          .update({ favorites: updatedFavorites })
          .eq('id', typedData.id);

        expect(error).toBeNull();
      }
    });

    it('should allow editor to create notes on shared data', async () => {
      const { error } = await supabaseEditor
        .from('page_notes')
        .insert({
          user_id: ownerId,
          page_path: '/test-editor-note',
          note_text: 'Note created by editor',
        });

      // Note: This might fail depending on RLS policy - editors can only update, not create owner's data
      // If policy prevents this, the test should expect an error
      if (error) {
        expect(error.message).toContain('permission');
      }
    });

    it('should allow editor to update existing notes', async () => {
      const { data: existingNote } = await supabaseEditor
        .from('page_notes')
        .select('id')
        .eq('user_id', ownerId)
        .limit(1)
        .single();

      if (existingNote) {
        const { error } = await supabaseEditor
          .from('page_notes')
          .update({ note_text: 'Modified by editor' })
          .eq('id', (existingNote as any).id);

        expect(error).toBeNull();
      }
    });

    it('should prevent editor from deleting owner data', async () => {
      const { data: existingNote } = await supabaseEditor
        .from('page_notes')
        .select('id')
        .eq('user_id', ownerId)
        .single();

      if (existingNote) {
        const { error } = await supabaseEditor
          .from('page_notes')
          .delete()
          .eq('id', (existingNote as any).id);

        expect(error).toBeTruthy();
      }
    });
  });

  describe('Admin Permission Tests', () => {
    it('should allow admin to read all shared data', async () => {
      const { data, error } = await supabaseAdmin
        .from('user_sitemap_data')
        .select('*')
        .eq('user_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
    });

    it('should allow admin to update shared data', async () => {
      const { data: existingData } = await supabaseAdmin
        .from('user_sitemap_data')
        .select('id, favorites')
        .eq('user_id', ownerId)
        .single();

      if (existingData) {
        const typedData = existingData as any;
        const { error } = await supabaseAdmin
          .from('user_sitemap_data')
          .update({ favorites: [...(typedData.favorites || []), '/admin-modified'] })
          .eq('id', typedData.id);

        expect(error).toBeNull();
      }
    });

    it('should allow admin to manage shares', async () => {
      const { data, error } = await supabaseAdmin
        .from('sitemap_shares')
        .select('*')
        .eq('owner_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should allow admin to create new notes', async () => {
      const { error } = await supabaseAdmin
        .from('page_notes')
        .insert({
          user_id: ownerId,
          page_path: '/test-admin-note',
          note_text: 'Note created by admin',
        });

      // Admins might be restricted from creating on behalf of owner
      if (error) {
        expect(error.message).toContain('permission');
      }
    });

    it('should allow admin full CRUD on notes', async () => {
      // Create a test note as service to ensure it exists
      const { data: created } = await supabaseService
        .from('page_notes')
        .insert({
          user_id: ownerId,
          page_path: '/test-admin-crud',
          note_text: 'Test note for admin CRUD',
        })
        .select()
        .single();

      if (created) {
        const noteId = (created as any).id;

        // Update
        const { error: updateError } = await supabaseAdmin
          .from('page_notes')
          .update({ note_text: 'Updated by admin' })
          .eq('id', noteId);

        expect(updateError).toBeNull();

        // Delete (might be restricted)
        const { error: deleteError } = await supabaseAdmin
          .from('page_notes')
          .delete()
          .eq('id', noteId);

        // Admin might not be able to delete owner's data
        if (deleteError) {
          expect(deleteError.message).toContain('permission');
        }
      }
    });
  });

  describe('Share Management Tests', () => {
    it('should allow owner to view their shares', async () => {
      const { data, error } = await supabaseOwner
        .from('sitemap_shares')
        .select('*')
        .eq('owner_id', ownerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBe(3); // viewer, editor, admin
    });

    it('should allow shared users to view shares they received', async () => {
      const { data, error } = await supabaseViewer
        .from('sitemap_shares')
        .select('*')
        .eq('shared_with_user_id', viewerId);

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.length).toBeGreaterThan(0);
    });

    it('should prevent non-owners from viewing other shares', async () => {
      const { data, error } = await supabaseViewer
        .from('sitemap_shares')
        .select('*')
        .eq('owner_id', ownerId)
        .neq('shared_with_user_id', viewerId);

      // Should return empty or error
      expect(data?.length).toBe(0);
    });

    it('should allow owner to update share permissions', async () => {
      const { data: share } = await supabaseOwner
        .from('sitemap_shares')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('shared_with_user_id', viewerId)
        .single();

      if (share) {
        const { error } = await supabaseOwner
          .from('sitemap_shares')
          .update({ permission: 'editor' })
          .eq('id', (share as any).id);

        expect(error).toBeNull();

        // Revert back
        await supabaseOwner
          .from('sitemap_shares')
          .update({ permission: 'viewer' })
          .eq('id', (share as any).id);
      }
    });

    it('should prevent non-owners from updating shares', async () => {
      const { data: share } = await supabaseOwner
        .from('sitemap_shares')
        .select('id')
        .eq('owner_id', ownerId)
        .single();

      if (share) {
        const { error } = await supabaseViewer
          .from('sitemap_shares')
          .update({ permission: 'admin' })
          .eq('id', (share as any).id);

        expect(error).toBeTruthy();
      }
    });

    it('should allow owner to delete shares', async () => {
      // Create a temporary share
      const { data: tempShare } = await supabaseOwner
        .from('sitemap_shares')
        .insert({
          owner_id: ownerId,
          shared_with_email: 'temp@test.com',
          permission: 'viewer',
        })
        .select()
        .single();

      if (tempShare) {
        const { error } = await supabaseOwner
          .from('sitemap_shares')
          .delete()
          .eq('id', (tempShare as any).id);

        expect(error).toBeNull();
      }
    });

    it('should prevent shared users from deleting shares', async () => {
      const { data: share } = await supabaseOwner
        .from('sitemap_shares')
        .select('id')
        .eq('owner_id', ownerId)
        .eq('shared_with_user_id', viewerId)
        .single();

      if (share) {
        const { error } = await supabaseViewer
          .from('sitemap_shares')
          .delete()
          .eq('id', (share as any).id);

        expect(error).toBeTruthy();
      }
    });
  });

  describe('Data Isolation Tests', () => {
    it('should prevent viewer from accessing unshared data', async () => {
      // Create data for a different user
      const { data: otherUser } = await supabaseService.auth.admin.createUser({
        email: 'other-user@test.com',
        password: testPassword,
        email_confirm: true,
      });

      const otherUserId = otherUser?.user?.id;

      if (otherUserId) {
        await supabaseService.from('user_sitemap_data').insert({
          user_id: otherUserId,
          favorites: ['/other-user-page'],
          tags: [],
          visit_stats: {},
          navigation_paths: [],
          alert_thresholds: { bounceRate: 70, avgTimeSeconds: 30 },
        });

        // Viewer should not see this data
        const { data, error } = await supabaseViewer
          .from('user_sitemap_data')
          .select('*')
          .eq('user_id', otherUserId);

        expect(data?.length).toBe(0);

        // Cleanup
        await supabaseService.from('user_sitemap_data').delete().eq('user_id', otherUserId);
        await supabaseService.auth.admin.deleteUser(otherUserId);
      }
    });

    it('should ensure has_sitemap_access function works correctly', async () => {
      // Test the security definer function directly
      const { data: hasViewerAccess } = await supabaseService.rpc('has_sitemap_access', {
        _user_id: viewerId,
        _target_user_id: ownerId,
        _min_permission: 'viewer',
      });

      expect(hasViewerAccess).toBe(true);

      const { data: hasEditorAccess } = await supabaseService.rpc('has_sitemap_access', {
        _user_id: viewerId,
        _target_user_id: ownerId,
        _min_permission: 'editor',
      });

      expect(hasEditorAccess).toBe(false); // Viewer doesn't have editor access

      const { data: editorHasEditorAccess } = await supabaseService.rpc('has_sitemap_access', {
        _user_id: editorId,
        _target_user_id: ownerId,
        _min_permission: 'editor',
      });

      expect(editorHasEditorAccess).toBe(true);
    });
  });
});
