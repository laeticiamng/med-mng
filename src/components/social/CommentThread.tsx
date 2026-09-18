import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Périmètre réel de la table `community_comments` (vérifié sur la base) :
//   id, post_id, author_id, content, created_at, likes_count, is_empathy_template
// Il n'existe AUCUNE table de « j'aime » par utilisateur (community_comment_likes
// et comment_likes renvoient toutes les deux une 404 PostgREST), ni de fonction
// RPC d'incrémentation. Impossible donc de persister un like ni de savoir si
// l'utilisateur courant a déjà aimé un commentaire : le bouton « j'aime » a été
// retiré plutôt que de laisser un compteur qui ment.
// Il n'existe pas non plus de colonne `parent_id` : les réponses imbriquées ne
// sont pas stockables, l'UI de réponse a donc été retirée elle aussi.
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentThreadProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      // Uniquement des colonnes qui existent réellement : aucun embed vers une
      // table de likes (elle n'existe pas, l'embed renvoyait une erreur 400).
      const { data, error } = await supabase
        .from('community_comments')
        .select('id, post_id, author_id, content, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const rows = data ?? [];

      // `community_comments` n'a pas de colonne `author_name` et aucune clé
      // étrangère vers `profiles` : on résout les pseudos en une requête séparée.
      const authorIds = Array.from(new Set(rows.map((r) => r.author_id).filter(Boolean)));
      const nameById = new Map<string, string>();

      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', authorIds);

        profiles?.forEach((p) => {
          if (p.name) nameById.set(p.id, p.name);
        });
      }

      setComments(
        rows.map((row) => ({
          id: row.id,
          postId: row.post_id,
          authorId: row.author_id,
          authorName: nameById.get(row.author_id) ?? 'Utilisateur',
          content: row.content,
          createdAt: row.created_at ?? new Date().toISOString(),
        }))
      );
    } catch (e) {
      if (import.meta.env.DEV) console.error('Erreur de chargement des commentaires :', e);
      setComments([]);
      toast({
        title: 'Commentaires indisponibles',
        description: (e as Error)?.message ?? 'Impossible de charger les commentaires.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [postId, toast]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      // Colonnes réelles de la table : post_id, author_id, content.
      const { error } = await supabase.from('community_comments').insert({
        post_id: postId,
        author_id: user.id,
        content: newComment.trim(),
      });

      // L'erreur est remontée à l'utilisateur : pas de repli local qui ferait
      // croire que le commentaire est enregistré alors qu'il ne l'est pas.
      if (error) throw error;

      setNewComment('');
      await loadComments();
      onCommentAdded?.();
      toast({ title: 'Commentaire publié !' });
    } catch (e) {
      if (import.meta.env.DEV) console.error('Erreur à la publication du commentaire :', e);
      toast({
        title: 'Publication impossible',
        description: (e as Error)?.message ?? "Votre commentaire n'a pas pu être enregistré.",
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saisie d'un nouveau commentaire */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>V</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Ajouter un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Commenter
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          Aucun commentaire. Soyez le premier à réagir !
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
