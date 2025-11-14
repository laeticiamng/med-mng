import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFavorites } from '@/hooks/useFavorites'
import * as favoritesService from '@/services/user-favorites.service'

vi.mock('@/services/user-favorites.service')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useFavorites hook', () => {
  const mockUserId = 'user-123'
  const mockItemId = 'item-456'
  const mockItemType = 'post'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useIsFavorited', () => {
    it('should return favorited status', async () => {
      vi.spyOn(favoritesService, 'isFavorited').mockResolvedValue(true)

      const { result } = renderHook(
        () => useFavorites().useIsFavorited(mockItemId, mockItemType as any, mockUserId),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe(true)
    })
  })

  describe('useFetchFavorites', () => {
    it('should fetch user favorites', async () => {
      const mockFavorites = [
        { id: 'fav-1', item_id: 'item-1', item_type: 'post', item_name: 'Post 1' },
        { id: 'fav-2', item_id: 'item-2', item_type: 'fiche', item_name: 'Fiche 1' },
      ]

      vi.spyOn(favoritesService, 'getUserFavorites').mockResolvedValue(mockFavorites as any)

      const { result } = renderHook(
        () => useFavorites().useFetchFavorites(mockUserId),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(Array.isArray(result.current.data)).toBe(true)
      expect(result.current.data?.length).toBe(2)
    })
  })

  describe('useToggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const addFavoriteSpy = vi.spyOn(favoritesService, 'addFavorite').mockResolvedValue({} as any)

      const { result } = renderHook(() => useFavorites().useToggleFavorite(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        itemId: mockItemId,
        itemType: mockItemType as any,
        userId: mockUserId,
      })

      await waitFor(() => {
        expect(addFavoriteSpy).toHaveBeenCalled()
      })
    })
  })
})
