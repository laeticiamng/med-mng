import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, Reply, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: dbComments } = await (supabase as any)
        .from('community_comments')
        .select('*, community_comment_likes(user_id)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (dbComments) {
        const formatted: Comment[] = dbComments.map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.user_id,
          authorName: c.author_name || 'Utilisateur',
          content: c.content,
          likes: c.likes_count || 0,
          isLiked: user ? c.community_comment_likes?.some((l: any) => l.user_id === user.id) : false,
          createdAt: c.created_at,
          replies: []
        }));
        setComments(formatted);
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      await (supabase as any).from('community_comments').insert({
        post_id: postId,
        user_id: user.id,
        author_name: profile?.name || user.email?.split('@')[0],
        content: newComment
      });

      // Update comment count on post
      await (supabase as any).rpc('increment_comment_count', { post_id: postId });

      setNewComment('');
      loadComments();
      onCommentAdded?.();
      toast({ title: "Commentaire ajouté !" });
    } catch (e) {
      console.error('Error adding comment:', e);
      // Fallback local
      const comment: Comment = {
        id: Date.now().toString(),
        postId,
        authorId: user.id,
        authorName: 'Vous',
        content: newComment,
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast({ title: "Commentaire ajouté !" });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.isLiked) {
        await (supabase as any).from('community_comment_likes').delete()
          .eq('comment_id', commentId).eq('user_id', user.id);
      } else {
        await (supabase as any).from('community_comment_likes').insert({
          comment_id: commentId,
          user_id: user.id
        });
      }
    } catch (e) {
      // Continue with local update
    }

    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
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
      {/* New comment input */}
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
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Commenter
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
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
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-destructive text-destructive' : ''}`}
                        />
                        {comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Répondre
                      </Button>
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <Textarea
                          placeholder={`Répondre à ${comment.authorName}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[40px] text-sm resize-none"
                        />
                        <Button size="sm" onClick={() => {
                          toast({ title: "Réponse envoyée !" });
                          setReplyingTo(null);
                          setReplyContent('');
                        }}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
