import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsService, Post, PostCategory } from '@/services/posts.service'

// Query keys for cache invalidation
const postsKeys = {
  all: ['posts'] as const,
  feed: () => [...postsKeys.all, 'feed'] as const,
  userPosts: (userId: string) => [...postsKeys.all, 'user', userId] as const,
  post: (postId: string) => [...postsKeys.all, 'post', postId] as const,
  comments: (postId: string) => [...postsKeys.all, 'comments', postId] as const,
  search: (query: string) => [...postsKeys.all, 'search', query] as const,
  trending: () => [...postsKeys.all, 'trending'] as const,
  category: (category: PostCategory) => [...postsKeys.all, 'category', category] as const,
  bookmarks: (userId: string) => [...postsKeys.all, 'bookmarks', userId] as const,
}

/**
 * Fetch feed posts
 */
export function useFetchFeedPosts(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.feed(), limit, offset],
    queryFn: async () => {
      const result = await postsService.getFeedPosts(limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Fetch user's posts
 */
export function useFetchUserPosts(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.userPosts(userId), limit, offset],
    queryFn: async () => {
      const result = await postsService.getUserPosts(userId, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Fetch a specific post
 */
export function useFetchPost(postId: string) {
  return useQuery({
    queryKey: postsKeys.post(postId),
    queryFn: async () => {
      const result = await postsService.getPost(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60, // 1 minute
    enabled: !!postId,
  })
}

/**
 * Create a post
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      title: string
      content: string
      description?: string
      imageUrl?: string
      category?: PostCategory
      tags?: string[]
    }) => {
      const result = await postsService.createPost(params.title, params.content, {
        description: params.description,
        imageUrl: params.imageUrl,
        category: params.category,
        tags: params.tags,
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() })
    },
  })
}

/**
 * Update a post
 */
export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<Post>) => {
      const result = await postsService.updatePost(postId, updates)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(postId) })
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() })
    },
  })
}

/**
 * Delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await postsService.deletePost(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(postId) })
      queryClient.invalidateQueries({ queryKey: postsKeys.feed() })
    },
  })
}

/**
 * Like a post
 */
export function useLikePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await postsService.likePost(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(postId) })
    },
  })
}

/**
 * Unlike a post
 */
export function useUnlikePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await postsService.unlikePost(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(postId) })
    },
  })
}

/**
 * Create a comment
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { content: string; parentCommentId?: string }) => {
      const result = await postsService.createComment(postId, params.content, params.parentCommentId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.comments(postId) })
      queryClient.invalidateQueries({ queryKey: postsKeys.post(postId) })
    },
  })
}

/**
 * Fetch post comments
 */
export function useFetchPostComments(postId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.comments(postId), limit, offset],
    queryFn: async () => {
      const result = await postsService.getPostComments(postId, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!postId,
  })
}

/**
 * Fetch comment replies
 */
export function useFetchCommentReplies(commentId: string) {
  return useQuery({
    queryKey: [...postsKeys.comments(''), 'replies', commentId],
    queryFn: async () => {
      const result = await postsService.getCommentReplies(commentId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!commentId,
  })
}

/**
 * Update a comment
 */
export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { commentId: string; content: string }) => {
      const result = await postsService.updateComment(params.commentId, params.content)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.comments(postId) })
    },
  })
}

/**
 * Delete a comment
 */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await postsService.deleteComment(commentId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.comments(postId) })
    },
  })
}

/**
 * Bookmark a post
 */
export function useBookmarkPost(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await postsService.bookmarkPost(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.bookmarks(userId) })
    },
  })
}

/**
 * Remove bookmark
 */
export function useRemoveBookmark(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await postsService.removeBookmark(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.bookmarks(userId) })
    },
  })
}

/**
 * Fetch user's bookmarks
 */
export function useFetchBookmarks(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.bookmarks(userId), limit, offset],
    queryFn: async () => {
      const result = await postsService.getUserBookmarks(userId, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

/**
 * Search posts
 */
export function useSearchPosts(query: string, enabled = false, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.search(query), limit, offset],
    queryFn: async () => {
      const result = await postsService.searchPosts(query, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && query.length > 2,
  })
}

/**
 * Fetch trending posts
 */
export function useFetchTrendingPosts(limit = 10) {
  return useQuery({
    queryKey: [...postsKeys.trending(), limit],
    queryFn: async () => {
      const result = await postsService.getTrendingPosts(limit)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Fetch posts by category
 */
export function useFetchPostsByCategory(category: PostCategory, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.category(category), limit, offset],
    queryFn: async () => {
      const result = await postsService.getPostsByCategory(category, limit, offset)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!category,
  })
}

/**
 * Increment post views
 */
export function useIncrementPostViews(postId: string) {
  return useMutation({
    mutationFn: async () => {
      const result = await postsService.incrementViews(postId)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
  })
}

/**
 * Share a post
 */
export function useSharePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      postId: string
      sharedTo: 'followers' | 'direct' | 'public'
      message?: string
    }) => {
      const result = await postsService.sharePost(params.postId, params.sharedTo, params.message)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(params.postId) })
    },
  })
}

/**
 * Combined hook for post operations
 * Provides commonly needed post CRUD operations
 */
export function usePosts() {
  const queryClient = useQueryClient()

  const createPost = useCreatePost()
  const deletePost = useDeletePost()

  return {
    createPost: createPost.mutate,
    deletePost: deletePost.mutate,
    isCreating: createPost.isPending,
    isDeleting: deletePost.isPending,
    createError: createPost.error,
    deleteError: deletePost.error,
  }
}
