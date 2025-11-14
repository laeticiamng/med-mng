/**
 * Types TypeScript générés à partir du schéma Supabase
 * Phases 1, 2, 3
 */

// ============================================================================
// PHASE 1: ANALYTICS & FAVORITES
// ============================================================================

/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  session_id: string | null;
  event_name: string;
  properties: Record<string, any> | null;
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

/**
 * User Favorite
 */
export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: 'edn' | 'ecos' | 'song' | 'product';
  item_id: string;
  item_title: string | null;
  item_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PHASE 2: SECURITY & SESSION
// ============================================================================

/**
 * User 2FA Configuration
 */
export interface User2FA {
  id: string;
  user_id: string;
  secret: string;
  backup_codes: Array<{
    code: string;
    used: boolean;
    used_at: string | null;
  }>;
  is_enabled: boolean;
  verified_at: string | null;
  enabled_at: string | null;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Connected Device
 */
export interface ConnectedDevice {
  id: string;
  user_id: string;
  device_id: string | null;
  device_name: string;
  device_type: 'web' | 'mobile' | 'desktop' | 'tablet' | null;
  browser: string | null;
  os: string | null;
  user_agent: string | null;
  ip_address: string | null;
  last_active: string;
  created_at: string;
}

/**
 * Session Log
 */
export interface SessionLog {
  id: string;
  user_id: string;
  session_id: string;
  device_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  login_at: string;
  logout_at: string | null;
  last_activity_at: string;
  is_active: boolean;
  created_at: string;
}

/**
 * User Activity
 */
export interface UserActivity {
  id: string;
  user_id: string;
  action: UserActivityAction;
  resource_type: string;
  resource_id: string | null;
  resource_title: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  status: 'success' | 'failed';
  error_message: string | null;
  created_at: string;
}

export type UserActivityAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'download'
  | 'upload'
  | 'share'
  | 'export'
  | 'import'
  | 'search'
  | 'filter'
  | 'like'
  | 'comment'
  | 'login'
  | 'logout'
  | 'settings_change';

// ============================================================================
// PHASE 3: COLLABORATION & SOCIAL
// ============================================================================

/**
 * User Playlist
 */
export interface UserPlaylist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  song_ids: string[];
  is_public: boolean;
  is_collaborative: boolean;
  cover_image_url: string | null;
  total_duration: number;
  created_at: string;
  updated_at: string;
}

/**
 * Playlist Collaborator
 */
export interface PlaylistCollaborator {
  id: string;
  playlist_id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  user_avatar: string | null;
  permission: 'view' | 'edit' | 'admin';
  joined_at: string;
}

/**
 * Playlist Activity
 */
export interface PlaylistActivity {
  id: string;
  playlist_id: string;
  user_id: string;
  user_name: string | null;
  action: PlaylistActivityAction;
  resource_type: string | null;
  resource_id: string | null;
  resource_title: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export type PlaylistActivityAction =
  | 'created'
  | 'added_song'
  | 'removed_song'
  | 'edited'
  | 'shared'
  | 'comment';

/**
 * Product Review
 */
export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number; // 1-5
  title: string;
  content: string;
  image_urls: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Review Vote
 */
export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  vote_type: 'helpful' | 'not_helpful';
  created_at: string;
}

/**
 * Conversation
 */
export interface Conversation {
  id: string;
  participant_ids: string[];
  participant_names: string[];
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Direct Message
 */
export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  attachments: string[];
  is_read: boolean;
  read_at: string | null;
  reactions: Record<string, number>; // emoji -> count
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VIEWS & AGGREGATES
// ============================================================================

/**
 * User Activity Summary
 */
export interface UserActivitySummary {
  user_id: string;
  total_activities: number;
  action_types: number;
  last_activity: string | null;
  first_activity: string | null;
}

/**
 * Collaborative Playlists Summary
 */
export interface CollaborativePlaylistsSummary {
  id: string;
  user_id: string;
  name: string;
  song_ids: string[];
  total_participants: number;
  last_activity: string | null;
  created_at: string;
}

/**
 * Product Rating Summary
 */
export interface ProductRatingSummary {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
}

// ============================================================================
// DATABASE TYPES (Pour les requêtes génériques)
// ============================================================================

export type Tables =
  | 'analytics_events'
  | 'user_favorites'
  | 'user_2fa'
  | 'user_connected_devices'
  | 'user_session_logs'
  | 'user_activity'
  | 'user_playlists'
  | 'playlist_collaborators'
  | 'playlist_activity'
  | 'product_reviews'
  | 'review_votes'
  | 'conversations'
  | 'direct_messages';

export type Views =
  | 'user_activity_summary'
  | 'collaborative_playlists_summary';

/**
 * Database Schema pour Supabase Client
 */
export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserFavorite, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_2fa: {
        Row: User2FA;
        Insert: Omit<User2FA, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User2FA, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_connected_devices: {
        Row: ConnectedDevice;
        Insert: Omit<ConnectedDevice, 'id' | 'created_at'>;
        Update: Partial<Omit<ConnectedDevice, 'id' | 'created_at'>>;
      };
      user_session_logs: {
        Row: SessionLog;
        Insert: Omit<SessionLog, 'id' | 'created_at'>;
        Update: Partial<Omit<SessionLog, 'id' | 'created_at'>>;
      };
      user_activity: {
        Row: UserActivity;
        Insert: Omit<UserActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<UserActivity, 'id' | 'created_at'>>;
      };
      user_playlists: {
        Row: UserPlaylist;
        Insert: Omit<UserPlaylist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPlaylist, 'id' | 'created_at' | 'updated_at'>>;
      };
      playlist_collaborators: {
        Row: PlaylistCollaborator;
        Insert: Omit<PlaylistCollaborator, 'id' | 'joined_at'>;
        Update: Partial<Omit<PlaylistCollaborator, 'id' | 'joined_at'>>;
      };
      playlist_activity: {
        Row: PlaylistActivity;
        Insert: Omit<PlaylistActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<PlaylistActivity, 'id' | 'created_at'>>;
      };
      product_reviews: {
        Row: ProductReview;
        Insert: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>>;
      };
      review_votes: {
        Row: ReviewVote;
        Insert: Omit<ReviewVote, 'id' | 'created_at'>;
        Update: never;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>;
      };
      direct_messages: {
        Row: DirectMessage;
        Insert: Omit<DirectMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DirectMessage, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      user_activity_summary: {
        Row: UserActivitySummary;
      };
      collaborative_playlists_summary: {
        Row: CollaborativePlaylistsSummary;
      };
    };
    Functions: {
      log_user_activity: {
        Args: {
          p_action: UserActivityAction;
          p_resource_type: string;
          p_resource_id?: string;
          p_resource_title?: string;
          p_metadata?: Record<string, any>;
        };
        Returns: void;
      };
      get_product_rating: {
        Args: {
          product_id: string;
        };
        Returns: ProductRatingSummary;
      };
    };
  };
}
