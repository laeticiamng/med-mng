import { describe, it, expect, beforeEach, vi } from 'vitest'
import { postsService } from '@/services/posts.service'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('postsService', () => {
  const mockUserId = 'user-123'
  const mockPostId = 'post-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockResponse = {
        data: {
          id: mockPostId,
          user_id: mockUserId,
          title: 'Test Post',
          content: 'This is test content',
          excerpt: 'Test excerpt',
          status: 'published',
          tags: ['test'],
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

      const result = await postsService.createPost(
        mockUserId,
        'Test Post',
        'This is test content',
        'Test excerpt',
        ['test'],
        'published'
      )

      expect(result).toBeDefined()
      expect(result.title).toBe('Test Post')
      expect(result.user_id).toBe(mockUserId)
    })
  })

  describe('getPost', () => {
    it('should fetch a post by id', async () => {
      const mockPost = {
        id: mockPostId,
        user_id: mockUserId,
        title: 'Test Post',
        content: 'Test content',
        status: 'published',
      }

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockPost, error: null }),
        }),
      } as any)

      const result = await postsService.getPost(mockPostId)

      expect(result).toBeDefined()
      expect(result?.id).toBe(mockPostId)
    })
  })

  describe('getPublishedPosts', () => {
    it('should fetch published posts', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Post 1', status: 'published' },
        { id: 'post-2', title: 'Post 2', status: 'published' },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockPosts, error: null }),
          }),
        }),
      } as any)

      const result = await postsService.getPublishedPosts()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
    })
  })

  describe('incrementViewCount', () => {
    it('should increment post view count', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null })

      await expect(postsService.incrementViewCount(mockPostId)).resolves.not.toThrow()

      expect(supabase.rpc).toHaveBeenCalled()
    })
  })

  describe('likePost', () => {
    it('should add a like to a post', async () => {
      const mockResponse = {
        data: { id: 'like-123' },
        error: null,
      }

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      } as any)

      await expect(
        postsService.likePost(mockPostId, mockUserId)
      ).resolves.not.toThrow()
    })
  })

  describe('unlikePost', () => {
    it('should remove a like from a post', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as any)

      await expect(
        postsService.unlikePost(mockPostId, mockUserId)
      ).resolves.not.toThrow()
    })
  })

  describe('deletePost', () => {
    it('should delete a post', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      } as any)

      await expect(postsService.deletePost(mockPostId)).resolves.not.toThrow()
    })
  })
})
