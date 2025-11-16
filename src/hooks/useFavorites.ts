import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userFavoritesService } from '@/services/user-favorites.service'
import { ItemType, UserFavorite } from '@/types/database-custom'
import { useAuth } from '@/hooks/useAuth'

interface FavoriteItem {
  id: string
  type: 'route' | 'edn-item'
  label: string
  path: string
  addedAt: number
}

const STORAGE_KEY = 'med-mng-favorites'

/**
 * Hook: useFavorites
 * Manages user favorites with support for both local storage and Supabase
 * Falls back to localStorage for offline support
 */
export const useFavorites = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  // Fallback to localStorage for local favorites
  const useLocalFavorites = () => {
    const [localFavorites, setLocalFavorites] = React.useState<FavoriteItem[]>([])

    React.useEffect(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setLocalFavorites(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading local favorites:', error)
        }
      }
    }, [])

    React.useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localFavorites))
    }, [localFavorites])

    return { localFavorites, setLocalFavorites }
  }

  // Fetch favorites from Supabase
  const useFetchFavorites = (itemType?: ItemType, limit?: number) => {
    return useQuery({
      queryKey: ['favorites', userId, itemType, limit],
      queryFn: async () => {
        if (!userId) throw new Error('User not authenticated')
        return userFavoritesService.getUserFavorites(userId, itemType, limit)
      },
      enabled: !!userId,
    })
  }

  // Check if item is favorited
  const useIsFavorited = (itemType: ItemType, itemId: string) => {
    return useQuery({
      queryKey: ['favorite', userId, itemType, itemId],
      queryFn: async () => {
        if (!userId) throw new Error('User not authenticated')
        return userFavoritesService.isFavorited(userId, itemType, itemId)
      },
      enabled: !!userId,
    })
  }

  // Get favorite count
  const useFavoriteCount = (itemType?: ItemType) => {
    return useQuery({
      queryKey: ['favoriteCount', userId, itemType],
      queryFn: async () => {
        if (!userId) throw new Error('User not authenticated')
        return userFavoritesService.getFavoriteCount(userId, itemType)
      },
      enabled: !!userId,
    })
  }

  // Add favorite mutation
  const useAddFavorite = () => {
    return useMutation({
      mutationFn: async ({
        itemType,
        itemId,
        itemData,
      }: {
        itemType: ItemType
        itemId: string
        itemData?: Record<string, any>
      }) => {
        if (!userId) throw new Error('User not authenticated')
        return userFavoritesService.addFavorite(
          userId,
          itemType,
          itemId,
          itemData
        )
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['favorites', userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favorite', userId, variables.itemType, variables.itemId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favoriteCount', userId],
        })
      },
    })
  }

  // Remove favorite mutation
  const useRemoveFavorite = () => {
    return useMutation({
      mutationFn: async ({
        itemType,
        itemId,
      }: {
        itemType: ItemType
        itemId: string
      }) => {
        if (!userId) throw new Error('User not authenticated')
        return userFavoritesService.removeFavorite(userId, itemType, itemId)
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['favorites', userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favorite', userId, variables.itemType, variables.itemId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favoriteCount', userId],
        })
      },
    })
  }

  // Toggle favorite mutation
  const useToggleFavorite = () => {
    return useMutation({
      mutationFn: async ({
        itemType,
        itemId,
        itemData,
      }: {
        itemType: ItemType
        itemId: string
        itemData?: Record<string, any>
      }) => {
        if (!userId) throw new Error('User not authenticated')
        const isFav = await userFavoritesService.isFavorited(
          userId,
          itemType,
          itemId
        )
        if (isFav) {
          return userFavoritesService.removeFavorite(userId, itemType, itemId)
        } else {
          return userFavoritesService.addFavorite(
            userId,
            itemType,
            itemId,
            itemData
          )
        }
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['favorites', userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favorite', userId, variables.itemType, variables.itemId],
        })
        queryClient.invalidateQueries({
          queryKey: ['favoriteCount', userId],
        })
      },
    })
  }

  const { localFavorites, setLocalFavorites } = useLocalFavorites()

  const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    setLocalFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) {
        return prev
      }
      return [...prev, { ...item, addedAt: Date.now() }]
    })
  }

  const removeFavorite = (id: string) => {
    setLocalFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  const isFavorite = (id: string) => {
    return localFavorites.some((f) => f.id === id)
  }

  const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id)
    } else {
      addFavorite(item)
    }
  }

  const clearFavorites = () => {
    setLocalFavorites([])
  }

  return {
    // Local favorites (for backward compatibility)
    favorites: localFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    // Supabase hooks
    useFetchFavorites,
    useIsFavorited,
    useFavoriteCount,
    useAddFavorite,
    useRemoveFavorite,
    useToggleFavorite,
  }
}
