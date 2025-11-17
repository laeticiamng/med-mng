import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Comment } from '@shared/services/posts.service'
import { useFetchCommentReplies, useCreateComment } from '@/hooks/usePosts'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Heart, MessageCircle, Loader, X } from 'lucide-react'
import { toast } from 'sonner'

interface CommentThreadProps {
  comment: Comment
  postId: string
  onReply?: (parentCommentId: string) => void
}

export function CommentThread({ comment, postId, onReply }: CommentThreadProps) {
  const { data: replies = [], isLoading: repliesLoading } = useFetchCommentReplies(comment.id)
  const createComment = useCreateComment(postId)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const handleReply = () => {
    if (!replyContent.trim()) {
      toast.error('Veuillez écrire un commentaire')
      return
    }

    createComment.mutate(
      { content: replyContent, parentCommentId: comment.id },
      {
        onSuccess: () => {
          setReplyContent('')
          setShowReplyForm(false)
          toast.success('Réponse ajoutée')
        },
        onError: () => {
          toast.error('Erreur lors de l\'ajout du commentaire')
        },
      }
    )
  }

  return (
    <div className="space-y-3">
      {/* Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-semibold">Utilisateur {comment.user_id.slice(0, 8)}</p>
            <p className="text-sm mt-1">{comment.content}</p>
            {comment.is_edited && (
              <p className="text-xs text-muted-foreground mt-1">(modifié)</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}</span>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3 inline mr-1" />
              Répondre
            </button>
            <button className="hover:text-red-500 transition-colors">
              <Heart className="h-3 w-3 inline mr-1" />
              {comment.likes_count}
            </button>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-8 flex gap-2">
          <Input
            placeholder="Écrivez une réponse..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="text-sm"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleReply()
              }
            }}
            data-testid={`reply-input-${comment.id}`}
          />
          <Button
            size="sm"
            onClick={handleReply}
            disabled={createComment.isPending || !replyContent.trim()}
          >
            {createComment.isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Répondre'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowReplyForm(false)
              setReplyContent('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Replies */}
      {repliesLoading ? (
        <div className="ml-8 text-sm text-muted-foreground">Chargement des réponses...</div>
      ) : replies.length > 0 ? (
        <div className="ml-8 space-y-3">
          {replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
