/**
 * Service Supabase
 * Helper methods pour requêtes CRUD communes
 * Phases 1, 2, 3
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Database,
  UserFavorite,
  UserActivity,
  ProductReview,
  UserActivityAction,
  ConnectedDevice,
  SessionLog,
  UserPlaylist,
  PlaylistCollaborator,
  DirectMessage,
  Conversation,
  ProductRatingSummary,
} from '@/types/database';

// ============================================================================
// ANALYTICS & FAVORITES
// ============================================================================

export const analyticsService = {
  /**
   * Ajouter un événement analytics
   */
  async addEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('analytics_events').insert({
        event_name: eventName,
        properties,
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      console.error('Failed to add analytics event:', eventName);
      return false;
    }
  },
};

export const favoritesService = {
  /**
   * Ajouter un favori
   */
  async addFavorite(
    itemId: string,
    itemType: UserFavorite['item_type'],
    itemTitle?: string,
    itemData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_favorites').insert({
        item_id: itemId,
        item_type: itemType,
        item_title: itemTitle,
        item_data: itemData,
        created_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Retirer un favori
   */
  async removeFavorite(itemId: string, itemType: UserFavorite['item_type']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Vérifier si un item est favorité
   */
  async isFavorited(itemId: string, itemType: UserFavorite['item_type']): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  },

  /**
   * Récupérer tous les favoris d'un utilisateur
   */
  async getUserFavorites(itemType?: UserFavorite['item_type']): Promise<UserFavorite[]> {
    try {
      let query = supabase
        .from('user_favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemType) {
        query = query.eq('item_type', itemType);
      }

      const { data, error } = await query;
      return error ? [] : (data || []);
    } catch {
      return [];
    }
  },
};

// ============================================================================
// ACTIVITY & SESSION
// ============================================================================

export const activityService = {
  /**
   * Logger une activité utilisateur
   */
  async logActivity(
    action: UserActivityAction,
    resourceType: string,
    resourceId?: string,
    resourceTitle?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_activity').insert({
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        resource_title: resourceTitle,
        metadata,
        user_agent: navigator.userAgent,
        status: 'success',
        created_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Récupérer l'historique d'activité
   */
  async getActivityHistory(limit: number = 50): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      return error ? [] : (data || []);
    } catch {
      return [];
    }
  },

  /**
   * Récupérer le résumé d'activité
   */
  async getActivitySummary() {
    try {
      const { data, error } = await supabase
        .from('user_activity_summary')
        .select('*')
        .single();

      return error ? null : data;
    } catch {
      return null;
    }
  },
};

