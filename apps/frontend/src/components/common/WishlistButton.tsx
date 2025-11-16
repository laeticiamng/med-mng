/**
 * Wishlist Button Component
 * Reusable button to add/remove items from wishlist
 *
 * Usage:
 * <WishlistButton
 *   itemType="product"
 *   itemId="shopify-123"
 *   itemMetadata={{ title: "Course Name", price: 49.99 }}
 * />
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  itemType: 'product' | 'course' | 'edn_item' | 'ecos_scenario' | 'playlist' | 'other';
  itemId: string;
  itemMetadata?: {
    title?: string;
    price?: number;
    image_url?: string;
    description?: string;
    [key: string]: any;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
  onToggle?: (isInWishlist: boolean) => void;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  itemType,
  itemId,
  itemMetadata,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  className,
  onToggle,
}) => {
  const { isInWishlist, toggleWishlist, loading } = useWishlist();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = React.useState(false);

  const inWishlist = isInWishlist(itemType, itemId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsToggling(true);

    const success = await toggleWishlist(itemType, itemId, itemMetadata);

    if (success) {
      const newState = !inWishlist;

      toast({
        title: newState ? 'Ajouté aux favoris' : 'Retiré des favoris',
        description: newState
          ? `${itemMetadata?.title || 'L\'item'} a été ajouté à votre liste de souhaits`
          : `${itemMetadata?.title || 'L\'item'} a été retiré de votre liste de souhaits`,
        duration: 3000,
      });

      onToggle?.(newState);
    } else {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
        duration: 3000,
      });
    }

    setIsToggling(false);
  };

  const isLoading = loading || isToggling;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'transition-all duration-200',
        inWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
      aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          inWishlist && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      {showText && (
        <span className="ml-2">{inWishlist ? 'Dans les favoris' : 'Ajouter aux favoris'}</span>
      )}
    </Button>
  );
};
