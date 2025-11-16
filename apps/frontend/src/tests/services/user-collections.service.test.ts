import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userCollectionsService } from '@/services/user-collections.service'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('userCollectionsService', () => {
  const mockUserId = 'user-123'
  const mockCollectionId = 'col-456'
  const mockItemId = 'item-789'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const mockResponse = {
        data: {
          id: mockCollectionId,
          user_id: mockUserId,
          name: 'My Collection',
          description: 'Test collection',
          color: 'blue',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

      const result = await userCollectionsService.createCollection(
        mockUserId,
        'My Collection',
        'Test collection',
        'blue'
      )

      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalledWith('user_collections')
    })
  })

  describe('updateCollection', () => {
    it('should update collection details', async () => {
      const mockResponse = {
        data: {
          id: mockCollectionId,
          name: 'Updated Collection',
        },
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockResponse),
        }),
      } as any)

      await expect(
        userCollectionsService.updateCollection(mockCollectionId, {
          name: 'Updated Collection',
        })
      ).resolves.not.toThrow()
    })
  })

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null, data: null }),
        }),
      } as any)

      await expect(
        userCollectionsService.deleteCollection(mockCollectionId)
      ).resolves.not.toThrow()
    })
  })

  describe('addItemToCollection', () => {
    it('should add item to collection', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'col-item-123' },
              error: null,
            }),
          }),
        }),
      } as any)

      await expect(
        userCollectionsService.addItemToCollection(mockCollectionId, mockItemId, 'post')
      ).resolves.not.toThrow()
    })
  })

  describe('removeItemFromCollection', () => {
    it('should remove item from collection', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null, data: null }),
          }),
        }),
      } as any)

      await expect(
        userCollectionsService.removeItemFromCollection(mockCollectionId, mockItemId, 'post')
      ).resolves.not.toThrow()
    })
  })

  describe('isItemInCollection', () => {
    it('should check if item is in collection', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: { id: 'col-item-123' }, error: null }),
          }),
        }),
      } as any)

      const result = await userCollectionsService.isItemInCollection(mockCollectionId, mockItemId)

      expect(result).toBe(true)
    })
  })
})
