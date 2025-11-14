import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/med-mng/AuthProvider';

/**
 * Product review
 */
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  imageUrls?: string[];
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  isVerifiedPurchase: boolean;
}

/**
 * Review summary
 */
export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

/**
 * Hook for Product Reviews
 *
 * Manages:
 * - Create/edit/delete reviews
 * - Rating system (1-5 stars)
 * - Photo uploads
 * - Helpful votes
 * - Review moderation
 *
 * @example
 * const { reviews, createReview, deleteReview } = useProductReviews();
 */
export const useProductReviews = (productId: string) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch reviews for product
   */
  const getReviews = useCallback(async (): Promise<ProductReview[]> => {
    if (!productId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (dbError) {
        throw dbError;
      }

      const reviewsList = (data || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name,
        userAvatar: r.user_avatar,
        rating: r.rating,
        title: r.title,
        content: r.content,
        imageUrls: r.image_urls || [],
        helpfulCount: r.helpful_count || 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        isVerifiedPurchase: r.is_verified_purchase || false,
      }));

      setReviews(reviewsList);

      // Calculate summary
      if (reviewsList.length > 0) {
        const avgRating =
          reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
        const distribution: { [key: number]: number } = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };

        reviewsList.forEach((r) => {
          distribution[r.rating]++;
        });

        setSummary({
          totalReviews: reviewsList.length,
          averageRating: Math.round(avgRating * 10) / 10,
          ratingDistribution: distribution,
        });
      }

      return reviewsList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  /**
   * Create a new review
   */
  const createReview = useCallback(
    async (
      rating: number,
      title: string,
      content: string,
      imageUrls?: string[]
    ): Promise<ProductReview | null> => {
      if (!user?.id || !productId) return null;

      if (rating < 1 || rating > 5) {
        setError('Rating must be between 1 and 5');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('product_reviews')
          .insert({
            product_id: productId,
            user_id: user.id,
            user_name: user.email || 'Anonymous',
            rating,
            title,
            content,
            image_urls: imageUrls || [],
            is_verified_purchase: false, // Would need order verification
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        const newReview: ProductReview = {
          id: data.id,
          productId: data.product_id,
          userId: data.user_id,
          userName: data.user_name,
          rating: data.rating,
          title: data.title,
          content: data.content,
          imageUrls: data.image_urls || [],
          helpfulCount: 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isVerifiedPurchase: data.is_verified_purchase,
        };

        await getReviews();
        return newReview;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create review';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, productId, getReviews]
  );

  /**
   * Update review
   */
  const updateReview = useCallback(
    async (
      reviewId: string,
      rating?: number,
      title?: string,
      content?: string
    ): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        const updates: Record<string, any> = {};
        if (rating !== undefined) updates.rating = rating;
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;

        const { error: dbError } = await supabase
          .from('product_reviews')
          .update(updates)
          .eq('id', reviewId)
          .eq('user_id', user.id);

        if (dbError) {
          throw dbError;
        }

        await getReviews();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update review';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getReviews]
  );

  /**
   * Delete review
   */
  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      if (!user?.id) return false;

      setIsLoading(true);
      setError(null);

      try {
        const { error: dbError } = await supabase
          .from('product_reviews')
          .delete()
          .eq('id', reviewId)
          .eq('user_id', user.id);

        if (dbError) {
          throw dbError;
        }

        await getReviews();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete review';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, getReviews]
  );

  /**
   * Mark review as helpful
   */
  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.rpc('increment_helpful_votes', {
        review_id: reviewId,
      });

      if (dbError) {
        throw dbError;
      }

      await getReviews();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark helpful';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getReviews]);

  /**
   * Check if user has already reviewed
   */
  const userHasReviewed = useCallback((): boolean => {
    if (!user?.id) return false;
    return reviews.some((r) => r.userId === user.id);
  }, [user?.id, reviews]);

  // Load reviews on mount
  useEffect(() => {
    if (productId) {
      getReviews();
    }
  }, [productId, getReviews]);

  return {
    reviews,
    summary,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    userHasReviewed,
    isLoading,
    error,
  };
};

export default useProductReviews;
