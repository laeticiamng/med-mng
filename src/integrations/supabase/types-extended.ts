/**
 * Extended types for tables not yet in generated types.ts
 *
 * These types should be merged into types.ts when regenerating from Supabase.
 * Command: npx supabase gen types typescript --project-id yaincoxihiqdksxgrsrk > src/integrations/supabase/types.ts
 */

import { Database } from './types'

// Type for share permissions
export type SharePermission = 'viewer' | 'editor' | 'admin'

// Extended database type with missing tables
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      // sitemap_shares table
      sitemap_shares: {
        Row: {
          id: string
          owner_id: string
          shared_with_email: string
          shared_with_user_id: string | null
          permission: SharePermission
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          shared_with_email: string
          shared_with_user_id?: string | null
          permission?: SharePermission
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          shared_with_email?: string
          shared_with_user_id?: string | null
          permission?: SharePermission
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sitemap_shares_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sitemap_shares_shared_with_user_id_fkey'
            columns: ['shared_with_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // med_mng_user_favorites table
      med_mng_user_favorites: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'med_mng_user_favorites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // user_playlists table
      user_playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_playlists_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }

    Enums: Database['public']['Enums'] & {
      share_permission: SharePermission
    }
  }
}

// Type helper to get table names including extended tables
export type ExtendedTableName = keyof ExtendedDatabase['public']['Tables']

// Type helper to get row type from extended database
export type ExtendedRow<T extends ExtendedTableName> = ExtendedDatabase['public']['Tables'][T]['Row']

// Type helper to get insert type from extended database
export type ExtendedInsert<T extends ExtendedTableName> = ExtendedDatabase['public']['Tables'][T]['Insert']

// Type helper to get update type from extended database
export type ExtendedUpdate<T extends ExtendedTableName> = ExtendedDatabase['public']['Tables'][T]['Update']
