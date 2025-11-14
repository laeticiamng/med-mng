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
    queryFn: () => postsService.getFeedPosts(limit, offset),
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Fetch user's posts
 */
export function useFetchUserPosts(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.userPosts(userId), limit, offset],
    queryFn: () => postsService.getUserPosts(userId, limit, offset),
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
    queryFn: () => postsService.getPost(postId),
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
    mutationFn: (params: {
      title: string
      content: string
      description?: string
      imageUrl?: string
      category?: PostCategory
      tags?: string[]
    }) =>
      postsService.createPost(params.title, params.content, {
        description: params.description,
        imageUrl: params.imageUrl,
        category: params.category,
        tags: params.tags,
      }),
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
    mutationFn: (updates: Partial<Post>) => postsService.updatePost(postId, updates),
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
    mutationFn: (postId: string) => postsService.deletePost(postId),
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
    mutationFn: () => postsService.likePost(postId),
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
    mutationFn: () => postsService.unlikePost(postId),
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
    mutationFn: (params: { content: string; parentCommentId?: string }) =>
      postsService.createComment(postId, params.content, params.parentCommentId),
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
    queryFn: () => postsService.getPostComments(postId, limit, offset),
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
    queryFn: () => postsService.getCommentReplies(commentId),
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
    mutationFn: (params: { commentId: string; content: string }) =>
      postsService.updateComment(params.commentId, params.content),
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
    mutationFn: (commentId: string) => postsService.deleteComment(commentId),
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
    mutationFn: (postId: string) => postsService.bookmarkPost(postId),
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
    mutationFn: (postId: string) => postsService.removeBookmark(postId),
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
    queryFn: () => postsService.getUserBookmarks(userId, limit, offset),
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
    queryFn: () => postsService.searchPosts(query, limit, offset),
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
    queryFn: () => postsService.getTrendingPosts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Fetch posts by category
 */
export function useFetchPostsByCategory(category: PostCategory, limit = 20, offset = 0) {
  return useQuery({
    queryKey: [...postsKeys.category(category), limit, offset],
    queryFn: () => postsService.getPostsByCategory(category, limit, offset),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!category,
  })
}

/**
 * Increment post views
 */
export function useIncrementPostViews(postId: string) {
  return useMutation({
    mutationFn: () => postsService.incrementViews(postId),
  })
}

/**
 * Share a post
 */
export function useSharePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      postId: string
      sharedTo: 'followers' | 'direct' | 'public'
      message?: string
    }) => postsService.sharePost(params.postId, params.sharedTo, params.message),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.post(params.postId) })
    },
  })
}
