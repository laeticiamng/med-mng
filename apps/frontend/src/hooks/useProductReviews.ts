/**
 * Product Reviews Hook
 * Manages product reviews and ratings
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface ProductReview {
  id: string;
  user_id: string;
  user_email?: string;
  rating: number;
  title: string;
  review_text: string;
  purchase_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  unhelpful_count: number;
  seller_response?: string;
  created_at: string;
  media_count: number;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  verified_purchases: number;
  featured_reviews: number;
}

export interface UseProductReviewsReturn {
  reviews: ProductReview[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  userReview: ProductReview | null;
  canReview: boolean;
  createReview: (data: {
    rating: number;
    title: string;
    review_text: string;
    quality_rating?: number;
    value_rating?: number;
  }) => Promise<boolean>;
  updateReview: (reviewId: string, data: Partial<ProductReview>) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  voteReview: (reviewId: string, voteType: 'helpful' | 'unhelpful') => Promise<boolean>;
  refreshReviews: () => Promise<void>;
}

export const useProductReviews = (
  productId: string,
  productType: string = 'shopify',
  sortBy: 'helpful' | 'recent' | 'rating_high' | 'rating_low' = 'helpful'
): UseProductReviewsReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews and stats
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_product_review_stats',
        {
          p_product_id: productId,
          p_product_type: productType,
        }
      );

      if (statsError) throw statsError;
      setStats(statsData[0] || null);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase.rpc(
        'get_product_reviews',
        {
          p_product_id: productId,
          p_product_type: productType,
          p_limit: 50,
          p_offset: 0,
          p_sort_by: sortBy,
        }
      );

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);

      // Fetch user's review if logged in
      if (user) {
        const { data: userReviewData, error: userReviewError } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('product_type', productType)
          .eq('user_id', user.id)
          .single();

        if (userReviewError && userReviewError.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          throw userReviewError;
        }

        setUserReview(userReviewData || null);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, productType, sortBy, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Check if user can review (logged in and hasn't reviewed yet)
  const canReview = !!user && !userReview;

  // Create review
  const createReview = useCallback(
    async (data: {
      rating: number;
      title: string;
      review_text: string;
      quality_rating?: number;
      value_rating?: number;
    }): Promise<boolean> => {
      if (!user) {
        toast({
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour laisser un avis',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const { error } = await supabase.from('product_reviews').insert({
          product_id: productId,
          product_type: productType,
          user_id: user.id,
          ...data,
        });

        if (error) throw error;

        toast({
          title: 'Avis publié',
          description: 'Merci pour votre avis !',
        });

        await fetchReviews();
        return true;
      } catch (err: any) {
        console.error('Error creating review:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de publier l\'avis',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, productId, productType, fetchReviews, toast]
  );

  // Update review
  const updateReview = useCallback(
    async (reviewId: string, data: Partial<ProductReview>): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('product_reviews')
          .update(data)
          .eq('id', reviewId);

        if (error) throw error;

        toast({
          title: 'Avis mis à jour',
          description: 'Votre avis a été modifié',
        });

        await fetchReviews();
        return true;
      } catch (err: any) {
        console.error('Error updating review:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de modifier l\'avis',
          variant: 'destructive',
        });
        return false;
      }
    },
    [fetchReviews, toast]
  );

  // Delete review
  const deleteReview = useCallback(
    async (reviewId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('product_reviews')
          .delete()
          .eq('id', reviewId);

        if (error) throw error;

        toast({
          title: 'Avis supprimé',
          description: 'Votre avis a été supprimé',
        });

        await fetchReviews();
        return true;
      } catch (err: any) {
        console.error('Error deleting review:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'avis',
          variant: 'destructive',
        });
        return false;
      }
    },
    [fetchReviews, toast]
  );

  // Vote on review
  const voteReview = useCallback(
    async (reviewId: string, voteType: 'helpful' | 'unhelpful'): Promise<boolean> => {
      if (!user) {
        toast({
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour voter',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const { data, error } = await supabase.rpc('toggle_review_vote', {
          p_review_id: reviewId,
          p_vote_type: voteType,
        });

        if (error) throw error;

        const action = data?.action;
        if (action === 'added' || action === 'changed') {
          toast({
            title: 'Vote enregistré',
            description: `Merci pour votre retour`,
          });
        }

        await fetchReviews();
        return true;
      } catch (err: any) {
        console.error('Error voting review:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible d\'enregistrer le vote',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, fetchReviews, toast]
  );

  return {
    reviews,
    stats,
    loading,
    error,
    userReview,
    canReview,
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    refreshReviews: fetchReviews,
  };
};
