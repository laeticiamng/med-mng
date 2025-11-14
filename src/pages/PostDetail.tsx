import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Heart,
  MessageCircle,
  Eye,
  ArrowLeft,
  Share2,
  AlertCircle,
  CheckCircle,
  Loader,
  Trash2,
  Edit,
} from 'lucide-react'
import { useState } from 'react'
import { usePosts } from '@/hooks/usePosts'
import { usePostComments } from '@/hooks/usePostComments'
import { useAuth } from '@/contexts/AuthContext'
import { FavoritesButton } from '@/components/favorites/FavoritesButton'

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { useFetchPost, useToggleLikePost, useDeletePost } = usePosts()
  const { useFetchPostComments, useCreateComment, useDeleteComment } = usePostComments()

  const [newComment, setNewComment] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentSuccess, setCommentSuccess] = useState(false)

  // Fetch post
  const { data: post, isLoading, error } = useFetchPost(postId || '')
  
  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useFetchPostComments(postId || '', { limit: 50 })

  const toggleLikeMutation = useToggleLikePost(postId || '')
  const deletePostMutation = useDeletePost(postId || '')
  const createCommentMutation = useCreateComment(postId || '')
  const deleteCommentMutation = useDeleteComment(postId || '')

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setCommentError(null)
    setCommentSuccess(false)

    if (!newComment.trim()) {
      setCommentError('Le commentaire ne peut pas être vide')
      return
    }

    if (!user) {
      setCommentError('Vous devez être connecté pour commenter')
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        content: newComment.trim(),
      })
      setNewComment('')
      setCommentSuccess(true)
      setTimeout(() => setCommentSuccess(false), 2000)
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire')
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post?')) return
    
    try {
      await deletePostMutation.mutateAsync()
      navigate(ROUTE_PATHS.posts)
    } catch (err) {
      console.error('Error deleting post:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link to={ROUTE_PATHS.posts}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement du post
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const isAuthor = user?.id === post.user_id

  return (
    <>
      <Helmet>
        <title>{post.title} | Med-Mng</title>
        <meta name="description" content={post.excerpt || post.content.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back Button */}
          <Link to={ROUTE_PATHS.posts}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Posts
            </Button>
          </Link>

          {/* Post */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-4">{post.title}</CardTitle>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="text-sm text-gray-600">
                    {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap justify-end">
                  <FavoritesButton
                    itemId={post.id}
                    itemType="post"
                    showLabel={true}
                    size="md"
                  />
                  {isAuthor && (
                    <>
                      <Link to={`${ROUTE_PATHS.posts}/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Éditer
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeletePost}
                        disabled={deletePostMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Content */}
              <div className="prose prose-sm max-w-none mb-6">
                {post.content}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 text-sm text-gray-600 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.view_count} vues</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comment_count} commentaires</span>
                </div>
                <button
                  onClick={() => toggleLikeMutation.mutate()}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>{post.like_count} likes</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Commentaires</h3>

            {/* Add Comment */}
            {user && (
              <Card>
                <CardContent className="pt-6">
                  {commentError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{commentError}</AlertDescription>
                    </Alert>
                  )}

                  {commentSuccess && (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Commentaire ajouté avec succès!
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleAddComment}>
                    <Textarea
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      disabled={createCommentMutation.isPending}
                    />
                    <div className="mt-3">
                      <Button
                        type="submit"
                        disabled={!newComment.trim() || createCommentMutation.isPending}
                      >
                        {createCommentMutation.isPending ? 'Envoi...' : 'Commenter'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <Link to={ROUTE_PATHS.login} className="text-blue-600 hover:underline">
                    Connectez-vous
                  </Link>
                  {' '}pour commenter
                </AlertDescription>
              </Alert>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : comments.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center pb-12">
                  <p className="text-gray-600">Aucun commentaire pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <button className="text-sm text-gray-600 hover:text-red-600">
                          <Heart className="w-4 h-4 inline mr-1" />
                          {comment.like_count}
                        </button>
                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => deleteCommentMutation.mutate()}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
