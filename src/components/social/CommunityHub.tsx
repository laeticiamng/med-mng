import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MessageCircle, Heart, Share2, Users, TrendingUp,
  BookOpen, Music, Award, Search, Plus, Filter,
  Clock, Star, ThumbsUp, Send, Image, Smile, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommentThread } from './CommentThread';
import { DirectMessaging } from './DirectMessaging';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    badge?: string;
  };
  content: string;
  type: 'discussion' | 'question' | 'study_tip' | 'achievement';
  category: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
  images?: string[];
}

interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isPublic: boolean;
  lastActivity: string;
  isMember: boolean;
  avatar?: string;
  sharedMaterials?: { id: string; title: string; type: string }[];
}

export const CommunityHub = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [showDM, setShowDM] = useState(false);
  const [dmRecipient, setDmRecipient] = useState<string | null>(null);
  const [dmContent, setDmContent] = useState('');
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Load posts and user profiles in parallel for better performance
      const [postsResult, profilesResult] = await Promise.all([
        (supabase as any)
          .from('community_posts')
          .select('*, community_post_likes(user_id)')
          .order('created_at', { ascending: false })
          .limit(20),
        (supabase as any)
          .from('profiles')
          .select('id, display_name, avatar_url') as Promise<{ data: { id: string; display_name?: string; avatar_url?: string }[] | null }>
      ]);
      
      const dbPosts = postsResult.data;
      const profiles = new Map((profilesResult.data || []).map((p) => [p.id, p]));
      
      if (dbPosts && dbPosts.length > 0) {
        const formattedPosts: CommunityPost[] = dbPosts.map((p: any) => {
          const profile = profiles.get(p.user_id);
          return {
            id: p.id,
            author: {
              id: p.user_id,
              name: profile?.display_name || 'Utilisateur',
              avatar: profile?.avatar_url,
              level: 10,
              badge: 'Membre'
            },
            content: p.content,
            type: p.post_type as CommunityPost['type'],
            category: p.category,
            likes: p.likes_count || 0,
            comments: p.comments_count || 0,
            shares: p.shares_count || 0,
            isLiked: user ? p.community_post_likes?.some((l: any) => l.user_id === user.id) : false,
            createdAt: p.created_at,
            tags: p.tags || [],
            images: p.images || []
          };
        });
        setPosts(formattedPosts);
      } else {
        // Fallback to sample posts
        setPosts(getSamplePosts());
      }
      
      // Load study groups from Supabase
      const { data: dbGroups } = await (supabase as any)
        .from('study_groups')
        .select('*, study_group_members(user_id)')
        .order('last_activity_at', { ascending: false });
      
      if (dbGroups && dbGroups.length > 0) {
        const formattedGroups: StudyGroup[] = dbGroups.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description || '',
          memberCount: g.member_count || 0,
          category: g.category,
          isPublic: g.is_public,
          lastActivity: g.last_activity_at,
          isMember: user ? g.study_group_members?.some((m: any) => m.user_id === user.id) : false
        }));
        setStudyGroups(formattedGroups);
      } else {
        setStudyGroups(getSampleGroups());
      }
    } catch (error) {
      console.error('Error loading community data:', error);
      setPosts(getSamplePosts());
      setStudyGroups(getSampleGroups());
    } finally {
      setLoading(false);
    }
  };

  const getSamplePosts = (): CommunityPost[] => [
    {
      id: '1',
      author: { id: 'user1', name: 'Dr. Sophie Martin', level: 15, badge: 'Expert' },
      content: 'Astuce du jour : Pour mémoriser les voies anatomiques, j\'utilise la technique des palais de mémoire. 🧠',
      type: 'study_tip',
      category: 'Anatomie',
      likes: 23, comments: 8, shares: 5,
      isLiked: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['mémoire', 'anatomie']
    },
    {
      id: '2',
      author: { id: 'user2', name: 'Marc Dubois', level: 12, badge: 'Collaborateur' },
      content: 'Je viens de terminer l\'IC-3 ! Les quiz musicaux m\'ont vraiment aidé.',
      type: 'achievement',
      category: 'Réussite',
      likes: 17, comments: 12, shares: 3,
      isLiked: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      tags: ['IC-3', 'musique']
    }
  ];

  const getSampleGroups = (): StudyGroup[] => [
    { id: '1', name: 'Cardiologie Avancée', description: 'Groupe d\'étude cardiologie', memberCount: 124, category: 'Spécialité', isPublic: true, lastActivity: new Date().toISOString(), isMember: false },
    { id: '2', name: 'Préparation ECN 2024', description: 'Préparation aux ECN', memberCount: 89, category: 'Examens', isPublic: true, lastActivity: new Date().toISOString(), isMember: false }
  ];

  const handleLike = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.isLiked) {
        await (supabase as any).from('community_post_likes').delete()
          .eq('post_id', postId).eq('user_id', user.id);
        await (supabase as any).from('community_posts').update({ likes_count: Math.max(0, post.likes - 1) }).eq('id', postId);
      } else {
        await (supabase as any).from('community_post_likes').insert({ post_id: postId, user_id: user.id });
        await (supabase as any).from('community_posts').update({ likes_count: post.likes + 1 }).eq('id', postId);
      }
      
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      ));
    } catch (e) {
      console.error('Error toggling like:', e);
      // Local fallback
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
      ));
    }
  };

  const handleShare = (postId: string) => {
    toast({ title: "Post partagé !", description: "Le post a été partagé avec succès." });
  };

  const handleJoinGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    try {
      if (group.isMember) {
        await (supabase as any).from('study_group_members').delete()
          .eq('group_id', groupId).eq('user_id', user.id);
        await (supabase as any).from('study_groups').update({ member_count: Math.max(0, group.memberCount - 1) }).eq('id', groupId);
      } else {
        await (supabase as any).from('study_group_members').insert({ group_id: groupId, user_id: user.id });
        await (supabase as any).from('study_groups').update({ member_count: group.memberCount + 1 }).eq('id', groupId);
      }
      
      setStudyGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, isMember: !g.isMember, memberCount: g.isMember ? g.memberCount - 1 : g.memberCount + 1 } : g
      ));
      
      toast({ title: group.isMember ? "Groupe quitté" : "Groupe rejoint !" });
    } catch (e) {
      console.error('Error toggling membership:', e);
      setStudyGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, isMember: !g.isMember, memberCount: g.isMember ? g.memberCount - 1 : g.memberCount + 1 } : g
      ));
      toast({ title: group.isMember ? "Groupe quitté" : "Groupe rejoint !" });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return;
    }

    try {
      const { data: newDbPost } = await (supabase as any)
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPost,
          post_type: 'discussion',
          category: 'Général',
          tags: []
        })
        .select()
        .maybeSingle();

      if (newDbPost) {
        const post: CommunityPost = {
          id: newDbPost.id,
          author: { id: user.id, name: 'Vous', level: 12, badge: 'Étudiant' },
          content: newPost,
          type: 'discussion',
          category: 'Général',
          likes: 0, comments: 0, shares: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          tags: []
        };
        setPosts(prev => [post, ...prev]);
      }
    } catch (e) {
      console.error('Error creating post:', e);
      // Local fallback
      const post: CommunityPost = {
        id: Date.now().toString(),
        author: { id: 'current-user', name: 'Vous', level: 12, badge: 'Étudiant' },
        content: newPost,
        type: 'discussion',
        category: 'Général',
        likes: 0, comments: 0, shares: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        tags: []
      };
      setPosts(prev => [post, ...prev]);
    }
    
    setNewPost('');
    toast({ title: "Post publié !", description: "Votre message a été partagé avec la communauté." });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <MessageCircle className="h-4 w-4" />;
      case 'study_tip': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-primary/10 text-primary';
      case 'study_tip': return 'bg-success/10 text-success';
      case 'achievement': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredPosts = posts.filter(post =>
    (selectedCategory === 'all' || post.category === selectedCategory) &&
    (searchTerm === '' || 
     post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
     post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const categories = ['all', 'Anatomie', 'Cardiologie', 'Réussite', 'Bien-être', 'Fonctionnalités'];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Hub Communautaire
          </CardTitle>
          <CardDescription>
            Connectez-vous avec d'autres étudiants en médecine, partagez vos expériences et apprenez ensemble
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Fil
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groupes
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Création de post */}
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Partagez vos idées, posez une question ou partagez une astuce d'étude..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="medical-input resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Smile className="h-4 w-4" />
                      Emoji
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="medical-btn-primary"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtres */}
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher dans les posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 medical-input"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'Tous' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des posts */}
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <Card key={post.id} className="medical-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* En-tête du post */}
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.author.name}</h4>
                          <Badge variant="secondary">Niveau {post.author.level}</Badge>
                          {post.author.badge && (
                            <Badge variant="outline">{post.author.badge}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPostTypeColor(post.type)}`}>
                            {getPostTypeIcon(post.type)}
                            {post.type === 'study_tip' && 'Astuce'}
                            {post.type === 'question' && 'Question'}
                            {post.type === 'achievement' && 'Réussite'}
                            {post.type === 'discussion' && 'Discussion'}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contenu du post */}
                    <div className="pl-12">
                      <p className="text-foreground leading-relaxed">{post.content}</p>
                      
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pl-12 flex items-center gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 ${post.isLiked ? 'text-destructive' : 'text-muted-foreground'}`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 pl-12">
                          <CommentThread postId={post.id} onCommentAdded={() => loadCommunityData()} />
                        </CollapsibleContent>
                      </Collapsible>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                        {post.shares}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <DirectMessaging />
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {/* Création de groupe */}
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Créer un groupe d'étude</h3>
                  <p className="text-sm text-muted-foreground">
                    Organisez des sessions d'étude collaborative
                  </p>
                </div>
                <Button className="medical-btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau groupe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des groupes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyGroups.map(group => (
              <Card key={group.id} className="medical-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                      </div>
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.memberCount} membres
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(group.lastActivity)}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleJoinGroup(group.id)}
                      variant={group.isMember ? 'outline' : 'default'}
                      className="w-full"
                    >
                      {group.isMember ? 'Quitter' : 'Rejoindre'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sujets populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tag: 'cardiologie', posts: 24, trend: '+15%' },
                  { tag: 'anatomie', posts: 18, trend: '+8%' },
                  { tag: 'révisions', posts: 31, trend: '+22%' },
                  { tag: 'musique-médicale', posts: 12, trend: '+45%' },
                  { tag: 'stress-examens', posts: 28, trend: '+12%' }
                ].map((topic, index) => (
                  <div key={topic.tag} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">#{topic.tag}</p>
                        <p className="text-sm text-muted-foreground">
                          {topic.posts} posts
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-success">
                      {topic.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};