import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/services/posts.service'
import { useLikePost, useUnlikePost, useBookmarkPost } from '@/hooks/usePosts'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
  showActions?: boolean
  compact?: boolean
}

export function PostCard({ post, showActions = true, compact = false }: PostCardProps) {
  const likePost = useLikePost(post.id)
  const unlikePost = useUnlikePost(post.id)
  const bookmarkPost = useBookmarkPost('')

  const handleLike = () => {
    if (post.is_liked) {
      unlikePost.mutate()
    } else {
      likePost.mutate()
    }
  }

  const handleBookmark = () => {
    bookmarkPost.mutate(post.id, {
      onSuccess: () => {
        toast.success('Post ajouté aux signets')
      },
      onError: () => {
        toast.error('Erreur lors du signalage')
      },
    })
  }

  const handleShare = () => {
    toast.info('Partage non disponible pour le moment')
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link to={ROUTE_PATHS.userProfile.replace(':userId', post.user_id)} className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Utilisateur {post.user_id.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </Link>
          {post.category && (
            <Badge variant="outline" className="ml-2">
              {post.category}
            </Badge>
          )}
        </div>

        {/* Content */}
        <Link to={ROUTE_PATHS.postDetail.replace(':postId', post.id)}>
          <div className="mb-4 cursor-pointer hover:opacity-80 transition-opacity">
            <h3 className="text-lg font-bold mb-2">{post.title}</h3>
            {!compact && post.description && (
              <p className="text-sm text-muted-foreground mb-2">{post.description}</p>
            )}
            {post.content && (
              <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
            )}
          </div>
        </Link>

        {/* Image */}
        {post.image_url && (
          <Link to={ROUTE_PATHS.postDetail.replace(':postId', post.id)}>
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && <Badge variant="secondary" className="text-xs">+{post.tags.length - 3}</Badge>}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 py-2 border-y">
          <span>{post.likes_count} j'aimes</span>
          <span>{post.comments_count} commentaires</span>
          <span>{post.shares_count} partages</span>
          <span>{post.views_count} vues</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likePost.isPending || unlikePost.isPending}
              className={post.is_liked ? 'text-red-500' : ''}
              data-testid={`like-post-${post.id}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
              {post.likes_count}
            </Button>
            <Link to={ROUTE_PATHS.postDetail.replace(':postId', post.id)} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.comments_count}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkPost.isPending}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
