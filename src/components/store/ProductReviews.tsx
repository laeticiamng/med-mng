import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, ThumbsUp, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Props for ProductReviews component
 */
interface ProductReviewsProps {
  /**
   * Product ID
   */
  productId: string;

  /**
   * Product name
   */
  productName?: string;
}

/**
 * ProductReviews Component
 *
 * Display product reviews and review submission form
 */
export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName = 'Product',
}) => {
  const { user } = useAuth();
  const {
    reviews,
    summary,
    createReview,
    deleteReview,
    markHelpful,
    userHasReviewed,
    isLoading,
    error,
  } = useProductReviews(productId);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Handle review submission
   */
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createReview(rating, title, content);
      if (success) {
        toast.success('Review posted successfully!');
        setRating(5);
        setTitle('');
        setContent('');
      } else {
        toast.error('Failed to post review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete review
   */
  const handleDeleteReview = async (reviewId: string) => {
    if (
      confirm('Are you sure you want to delete this review? This action cannot be undone.')
    ) {
      const success = await deleteReview(reviewId);
      if (success) {
        toast.success('Review deleted');
      }
    }
  };

  /**
   * Render stars
   */
  const renderStars = (value: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={cn('transition-colors', interactive && 'cursor-pointer hover:scale-110')}
          >
            <Star
              className={cn(
                'h-4 w-4 sm:h-5 sm:w-5',
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Section */}
      {summary && summary.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>{summary.totalReviews} reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rating Summary */}
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {summary.averageRating}
                  </div>
                  <div className="flex justify-center my-2">
                    {renderStars(Math.round(summary.averageRating))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {summary.totalReviews} verified reviews
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium min-w-fit">{rating} stars</span>
                    <Progress
                      value={
                        ((summary.ratingDistribution[rating] || 0) /
                          summary.totalReviews) *
                        100
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-fit">
                      {summary.ratingDistribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Form */}
      {user && !userHasReviewed() && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>Share your experience with {productName}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Rating</Label>
                <div className="flex gap-2">{renderStars(rating, true)}</div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Review Title
                </Label>
                <Input
                  id="title"
                  placeholder="Summarize your review..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content" className="text-sm font-medium">
                  Your Review
                </Label>
                <Textarea
                  id="content"
                  placeholder="Tell us about your experience..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSubmitting}
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{review.userName}</h4>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user?.id === review.userId && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                </div>

                {/* Title & Content */}
                <h5 className="font-medium text-sm mb-1">{review.title}</h5>
                <p className="text-sm text-muted-foreground mb-4">{review.content}</p>

                {/* Helpful */}
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
