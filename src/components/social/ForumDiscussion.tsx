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
      // Simulation de données
      const mockTopics: ForumTopic[] = [
        {
          id: '1',
          title: 'Comment mémoriser efficacement les items de cardiologie ?',
          content: 'Je cherche des techniques pour mieux retenir les items...',
          category: 'methode',
          tags: ['mémorisation', 'cardiologie', 'techniques'],
          authorId: 'user1',
          authorName: 'Marie D.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          views: 234,
          replies: 12,
          likes: 45,
          isPinned: true,
          isSolved: false,
          isLiked: true,
          isBookmarked: false,
          lastReplyAt: new Date(Date.now() - 1800000).toISOString(),
          lastReplyAuthor: 'Thomas L.'
        },
        {
          id: '2',
          title: 'Question sur IC-3 : critères diagnostiques',
          content: 'Quelqu\'un peut m\'expliquer les critères de...',
          category: 'cardiologie',
          tags: ['IC-3', 'diagnostic', 'insuffisance cardiaque'],
          authorId: 'user2',
          authorName: 'Lucas B.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
          views: 156,
          replies: 8,
          likes: 23,
          isPinned: false,
          isSolved: true,
          isLiked: false,
          isBookmarked: true,
          lastReplyAt: new Date(Date.now() - 43200000).toISOString(),
          lastReplyAuthor: 'Dr. Sophie M.'
        },
        {
          id: '3',
          title: 'Retour d\'expérience ECOS blancs 2024',
          content: 'Je voulais partager mon retour sur les ECOS...',
          category: 'edn',
          tags: ['ECOS', 'retour expérience', '2024'],
          authorId: 'user3',
          authorName: 'Emma P.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          views: 567,
          replies: 34,
          likes: 89,
          isPinned: false,
          isSolved: false,
          isLiked: true,
          isBookmarked: false,
          lastReplyAt: new Date(Date.now() - 86400000).toISOString(),
          lastReplyAuthor: 'Paul R.'
        },
        {
          id: '4',
          title: 'Besoin d\'aide : neurologie item 331',
          content: 'Je bloque sur cet item depuis plusieurs jours...',
          category: 'neurologie',
          tags: ['item-331', 'aide', 'AVC'],
          authorId: 'user4',
          authorName: 'Julie M.',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          views: 45,
          replies: 0,
          likes: 3,
          isPinned: false,
          isSolved: false,
          isLiked: false,
          isBookmarked: false
        }
      ];

      setTopics(mockTopics);
    } catch (error) {
      console.error('Erreur chargement topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (topicId: string) => {
    const mockReplies: ForumReply[] = [
      {
        id: '1',
        topicId,
        content: 'Excellente question ! Je recommande d\'utiliser la technique de répétition espacée...',
        authorId: 'user5',
        authorName: 'Dr. Sophie M.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 12,
        isLiked: true,
        isBestAnswer: true
      },
      {
        id: '2',
        topicId,
        content: 'J\'ai également eu ce problème. Ce qui m\'a aidé c\'est de...',
        authorId: 'user6',
        authorName: 'Thomas L.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        likes: 5,
        isLiked: false,
        isBestAnswer: false
      }
    ];
    setReplies(mockReplies);
  };

  const selectTopic = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    loadReplies(topic.id);
    // Incrémenter les vues
    setTopics(prev => prev.map(t =>
      t.id === topic.id ? { ...t, views: t.views + 1 } : t
    ));
  };

  const handleLikeTopic = (topicId: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId
        ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
        : t
    ));
  };

  const handleLikeReply = (replyId: string) => {
    setReplies(prev => prev.map(r =>
      r.id === replyId
        ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
  };

  const handleBookmark = (topicId: string) => {
    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, isBookmarked: !t.isBookmarked } : t
    ));
    toast({ title: 'Sauvegardé', description: 'Discussion ajoutée à vos favoris.' });
  };

  const createTopic = () => {
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    const topic: ForumTopic = {
      id: Date.now().toString(),
      title: newTopic.title,
      content: newTopic.content,
      category: newTopic.category,
      tags: newTopic.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: 'current-user',
      authorName: 'Vous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    toast({ title: 'Discussion créée !', description: 'Votre discussion a été publiée.' });
  };

  const submitReply = () => {
    if (!newReply.trim() || !selectedTopic) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      topicId: selectedTopic.id,
      content: newReply,
      authorId: 'current-user',
      authorName: 'Vous',
      createdAt: new Date().toISOString(),
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
    toast({ title: 'Réponse publiée !' });
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
