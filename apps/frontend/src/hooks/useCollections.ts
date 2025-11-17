import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userCollectionsService } from '@shared/services/user-collections.service'

export const useCollections = () => {
  const queryClient = useQueryClient()

  /**
   * Create a new collection
   */
  const useCreateCollection = () => {
    return useMutation({
      mutationFn: (params: {
        userId: string
        name: string
        description?: string
        color?: string
      }) => {
        return userCollectionsService.createCollection(
          params.userId,
          params.name,
          params.description,
          params.color
        )
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['collections', 'user', params.userId],
        })
      },
    })
  }

  /**
   * Update a collection
   */
  const useUpdateCollection = () => {
    return useMutation({
      mutationFn: (params: {
        collectionId: string
        userId: string
        name?: string
        description?: string
        color?: string
      }) => {
        return userCollectionsService.updateCollection(
          params.collectionId,
          {
            name: params.name,
            description: params.description,
            color: params.color,
          }
        )
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['collections', 'user', params.userId],
        })
        queryClient.invalidateQueries({
          queryKey: ['collection', params.collectionId],
        })
      },
    })
  }

  /**
   * Delete a collection
   */
  const useDeleteCollection = () => {
    return useMutation({
      mutationFn: (params: { collectionId: string; userId: string }) => {
        return userCollectionsService.deleteCollection(params.collectionId)
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['collections', 'user', params.userId],
        })
      },
    })
  }

  /**
   * Fetch user's collections
   */
  const useFetchCollections = (userId?: string) => {
    return useQuery({
      queryKey: ['collections', 'user', userId],
      queryFn: async () => {
        if (!userId) return []
        // Get user collections - need to implement in service
        return []
      },
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  /**
   * Fetch collection details with items
   */
  const useFetchCollection = (collectionId?: string) => {
    return useQuery({
      queryKey: ['collection', collectionId],
      queryFn: async () => {
        if (!collectionId) return null
        // Get collection with items
        return null
      },
      enabled: !!collectionId,
      staleTime: 3 * 60 * 1000, // 3 minutes
    })
  }

  /**
   * Add item to collection
   */
  const useAddToCollection = () => {
    return useMutation({
      mutationFn: (params: {
        collectionId: string
        itemId: string
        itemType: 'fiche' | 'post' | 'collection'
      }) => {
        return userCollectionsService.addItemToCollection(
          params.collectionId,
          params.itemId,
          params.itemType
        )
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['collection', params.collectionId],
        })
      },
    })
  }

  /**
   * Remove item from collection
   */
  const useRemoveFromCollection = () => {
    return useMutation({
      mutationFn: (params: {
        collectionId: string
        itemId: string
        itemType: 'fiche' | 'post' | 'collection'
      }) => {
        return userCollectionsService.removeItemFromCollection(
          params.collectionId,
          params.itemId,
          params.itemType
        )
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['collection', params.collectionId],
        })
      },
    })
  }

  /**
   * Check if item is in collection
   */
  const useIsItemInCollection = (
    collectionId?: string,
    itemId?: string
  ) => {
    return useQuery({
      queryKey: ['collection', 'hasItem', collectionId, itemId],
      queryFn: async () => {
        if (!collectionId || !itemId) return false
        return await userCollectionsService.isItemInCollection(
          collectionId,
          itemId
        )
      },
      enabled: !!collectionId && !!itemId,
    })
  }

  /**
   * Get collections for an item
   */
  const useFetchCollectionsForItem = (
    itemId?: string,
    userId?: string
  ) => {
    return useQuery({
      queryKey: ['collections', 'forItem', itemId, userId],
      queryFn: async () => {
        if (!itemId || !userId) return []
        return await userCollectionsService.getCollectionsForItem(
          itemId,
          userId
        )
      },
      enabled: !!itemId && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  return {
    useCreateCollection,
    useUpdateCollection,
    useDeleteCollection,
    useFetchCollections,
    useFetchCollection,
    useAddToCollection,
    useRemoveFromCollection,
    useIsItemInCollection,
    useFetchCollectionsForItem,
  }
}
