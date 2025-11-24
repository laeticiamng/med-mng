/**
 * Wishlist Hook
 * Manages user wishlist functionality
 *
 * Features:
 * - Add/remove items from wishlist
 * - Check if item is in wishlist
 * - Get user's full wishlist
 * - Real-time updates via Supabase
 */

import logger from '@/lib/logger';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/med-mng/AuthProvider';

export interface WishlistItem {
  id: string;
  item_type: 'product' | 'course' | 'edn_item' | 'ecos_scenario' | 'playlist' | 'other';
  item_id: string;
  item_metadata?: {
    title?: string;
    price?: number;
    image_url?: string;
    description?: string;
    [key: string]: any;
  };
  priority?: number;
  notes?: string;
  tags?: string[];
  is_purchased?: boolean;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UseWishlistReturn {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  isInWishlist: (itemType: string, itemId: string) => boolean;
  addToWishlist: (itemType: string, itemId: string, metadata?: any) => Promise<boolean>;
  removeFromWishlist: (itemType: string, itemId: string) => Promise<boolean>;
  toggleWishlist: (itemType: string, itemId: string, metadata?: any) => Promise<boolean>;
  updatePriority: (wishlistId: string, priority: number) => Promise<boolean>;
  updateNotes: (wishlistId: string, notes: string) => Promise<boolean>;
  markAsPurchased: (wishlistId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

export const useWishlist = (): UseWishlistReturn => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_purchased', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setWishlist(data || []);
    } catch (err: any) {
      logger.error('Error fetching wishlist:', err);
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load wishlist on mount and user change
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Subscribe to real-time wishlist changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('wishlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWishlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWishlist]);

  // Check if item is in wishlist
  const isInWishlist = useCallback(
    (itemType: string, itemId: string): boolean => {
      return wishlist.some(
        (item) => item.item_type === itemType && item.item_id === itemId
      );
    },
    [wishlist]
  );

  // Add item to wishlist
  const addToWishlist = useCallback(
    async (itemType: string, itemId: string, metadata?: any): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to use wishlist');
        return false;
      }

      try {
        setError(null);

        const { error: insertError } = await supabase.from('wishlists').insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          item_metadata: metadata,
        });

        if (insertError) throw insertError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error adding to wishlist:', err);
        setError(err.message || 'Failed to add to wishlist');
        return false;
      }
    },
    [user, fetchWishlist]
  );

  // Remove item from wishlist
  const removeFromWishlist = useCallback(
    async (itemType: string, itemId: string): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to use wishlist');
        return false;
      }

      try {
        setError(null);

        const { error: deleteError } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (deleteError) throw deleteError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error removing from wishlist:', err);
        setError(err.message || 'Failed to remove from wishlist');
        return false;
      }
    },
    [user, fetchWishlist]
  );

  // Toggle item in wishlist (add if not exists, remove if exists)
  const toggleWishlist = useCallback(
    async (itemType: string, itemId: string, metadata?: any): Promise<boolean> => {
      if (!user) {
        setError('You must be logged in to use wishlist');
        return false;
      }

      try {
        setError(null);

        // Use the database function for atomic toggle
        const { data, error: rpcError } = await supabase.rpc('toggle_wishlist_item', {
          p_item_type: itemType,
          p_item_id: itemId,
          p_item_metadata: metadata,
        });

        if (rpcError) throw rpcError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error toggling wishlist:', err);
        setError(err.message || 'Failed to toggle wishlist');
        return false;
      }
    },
    [user, fetchWishlist]
  );

  // Update priority
  const updatePriority = useCallback(
    async (wishlistId: string, priority: number): Promise<boolean> => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from('wishlists')
          .update({ priority })
          .eq('id', wishlistId);

        if (updateError) throw updateError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error updating priority:', err);
        setError(err.message || 'Failed to update priority');
        return false;
      }
    },
    [fetchWishlist]
  );

  // Update notes
  const updateNotes = useCallback(
    async (wishlistId: string, notes: string): Promise<boolean> => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from('wishlists')
          .update({ notes })
          .eq('id', wishlistId);

        if (updateError) throw updateError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error updating notes:', err);
        setError(err.message || 'Failed to update notes');
        return false;
      }
    },
    [fetchWishlist]
  );

  // Mark as purchased
  const markAsPurchased = useCallback(
    async (wishlistId: string): Promise<boolean> => {
      try {
        setError(null);

        const { error: updateError } = await supabase
          .from('wishlists')
          .update({ is_purchased: true })
          .eq('id', wishlistId);

        if (updateError) throw updateError;

        await fetchWishlist();
        return true;
      } catch (err: any) {
        logger.error('Error marking as purchased:', err);
        setError(err.message || 'Failed to mark as purchased');
        return false;
      }
    },
    [fetchWishlist]
  );

  return {
    wishlist,
    loading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    updatePriority,
    updateNotes,
    markAsPurchased,
    refreshWishlist: fetchWishlist,
  };
};
