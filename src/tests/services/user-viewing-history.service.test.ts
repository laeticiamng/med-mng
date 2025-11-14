import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userViewingHistoryService } from '@/services/user-viewing-history.service'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('userViewingHistoryService', () => {
  const mockUserId = 'user-123'
  const mockItemId = 'item-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('recordView', () => {
    it('should record a view', async () => {
      const mockResponse = {
        data: {
          id: 'view-123',
          user_id: mockUserId,
          item_id: mockItemId,
          item_type: 'post',
          view_source: 'detail',
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

      const result = await userViewingHistoryService.recordView({
        user_id: mockUserId,
        item_id: mockItemId,
        item_type: 'post',
        view_source: 'detail',
      })

      expect(result).toBeDefined()
      expect(supabase.from).toHaveBeenCalledWith('user_viewing_history')
    })
  })

  describe('getUserHistory', () => {
    it('should fetch user viewing history', async () => {
      const mockHistory = [
        {
          id: 'view-1',
          user_id: mockUserId,
          item_id: 'item-1',
          item_type: 'post',
          created_at: new Date().toISOString(),
        },
        {
          id: 'view-2',
          user_id: mockUserId,
          item_id: 'item-2',
          item_type: 'fiche',
          created_at: new Date().toISOString(),
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockHistory, error: null }),
          }),
        }),
      } as any)

      const result = await userViewingHistoryService.getUserHistory(mockUserId)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })
  })

  describe('getRecentViews', () => {
    it('should fetch recent views with limit', async () => {
      const mockViews = [
        { id: 'view-1', item_id: 'item-1', created_at: new Date().toISOString() },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockViews, error: null }),
            }),
          }),
        }),
      } as any)

      const result = await userViewingHistoryService.getRecentViews(mockUserId, 5)

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('clearHistory', () => {
    it('should clear user viewing history', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null, data: null }),
        }),
      } as any)

      await expect(
        userViewingHistoryService.clearHistory(mockUserId)
      ).resolves.not.toThrow()
    })
  })

  describe('getViewingStats', () => {
    it('should return viewing statistics', async () => {
      const mockStats = {
        total_views: 100,
        unique_items: 25,
        today_views: 10,
        week_views: 45,
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockStats, error: null }),
        }),
      } as any)

      const result = await userViewingHistoryService.getViewingStats(mockUserId)

      expect(result).toBeDefined()
    })
  })
})
