/**
 * Hook: usePosts
 * Manages post operations with React Query caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsService } from '@/services/posts.service'
import { Post, PostStatus } from '@/types/database-custom'
import { useAuth } from '@/contexts/AuthContext'

export const usePosts = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  // Fetch all published posts
  const useFetchPublishedPosts = (options?: {
    limit?: number
    offset?: number
    tags?: string[]
    sortBy?: 'recent' | 'popular' | 'mostliked'
  }) => {
    return useQuery({
      queryKey: ['posts', 'published', options?.sortBy, options?.tags, options?.offset],
      queryFn: () => postsService.getPublishedPosts(options),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  }

  // Fetch user's posts
  const useFetchUserPosts = (targetUserId?: string, status?: PostStatus) => {
    const fetchUserId = targetUserId || userId
    return useQuery({
      queryKey: ['posts', 'user', fetchUserId, status],
      queryFn: () => postsService.getUserPosts(fetchUserId!, { status }),
      enabled: !!fetchUserId,
    })
  }

  // Fetch single post
  const useFetchPost = (postId: string) => {
    return useQuery({
      queryKey: ['posts', postId],
      queryFn: () => postsService.getPost(postId),
      enabled: !!postId,
    })
  }

  // Fetch posts by tag
  const useFetchPostsByTag = (tag: string, limit?: number) => {
    return useQuery({
      queryKey: ['posts', 'tag', tag],
      queryFn: () => postsService.getPostsByTag(tag, limit || 20),
      enabled: !!tag,
    })
  }

  // Fetch trending posts
  const useFetchTrendingPosts = (limit?: number) => {
    return useQuery({
      queryKey: ['posts', 'trending'],
      queryFn: () => postsService.getTrendingPosts(limit || 10),
      staleTime: 1000 * 60 * 10, // 10 minutes
    })
  }

  // Search posts
  const useSearchPosts = (keyword: string, options?: {
    limit?: number
    offset?: number
  }) => {
    return useQuery({
      queryKey: ['posts', 'search', keyword, options?.offset],
      queryFn: () => postsService.searchPosts(keyword, options),
      enabled: keyword.length > 0,
      staleTime: 1000 * 60 * 2, // 2 minutes
    })
  }

  // Create post mutation
  const useCreatePost = () => {
    return useMutation({
      mutationFn: (params: {
        title: string
        content: string
        excerpt?: string
        tags?: string[]
        thumbnailUrl?: string
        status?: PostStatus
      }) => {
        if (!userId) throw new Error('User not authenticated')
        return postsService.createPost(userId, params.title, params.content, {
          excerpt: params.excerpt,
          tags: params.tags,
          thumbnailUrl: params.thumbnailUrl,
          status: params.status,
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', userId] })
      },
    })
  }

  // Update post mutation
  const useUpdatePost = (postId: string) => {
    return useMutation({
      mutationFn: (updates: any) => postsService.updatePost(postId, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', userId] })
      },
    })
  }

  // Delete post mutation
  const useDeletePost = (postId: string) => {
    return useMutation({
      mutationFn: () => postsService.deletePost(postId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', userId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'published'] })
      },
    })
  }

  // Publish post mutation
  const usePublishPost = (postId: string) => {
    return useMutation({
      mutationFn: () => postsService.publishPost(postId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'user', userId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'published'] })
      },
    })
  }

  // Like post mutation
  const useLikePost = (postId: string) => {
    return useMutation({
      mutationFn: () => {
        if (!userId) throw new Error('User not authenticated')
        return postsService.likePost(postId, userId)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'likes', postId, userId] })
      },
    })
  }

  // Unlike post mutation
  const useUnlikePost = (postId: string) => {
    return useMutation({
      mutationFn: () => {
        if (!userId) throw new Error('User not authenticated')
        return postsService.unlikePost(postId, userId)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'likes', postId, userId] })
      },
    })
  }

  // Check if user liked post
  const useHasUserLikedPost = (postId: string) => {
    return useQuery({
      queryKey: ['posts', 'likes', postId, userId],
      queryFn: () => {
        if (!userId) return false
        return postsService.hasUserLikedPost(postId, userId)
      },
      enabled: !!userId && !!postId,
    })
  }

  // Toggle like post
  const useToggleLikePost = (postId: string) => {
    const hasLiked = useHasUserLikedPost(postId)

    return useMutation({
      mutationFn: async () => {
        if (!userId) throw new Error('User not authenticated')
        const liked = await postsService.hasUserLikedPost(postId, userId)
        if (liked) {
          return postsService.unlikePost(postId, userId)
        } else {
          return postsService.likePost(postId, userId)
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['posts', postId] })
        queryClient.invalidateQueries({ queryKey: ['posts', 'likes', postId, userId] })
      },
    })
  }

  return {
    useFetchPublishedPosts,
    useFetchUserPosts,
    useFetchPost,
    useFetchPostsByTag,
    useFetchTrendingPosts,
    useSearchPosts,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
    usePublishPost,
    useLikePost,
    useUnlikePost,
    useHasUserLikedPost,
    useToggleLikePost,
  }
}
