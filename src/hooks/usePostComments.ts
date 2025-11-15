/**
 * Hook: usePostComments
 * Manages post comments with React Query caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postCommentsService } from '@/services/post-comments.service'
import { useAuth } from '@/components/med-mng/AuthProvider'

export const usePostComments = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id

  // Fetch comments on a post
  const useFetchPostComments = (postId: string, options?: {
    limit?: number
    offset?: number
  }) => {
    return useQuery({
      queryKey: ['comments', 'post', postId, options?.offset],
      queryFn: () => postCommentsService.getPostComments(postId, {
        ...options,
        parentCommentIdOnly: true,
      }),
      enabled: !!postId,
      staleTime: 1000 * 60, // 1 minute
    })
  }

  // Fetch replies to a comment
  const useFetchReplies = (commentId: string, limit?: number) => {
    return useQuery({
      queryKey: ['comments', 'replies', commentId],
      queryFn: () => postCommentsService.getCommentReplies(commentId, limit),
      enabled: !!commentId,
      staleTime: 1000 * 60, // 1 minute
    })
  }

  // Fetch single comment
  const useFetchComment = (commentId: string) => {
    return useQuery({
      queryKey: ['comments', commentId],
      queryFn: () => postCommentsService.getComment(commentId),
      enabled: !!commentId,
    })
  }

  // Fetch user's comments
  const useFetchUserComments = (targetUserId?: string, limit?: number) => {
    const fetchUserId = targetUserId || userId
    return useQuery({
      queryKey: ['comments', 'user', fetchUserId],
      queryFn: () => postCommentsService.getUserComments(fetchUserId!, limit || 50),
      enabled: !!fetchUserId,
    })
  }

  // Get comment count
  const useCommentCount = (postId: string) => {
    return useQuery({
      queryKey: ['comments', 'count', postId],
      queryFn: () => postCommentsService.getCommentCount(postId),
      enabled: !!postId,
      staleTime: 1000 * 30, // 30 seconds
    })
  }

  // Get reply count
  const useReplyCount = (commentId: string) => {
    return useQuery({
      queryKey: ['comments', 'replies-count', commentId],
      queryFn: () => postCommentsService.getReplyCount(commentId),
      enabled: !!commentId,
      staleTime: 1000 * 30, // 30 seconds
    })
  }

  // Create comment mutation
  const useCreateComment = (postId: string) => {
    return useMutation({
      mutationFn: (params: {
        content: string
        parentCommentId?: string
      }) => {
        if (!userId) throw new Error('User not authenticated')
        return postCommentsService.createComment(
          postId,
          userId,
          params.content,
          params.parentCommentId
        )
      },
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({
          queryKey: ['comments', 'post', postId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', 'count', postId],
        })
        if (params.parentCommentId) {
          queryClient.invalidateQueries({
            queryKey: ['comments', 'replies', params.parentCommentId],
          })
          queryClient.invalidateQueries({
            queryKey: ['comments', 'replies-count', params.parentCommentId],
          })
        }
      },
    })
  }

  // Update comment mutation
  const useUpdateComment = (commentId: string) => {
    return useMutation({
      mutationFn: (content: string) =>
        postCommentsService.updateComment(commentId, content),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comments', commentId],
        })
      },
    })
  }

  // Delete comment mutation
  const useDeleteComment = (postId: string, commentId: string) => {
    return useMutation({
      mutationFn: () => postCommentsService.deleteComment(commentId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comments', 'post', postId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', commentId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', 'count', postId],
        })
      },
    })
  }

  // Like comment mutation
  const useLikeComment = (commentId: string) => {
    return useMutation({
      mutationFn: () => {
        if (!userId) throw new Error('User not authenticated')
        return postCommentsService.likeComment(commentId, userId)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comments', commentId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', 'likes', commentId, userId],
        })
      },
    })
  }

  // Unlike comment mutation
  const useUnlikeComment = (commentId: string) => {
    return useMutation({
      mutationFn: () => {
        if (!userId) throw new Error('User not authenticated')
        return postCommentsService.unlikeComment(commentId, userId)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comments', commentId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', 'likes', commentId, userId],
        })
      },
    })
  }

  // Check if user liked comment
  const useHasUserLikedComment = (commentId: string) => {
    return useQuery({
      queryKey: ['comments', 'likes', commentId, userId],
      queryFn: () => {
        if (!userId) return false
        return postCommentsService.hasUserLikedComment(commentId, userId)
      },
      enabled: !!userId && !!commentId,
    })
  }

  // Toggle like comment
  const useToggleLikeComment = (commentId: string) => {
    return useMutation({
      mutationFn: async () => {
        if (!userId) throw new Error('User not authenticated')
        const liked = await postCommentsService.hasUserLikedComment(
          commentId,
          userId
        )
        if (liked) {
          return postCommentsService.unlikeComment(commentId, userId)
        } else {
          return postCommentsService.likeComment(commentId, userId)
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['comments', commentId],
        })
        queryClient.invalidateQueries({
          queryKey: ['comments', 'likes', commentId, userId],
        })
      },
    })
  }

  return {
    useFetchPostComments,
    useFetchReplies,
    useFetchComment,
    useFetchUserComments,
    useCommentCount,
    useReplyCount,
    useCreateComment,
    useUpdateComment,
    useDeleteComment,
    useLikeComment,
    useUnlikeComment,
    useHasUserLikedComment,
    useToggleLikeComment,
  }
}
