import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/components/med-mng/AuthProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Props for FavoriteButton
 */
interface FavoriteButtonProps {
  /**
   * Item ID to favorite
   */
  itemId: string;

  /**
   * Type of item
   */
  itemType?: 'edn' | 'ecos' | 'song' | 'product';

  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg' | 'icon';

  /**
   * Button variant
   */
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';

  /**
   * Callback when favorite state changes
   */
  onToggle?: (isFavorite: boolean) => void;

  /**
   * Additional metadata to save
   */
  metadata?: Record<string, any>;

  /**
   * Custom class names
   */
  className?: string;

  /**
   * Show label text
   */
  showLabel?: boolean;

  /**
   * Custom tooltip text
   */
  tooltipText?: string;

  /**
   * Callback when not authenticated
   */
  onNotAuthenticated?: () => void;
}

/**
 * FavoriteButton Component
 *
 * Allows users to add/remove items from their favorites.
 * - Persists to Supabase
 * - Falls back to localStorage
 * - Tracks analytics events
 * - Optimistic updates
 *
 * @example
 * // Basic usage
 * <FavoriteButton itemId="123" itemType="edn" />
 *
 * @example
 * // With callback
 * <FavoriteButton
 *   itemId="456"
 *   itemType="song"
 *   onToggle={(isFavorite) => console.log('Favorited:', isFavorite)}
 * />
 *
 * @example
 * // Full customization
 * <FavoriteButton
 *   itemId="789"
 *   itemType="product"
 *   size="lg"
 *   variant="outline"
 *   showLabel
 *   onNotAuthenticated={() => navigate('/login')}
 * />
 */
export const FavoriteButton = React.forwardRef<HTMLButtonElement, FavoriteButtonProps>(
  (
    {
      itemId,
      itemType = 'edn',
      size = 'md',
      variant = 'ghost',
      onToggle,
      metadata,
      className,
      showLabel = false,
      tooltipText,
      onNotAuthenticated,
    },
    ref
  ) => {
    const { user } = useAuth();
    const { isFavorited, toggleFavorite, isPending } = useFavorites({ itemType });
    const [isAnimating, setIsAnimating] = useState(false);

    const isFav = isFavorited(itemId);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        onNotAuthenticated?.();
        return;
      }

      // Animate
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      try {
        await toggleFavorite(itemId, itemType, metadata);

        // Track analytics
        analyticsService.trackEvent(
          isFav ? 'favorite_removed' : 'favorite_added',
          {
            itemId,
            itemType,
            metadata,
          }
        );

        // Callback
        onToggle?.(!isFav);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    };

    const buttonContent = (
      <>
        <Heart
          className={cn(
            'transition-all duration-300',
            size === 'icon' ? 'w-4 h-4' : 'w-5 h-5',
            isFav && 'fill-current text-red-500',
            !isFav && 'text-muted-foreground',
            isAnimating && 'scale-125'
          )}
        />
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {isFav ? 'Saved' : 'Save'}
          </span>
        )}
      </>
    );

    const button = (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isPending}
        size={size}
        variant={variant}
        className={cn(
          'transition-all duration-200',
          isFav && variant === 'ghost' && 'hover:bg-red-50 dark:hover:bg-red-950',
          isFav && variant !== 'ghost' && 'border-red-200 hover:border-red-300',
          className
        )}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFav}
      >
        {buttonContent}
      </Button>
    );

    // Wrap with tooltip if provided
    if (tooltipText) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  }
);

FavoriteButton.displayName = 'FavoriteButton';

export default FavoriteButton;
