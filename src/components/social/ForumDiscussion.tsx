import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  ThumbsUp,
  MessageCircle,
  Eye,
  Pin,
  Clock,
  Tag,
  ChevronRight,
  ArrowLeft,
  Send,
  Bookmark,
  MoreVertical,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isSolved: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  lastReplyAt?: string;
  lastReplyAuthor?: string;
}

interface ForumReply {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isBestAnswer: boolean;
}

const CATEGORIES = [
  { value: 'general', label: 'Général', color: 'bg-gray-500' },
  { value: 'cardiologie', label: 'Cardiologie', color: 'bg-red-500' },
  { value: 'neurologie', label: 'Neurologie', color: 'bg-purple-500' },
  { value: 'pneumologie', label: 'Pneumologie', color: 'bg-blue-500' },
  { value: 'edn', label: 'EDN/ECOS', color: 'bg-green-500' },
  { value: 'methode', label: 'Méthodes', color: 'bg-orange-500' },
  { value: 'aide', label: 'Aide', color: 'bg-yellow-500' }
];

export const ForumDiscussion: React.FC = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent');
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newReply, setNewReply] = useState('');
  const { toast } = useToast();

  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Charger les topics depuis Supabase
      const { data: topicsData, error } = await supabase
        .from('forum_topics')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Charger les profils des auteurs
      const authorIds = [...new Set(topicsData?.map(t => t.author_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', authorIds.length > 0 ? authorIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Charger les likes de l'utilisateur
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('topic_id')
          .eq('user_id', user.id)
          .not('topic_id', 'is', null);
        userLikes = likes?.map(l => l.topic_id).filter(Boolean) as string[] || [];

        const { data: bookmarks } = await supabase
          .from('forum_bookmarks')
          .select('topic_id')
          .eq('user_id', user.id);
        userBookmarks = bookmarks?.map(b => b.topic_id) || [];
      }

      const formattedTopics: ForumTopic[] = (topicsData || []).map((t, index) => {
        const profile = profileMap.get(t.author_id);
        return {
          id: t.id,
          title: t.title,
          content: t.content,
          category: t.category,
          tags: t.tags || [],
          authorId: t.author_id,
          authorName: profile?.name || `Utilisateur ${index + 1}`,
          authorAvatar: profile?.avatar_url,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          views: t.views || 0,
          replies: t.replies_count || 0,
          likes: t.likes_count || 0,
          isPinned: t.is_pinned || false,
          isSolved: t.is_solved || false,
          isLiked: userLikes.includes(t.id),
          isBookmarked: userBookmarks.includes(t.id),
          lastReplyAt: t.last_reply_at,
          lastReplyAuthor: undefined
        };
      });

      setTopics(formattedTopics);
    } catch (error) {
      console.error('Erreur chargement topics:', error);
      // No mock data - show empty state for real data integrity
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (topicId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: repliesData, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('is_best_answer', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Charger les profils des auteurs
      const authorIds = [...new Set(repliesData?.map(r => r.author_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', authorIds.length > 0 ? authorIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Charger les likes de l'utilisateur
      let userLikes: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('reply_id')
          .eq('user_id', user.id)
          .not('reply_id', 'is', null);
        userLikes = likes?.map(l => l.reply_id).filter(Boolean) as string[] || [];
      }

      const formattedReplies: ForumReply[] = (repliesData || []).map((r, index) => {
        const profile = profileMap.get(r.author_id);
        return {
          id: r.id,
          topicId: r.topic_id,
          content: r.content,
          authorId: r.author_id,
          authorName: profile?.name || `Utilisateur ${index + 1}`,
          authorAvatar: profile?.avatar_url,
          createdAt: r.created_at,
          likes: r.likes_count || 0,
          isLiked: userLikes.includes(r.id),
          isBestAnswer: r.is_best_answer || false
        };
      });

      setReplies(formattedReplies);
    } catch (error) {
      console.error('Erreur chargement réponses:', error);
      setReplies([]);
    }
  };

  const selectTopic = async (topic: ForumTopic) => {
    setSelectedTopic(topic);
    loadReplies(topic.id);
    
    // Incrémenter les vues dans Supabase
    try {
      await supabase
        .from('forum_topics')
        .update({ views: (topic.views || 0) + 1 })
        .eq('id', topic.id);
    } catch (error) {
      console.error('Erreur mise à jour vues:', error);
    }
    
    setTopics(prev => prev.map(t =>
      t.id === topic.id ? { ...t, views: t.views + 1 } : t
    ));
  };

  const handleLikeTopic = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour liker.', variant: 'destructive' });
      return;
    }

    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    try {
      if (topic.isLiked) {
        await supabase.from('forum_likes').delete().eq('user_id', user.id).eq('topic_id', topicId);
        await supabase.from('forum_topics').update({ likes_count: Math.max(0, topic.likes - 1) }).eq('id', topicId);
      } else {
        await supabase.from('forum_likes').insert({ user_id: user.id, topic_id: topicId });
        await supabase.from('forum_topics').update({ likes_count: topic.likes + 1 }).eq('id', topicId);
      }
    } catch (error) {
      console.error('Erreur like:', error);
    }

    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
        : t
    ));
  };

  const handleLikeReply = async (replyId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reply = replies.find(r => r.id === replyId);
    if (!reply) return;

    try {
      if (reply.isLiked) {
        await supabase.from('forum_likes').delete().eq('user_id', user.id).eq('reply_id', replyId);
        await supabase.from('forum_replies').update({ likes_count: Math.max(0, reply.likes - 1) }).eq('id', replyId);
      } else {
        await supabase.from('forum_likes').insert({ user_id: user.id, reply_id: replyId });
        await supabase.from('forum_replies').update({ likes_count: reply.likes + 1 }).eq('id', replyId);
      }
    } catch (error) {
      console.error('Erreur like réponse:', error);
    }

    setReplies(prev => prev.map(r =>
      r.id === replyId
        ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
  };

  const handleBookmark = async (topicId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour sauvegarder.', variant: 'destructive' });
      return;
    }

    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    try {
      if (topic.isBookmarked) {
        await supabase.from('forum_bookmarks').delete().eq('user_id', user.id).eq('topic_id', topicId);
      } else {
        await supabase.from('forum_bookmarks').insert({ user_id: user.id, topic_id: topicId });
      }
    } catch (error) {
      console.error('Erreur bookmark:', error);
    }

    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, isBookmarked: !t.isBookmarked } : t
    ));
    toast({ title: topic.isBookmarked ? 'Retiré des favoris' : 'Sauvegardé ✅', description: topic.isBookmarked ? 'Discussion retirée.' : 'Discussion ajoutée à vos favoris.' });
  };

  const createTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour créer une discussion.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase.from('forum_topics').insert({
        title: newTopic.title,
        content: newTopic.content,
        category: newTopic.category,
        tags: newTopic.tags.split(',').map(t => t.trim()).filter(Boolean),
        author_id: user.id
      }).select().single();

      if (error) throw error;

      const topic: ForumTopic = {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        authorId: data.author_id,
        authorName: 'Vous',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        views: 0,
        replies: 0,
        likes: 0,
        isPinned: false,
        isSolved: false,
        isLiked: false,
        isBookmarked: false
      };

      setTopics(prev => [topic, ...prev]);
      setShowNewTopicDialog(false);
      setNewTopic({ title: '', content: '', category: 'general', tags: '' });
      toast({ title: 'Discussion créée ! 🎉', description: 'Votre discussion a été publiée.' });
    } catch (error) {
      console.error('Erreur création topic:', error);
      toast({ title: 'Erreur', description: 'Impossible de créer la discussion.', variant: 'destructive' });
    }
  };

  const submitReply = async () => {
    if (!newReply.trim() || !selectedTopic) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour répondre.', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase.from('forum_replies').insert({
        topic_id: selectedTopic.id,
        content: newReply,
        author_id: user.id
      }).select().single();

      if (error) throw error;

      // Mettre à jour le compteur de réponses
      await supabase.from('forum_topics').update({
        replies_count: selectedTopic.replies + 1,
        last_reply_at: new Date().toISOString(),
        last_reply_author_id: user.id
      }).eq('id', selectedTopic.id);

      const reply: ForumReply = {
        id: data.id,
        topicId: data.topic_id,
        content: data.content,
        authorId: data.author_id,
        authorName: 'Vous',
        createdAt: data.created_at,
        likes: 0,
        isLiked: false,
        isBestAnswer: false
      };

      setReplies(prev => [...prev, reply]);
      setTopics(prev => prev.map(t =>
        t.id === selectedTopic.id
          ? { ...t, replies: t.replies + 1, lastReplyAt: new Date().toISOString(), lastReplyAuthor: 'Vous' }
          : t
      ));
      setNewReply('');
      toast({ title: 'Réponse publiée ! ✅' });
    } catch (error) {
      console.error('Erreur réponse:', error);
      toast({ title: 'Erreur', description: 'Impossible de publier la réponse.', variant: 'destructive' });
    }
  };

  const getCategoryColor = (categoryValue: string) => {
    return CATEGORIES.find(c => c.value === categoryValue)?.color || 'bg-gray-500';
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
  };

  const filteredTopics = topics
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      switch (sortBy) {
        case 'popular': return b.likes - a.likes;
        case 'unanswered': return a.replies - b.replies;
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Vue détaillée d'un topic
  if (selectedTopic) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour aux discussions
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(selectedTopic.category)}`} />
                  <Badge variant="secondary">
                    {CATEGORIES.find(c => c.value === selectedTopic.category)?.label}
                  </Badge>
                  {selectedTopic.isSolved && (
                    <Badge variant="outline" className="text-success border-success gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Résolu
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{selectedTopic.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleBookmark(selectedTopic.id)}
                >
                  <Bookmark className={`h-4 w-4 ${selectedTopic.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedTopic.authorAvatar} />
                <AvatarFallback>{selectedTopic.authorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedTopic.authorName}</p>
                <p className="text-sm text-muted-foreground">
                  Posté il y a {formatTimeAgo(selectedTopic.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{selectedTopic.content}</p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTopic.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
              <button
                className={`flex items-center gap-1 ${selectedTopic.isLiked ? 'text-primary' : ''}`}
                onClick={() => handleLikeTopic(selectedTopic.id)}
              >
                <ThumbsUp className={`h-4 w-4 ${selectedTopic.isLiked ? 'fill-current' : ''}`} />
                {selectedTopic.likes}
              </button>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {selectedTopic.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {selectedTopic.replies}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Réponses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Réponses ({replies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {replies.map((reply) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${reply.isBestAnswer ? 'border-success bg-success/5' : ''}`}
              >
                {reply.isBestAnswer && (
                  <Badge variant="outline" className="text-success border-success mb-2 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Meilleure réponse
                  </Badge>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.authorAvatar} />
                    <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{reply.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      Il y a {formatTimeAgo(reply.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <button
                    className={`flex items-center gap-1 ${reply.isLiked ? 'text-primary' : ''}`}
                    onClick={() => handleLikeReply(reply.id)}
                  >
                    <ThumbsUp className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                    {reply.likes}
                  </button>
                </div>
              </motion.div>
            ))}

            {/* New Reply Input */}
            <div className="pt-4 border-t">
              <Textarea
                placeholder="Écrire une réponse..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="mb-3"
              />
              <Button onClick={submitReply} disabled={!newReply.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Répondre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vue liste des topics
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Forum de Discussion
          </h2>
          <p className="text-muted-foreground">
            Posez vos questions et partagez vos connaissances
          </p>
        </div>

        <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Titre *</label>
                <Input
                  placeholder="Votre question ou sujet..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie *</label>
                <Select
                  value={newTopic.category}
                  onValueChange={(v) => setNewTopic({ ...newTopic, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Contenu *</label>
                <Textarea
                  placeholder="Décrivez votre question ou sujet en détail..."
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (séparés par virgule)</label>
                <Input
                  placeholder="cardiologie, IC-3, diagnostic"
                  value={newTopic.tags}
                  onChange={(e) => setNewTopic({ ...newTopic, tags: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={createTopic}>
                Publier la discussion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Récentes</SelectItem>
            <SelectItem value="popular">Populaires</SelectItem>
            <SelectItem value="unanswered">Sans réponse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune discussion trouvée</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowNewTopicDialog(true)}>
              Créer la première discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow ${topic.isPinned ? 'border-primary' : ''}`}
                onClick={() => selectTopic(topic)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={topic.authorAvatar} />
                      <AvatarFallback>{topic.authorName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.isPinned && <Pin className="h-4 w-4 text-primary" />}
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(topic.category)}`} />
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORIES.find(c => c.value === topic.category)?.label}
                        </Badge>
                        {topic.isSolved && (
                          <Badge variant="outline" className="text-success border-success text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Résolu
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold line-clamp-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {topic.content}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{topic.authorName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(topic.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {topic.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {topic.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {topic.views}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
