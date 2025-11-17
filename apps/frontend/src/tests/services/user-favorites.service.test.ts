import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userFavoritesService } from '@shared/services/user-favorites.service'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('userFavoritesService', () => {
  const mockUserId = 'user-123'
  const mockItemId = 'item-456'
  const mockItemType = 'post'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addFavorite', () => {
    it('should add an item to favorites', async () => {
      const mockResponse = {
        data: {
          id: 'fav-123',
          user_id: mockUserId,
          item_id: mockItemId,
          item_type: mockItemType,
          created_at: new Date().toISOString(),
        },
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any)

      const result = await userFavoritesService.addFavorite(
        mockUserId,
        mockItemId,
        mockItemType as 'fiche' | 'post' | 'collection'
      )

      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalledWith('user_favorites')
    })

    it('should throw error when insert fails', async () => {
      const mockError = new Error('Database error')

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ error: mockError, data: null }),
          }),
        }),
      } as any)

      await expect(
        userFavoritesService.addFavorite(
          mockUserId,
          mockItemId,
          mockItemType as 'fiche' | 'post' | 'collection'
        )
      ).rejects.toThrow()
    })
  })

  describe('removeFavorite', () => {
    it('should remove an item from favorites', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null, data: null }),
          }),
        }),
      } as any)

      await expect(
        userFavoritesService.removeFavorite(
          mockUserId,
          mockItemId,
          mockItemType as 'fiche' | 'post' | 'collection'
        )
      ).resolves.not.toThrow()
    })
  })

  describe('isFavorited', () => {
    it('should return true if item is favorited', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: { id: 'fav-123' }, error: null }),
          }),
        }),
      } as any)

      const result = await userFavoritesService.isFavorited(
        mockUserId,
        mockItemId,
        mockItemType as 'fiche' | 'post' | 'collection'
      )

      expect(result).toBe(true)
    })

    it('should return false if item is not favorited', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any)

      const result = await userFavoritesService.isFavorited(
        mockUserId,
        mockItemId,
        mockItemType as 'fiche' | 'post' | 'collection'
      )

      expect(result).toBe(false)
    })
  })

  describe('getUserFavorites', () => {
    it('should fetch user favorites', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          user_id: mockUserId,
          item_id: 'item-1',
          item_type: 'post',
          created_at: new Date().toISOString(),
        },
        {
          id: 'fav-2',
          user_id: mockUserId,
          item_id: 'item-2',
          item_type: 'fiche',
          created_at: new Date().toISOString(),
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockFavorites, error: null }),
        }),
      } as any)

      const result = await userFavoritesService.getUserFavorites(mockUserId)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })
  })

  describe('getFavoriteCount', () => {
    it('should return count of user favorites', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            count: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        }),
      } as any)

      const result = await userFavoritesService.getFavoriteCount(mockUserId)

      expect(result).toBe(5)
    })
  })
})
