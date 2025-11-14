import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { ArrowLeft, Heart, Share2, Bookmark, Loader, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentThread } from '@/components/posts/CommentThread'
import {
  useFetchPost,
  useFetchPostComments,
  useLikePost,
  useUnlikePost,
  useCreateComment,
} from '@/hooks/usePosts'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [newComment, setNewComment] = useState('')

  const { data: post, isLoading: postLoading } = useFetchPost(postId || '')
  const { data: comments = [], isLoading: commentsLoading } = useFetchPostComments(postId || '')
  const likePost = useLikePost(postId || '')
  const unlikePost = useUnlikePost(postId || '')
  const createComment = useCreateComment(postId || '')

  if (!postId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Post non trouvé</p>
            <Link to={ROUTE_PATHS.posts}>
              <Button variant="outline" className="mt-4">
                Retour aux posts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Post introuvable</p>
            <Link to={ROUTE_PATHS.posts}>
              <Button variant="outline" className="mt-4">
                Retour aux posts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLike = () => {
    if (post.is_liked) {
      unlikePost.mutate()
    } else {
      likePost.mutate()
    }
  }

  const handleComment = () => {
    if (!newComment.trim()) {
      toast.error('Veuillez écrire un commentaire')
      return
    }

    createComment.mutate(
      { content: newComment },
      {
        onSuccess: () => {
          setNewComment('')
          toast.success('Commentaire ajouté')
        },
        onError: () => {
          toast.error('Erreur lors de l\'ajout du commentaire')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <Link to={ROUTE_PATHS.posts}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux posts
          </Button>
        </Link>

        {/* Post Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <Link
                to={ROUTE_PATHS.userProfile.replace(':userId', post.user_id)}
                className="flex items-center gap-3 flex-1"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Utilisateur {post.user_id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </Link>
              {post.category && (
                <Badge variant="outline">{post.category}</Badge>
              )}
            </div>

            {/* Content */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              {post.description && (
                <p className="text-muted-foreground mb-4">{post.description}</p>
              )}
              <div className="prose prose-invert max-w-none mb-4">
                <p>{post.content}</p>
              </div>
            </div>

            {/* Image */}
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 py-4 border-y text-sm text-muted-foreground mb-6">
              <span>{post.likes_count} j'aimes</span>
              <span>{post.comments_count} commentaires</span>
              <span>{post.shares_count} partages</span>
              <span>{post.views_count} vues</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleLike}
                disabled={likePost.isPending || unlikePost.isPending}
                className={post.is_liked ? 'text-red-500' : ''}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`}
                />
                {post.likes_count}
              </Button>
              <Button variant="ghost">
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.comments_count}
              </Button>
              <Button variant="ghost">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
              <Button variant="ghost">
                <Bookmark className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Commentaires</CardTitle>
            <CardDescription>
              {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            {currentUser && (
              <div className="space-y-4 pb-6 border-b">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Écrivez un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      data-testid="new-comment-input"
                    />
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={createComment.isPending || !newComment.trim()}
                    >
                      {createComment.isPending ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        'Commenter'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded" />
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    postId={postId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Aucun commentaire pour le moment. Soyez le premier!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
