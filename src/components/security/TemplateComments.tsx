import { useState } from 'react';
import { useTemplateComments } from '@/hooks/useTemplateComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Star, Trash2, Edit2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TemplateCommentsProps {
  templateId: string;
}

export const TemplateComments = ({ templateId }: TemplateCommentsProps) => {
  const {
    comments,
    averageRating,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    isAdding,
  } = useTemplateComments(templateId);

  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);

  const handleSubmit = () => {
    if (newComment.trim() || newRating > 0) {
      addComment({
        comment: newComment.trim() || undefined,
        rating: newRating || undefined,
      });
      setNewComment('');
      setNewRating(0);
    }
  };

  const handleEdit = (commentId: string, currentComment: string, currentRating: number | null) => {
    setEditingId(commentId);
    setEditText(currentComment || '');
    setEditRating(currentRating || 0);
  };

  const handleUpdate = (commentId: string) => {
    updateComment({
      commentId,
      comment: editText.trim() || undefined,
      rating: editRating || undefined,
    });
    setEditingId(null);
  };

  const StarRating = ({ 
    rating, 
    onRate, 
    size = 'sm',
    readonly = false 
  }: { 
    rating: number; 
    onRate?: (rating: number) => void;
    size?: 'sm' | 'lg';
    readonly?: boolean;
  }) => {
    const [hover, setHover] = useState(0);
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={readonly ? 'cursor-default' : 'cursor-pointer'}
          >
            <Star
              className={`${starSize} ${
                star <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Chargement des commentaires...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Average Rating Display */}
      {comments.length > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(averageRating)} readonly size="lg" />
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({comments.length} {comments.length === 1 ? 'avis' : 'avis'})
          </span>
        </div>
      )}

      {/* Add Comment Form */}
      <Card className="p-4 space-y-3">
        <div>
          <label className="text-sm font-medium mb-2 block">Votre note</label>
          <StarRating rating={newRating} onRate={setNewRating} size="lg" />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Votre commentaire</label>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Partagez votre retour sur ce template..."
            className="min-h-[80px]"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isAdding || (!newComment.trim() && newRating === 0)}
          size="sm"
        >
          Publier
        </Button>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            {editingId === comment.id ? (
              <div className="space-y-3">
                {comment.rating && (
                  <StarRating rating={editRating} onRate={setEditRating} size="lg" />
                )}
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(comment.id)}
                    variant="default"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setEditingId(null)}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {comment.rating && (
                      <StarRating rating={comment.rating} readonly size="sm" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(comment.id, comment.comment || '', comment.rating)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {comment.comment && (
                  <p className="text-sm text-foreground mb-2">{comment.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </>
            )}
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun commentaire pour le moment. Soyez le premier à partager votre avis !
        </p>
      )}
    </div>
  );
};
