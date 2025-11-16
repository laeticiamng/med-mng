import React from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useFavorites'
import { useToast } from '@/hooks/use-toast'

interface FavoritesButtonProps {
  itemId: string
  itemType: 'fiche' | 'post' | 'collection'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export const FavoritesButton: React.FC<FavoritesButtonProps> = ({
  itemId,
  itemType,
  showLabel = false,
  size = 'md',
  variant = 'ghost',
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const { useToggleFavorite, useIsFavorited } = useFavorites()

  const { data: isFavorited = false, isLoading: isCheckingFavorite } = useIsFavorited(
    itemId,
    itemType,
    user?.id
  )

  const toggleFavoriteMutation = useToggleFavorite()
  const isToggling = toggleFavoriteMutation.isPending

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Veuillez vous connecter pour ajouter aux favoris',
        variant: 'destructive',
      })
      return
    }

    try {
      await toggleFavoriteMutation.mutateAsync({
        itemId,
        itemType,
        userId: user.id,
      })

      toast({
        title: isFavorited ? 'Supprimé des favoris' : 'Ajouté aux favoris',
        description: isFavorited
          ? 'Cet élément a été supprimé de vos favoris'
          : 'Cet élément a été ajouté à vos favoris',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour des favoris',
        variant: 'destructive',
      })
    }
  }

  const buttonSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size]

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size]

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isToggling || isCheckingFavorite}
      variant={variant}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      className={`gap-2 transition-colors ${
        isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'
      }`}
    >
      <Heart
        className={`${iconSize} ${isFavorited ? 'fill-current' : ''}`}
        strokeWidth={isFavorited ? 0 : 2}
      />
      {showLabel && <span>{isFavorited ? 'En favoris' : 'Ajouter aux favoris'}</span>}
    </Button>
  )
}