export const sessionService = {
  /**
   * Enregistrer une nouvelle session
   */
  async createSession(
    sessionId: string,
    deviceId?: string
  ): Promise<SessionLog | null> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .insert({
          session_id: sessionId,
          device_id: deviceId,
          user_agent: navigator.userAgent,
          login_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      return error ? null : (data as SessionLog);
    } catch {
      return null;
    }
  },

  /**
   * Mettre à jour l'activité de session
   */
  async updateSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_session_logs')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Terminer une session
   */
  async endSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_session_logs')
        .update({
          is_active: false,
          logout_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Récupérer les sessions actives
   */
  async getActiveSessions(): Promise<SessionLog[]> {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .select('*')
        .eq('is_active', true)
        .order('login_at', { ascending: false });

      return error ? [] : (data as SessionLog[] || []);
    } catch {
      return [];
    }
  },
};

// ============================================================================
// 2FA & DEVICES
// ============================================================================

export const deviceService = {
  /**
   * Enregistrer un nouvel appareil
   */
  async registerDevice(device: Omit<ConnectedDevice, 'id' | 'created_at'>): Promise<ConnectedDevice | null> {
    try {
      const { data, error } = await supabase
        .from('user_connected_devices')
        .insert({
          ...device,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : (data as ConnectedDevice);
    } catch {
      return null;
    }
  },

  /**
   * Récupérer tous les appareils
   */
  async getUserDevices(): Promise<ConnectedDevice[]> {
    try {
      const { data, error } = await supabase
        .from('user_connected_devices')
        .select('*')
        .order('last_active', { ascending: false });

      return error ? [] : (data as ConnectedDevice[] || []);
    } catch {
      return [];
    }
  },

  /**
   * Supprimer un appareil
   */
  async removeDevice(deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connected_devices')
        .delete()
        .eq('id', deviceId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Mettre à jour last_active
   */
  async updateDeviceActivity(deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_connected_devices')
        .update({ last_active: new Date().toISOString() })
        .eq('id', deviceId);

      return !error;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// PLAYLISTS COLLABORATIVES
// ============================================================================

export const playlistService = {
  /**
   * Créer une playlist collaborative
   */
  async createPlaylist(
    name: string,
    description?: string,
    isCollaborative: boolean = false,
    isPublic: boolean = false
  ): Promise<UserPlaylist | null> {
    try {
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          name,
          description,
          is_collaborative: isCollaborative,
          is_public: isPublic,
          song_ids: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : (data as UserPlaylist);
    } catch {
      return null;
    }
  },

  /**
   * Ajouter une chanson à une playlist
   */
  async addSongToPlaylist(playlistId: string, songId: string): Promise<boolean> {
    try {
      const { data: playlist } = await supabase
        .from('user_playlists')
        .select('song_ids')
        .eq('id', playlistId)
        .single();

      if (!playlist) return false;

      const songIds = playlist.song_ids || [];
      if (!songIds.includes(songId)) {
        songIds.push(songId);
      }

      const { error } = await supabase
        .from('user_playlists')
        .update({ song_ids: songIds, updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Retirer une chanson d'une playlist
   */
  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean> {
    try {
      const { data: playlist } = await supabase
        .from('user_playlists')
        .select('song_ids')
        .eq('id', playlistId)
        .single();

      if (!playlist) return false;

      const songIds = (playlist.song_ids || []).filter((id: string) => id !== songId);

      const { error } = await supabase
        .from('user_playlists')
        .update({ song_ids: songIds, updated_at: new Date().toISOString() })
        .eq('id', playlistId);

      return !error;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

export const reviewService = {
  /**
   * Récupérer les avis d'un produit
   */
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      return error ? [] : (data as ProductReview[] || []);
    } catch {
      return [];
    }
  },

  /**
   * Récupérer le résumé des ratings
   */
  async getProductRatingSummary(productId: string): Promise<ProductRatingSummary | null> {
    try {
      const { data, error } = await supabase.rpc('get_product_rating', {
        product_id: productId,
      });

      return error ? null : (data as ProductRatingSummary);
    } catch {
      return null;
    }
  },

  /**
   * Créer un avis
   */
  async createReview(
    productId: string,
    rating: number,
    title: string,
    content: string,
    imageUrls?: string[]
  ): Promise<ProductReview | null> {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          rating,
          title,
          content,
          image_urls: imageUrls || [],
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : (data as ProductReview);
    } catch {
      return null;
    }
  },

  /**
   * Marquer un avis comme utile
   */
  async markReviewHelpful(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('review_votes')
        .insert({
          review_id: reviewId,
          vote_type: 'helpful',
          created_at: new Date().toISOString(),
        });

      return !error;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// MESSAGING
// ============================================================================

export const messagingService = {
  /**
   * Créer une conversation
   */
  async createConversation(participantIds: string[], participantNames: string[]): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_ids: participantIds,
          participant_names: participantNames,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : (data as Conversation);
    } catch {
      return null;
    }
  },

  /**
   * Envoyer un message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    senderName: string
  ): Promise<DirectMessage | null> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: conversationId,
          content,
          sender_name: senderName,
          is_read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return error ? null : (data as DirectMessage);
    } catch {
      return null;
    }
  },

  /**
   * Récupérer les messages d'une conversation
   */
  async getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      return error ? [] : (data as DirectMessage[] || []);
    } catch {
      return [];
    }
  },

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      return !error;
    } catch {
      return false;
    }
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Récupérer l'utilisateur courant
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Récupérer la session courante
 */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
