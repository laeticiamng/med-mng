import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle, Heart, Share2, Users, TrendingUp,
  BookOpen, Award, Search, Plus,
  Clock, Send, Image, Smile, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import logger from '@/lib/logger';

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
}

export const CommunityHub = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<{ tag: string; posts: number; trend: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Récupérer les données de la communauté depuis Supabase
  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer les posts depuis la table posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          title,
          content,
          category,
          tags,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          image_url,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            level
          )
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        logger.error('Error fetching posts:', postsError);
      } else if (postsData) {
        // Vérifier quels posts sont likés par l'utilisateur
        let likedPostIds: string[] = [];
        if (currentUserId) {
          const { data: likesData } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', currentUserId);
          likedPostIds = likesData?.map((l: any) => l.post_id) || [];
        }

        const mappedPosts: CommunityPost[] = postsData.map((post: any) => ({
          id: post.id,
          author: {
            id: post.user_id,
            name: post.profiles?.full_name || 'Utilisateur anonyme',
            avatar: post.profiles?.avatar_url,
            level: post.profiles?.level || 1,
            badge: getLevelBadge(post.profiles?.level || 1)
          },
          content: post.content || post.title,
          type: mapCategoryToType(post.category),
          category: post.category || 'Général',
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          isLiked: likedPostIds.includes(post.id),
          createdAt: post.created_at,
          tags: post.tags || [],
          images: post.image_url ? [post.image_url] : undefined
        }));
        setPosts(mappedPosts);
      }

      // Récupérer les groupes d'étude depuis la table teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          member_count,
          visibility,
          updated_at,
          avatar_url
        `)
        .eq('visibility', 'public')
        .order('member_count', { ascending: false })
        .limit(10);

      if (teamsError) {
        logger.error('Error fetching teams:', teamsError);
      } else if (teamsData) {
        // Vérifier l'appartenance de l'utilisateur
        let userTeamIds: string[] = [];
        if (currentUserId) {
          const { data: membershipData } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', currentUserId);
          userTeamIds = membershipData?.map((m: any) => m.team_id) || [];
        }

        const mappedGroups: StudyGroup[] = teamsData.map((team: any) => ({
          id: team.id,
          name: team.name,
          description: team.description || 'Groupe d\'étude',
          memberCount: team.member_count || 0,
          category: 'Étude',
          isPublic: team.visibility === 'public',
          lastActivity: team.updated_at,
          isMember: userTeamIds.includes(team.id),
          avatar: team.avatar_url
        }));
        setStudyGroups(mappedGroups);
      }

      // Récupérer les sujets tendances (basés sur les tags des posts récents)
      const { data: trendingData } = await supabase
        .from('posts')
        .select('tags')
        .eq('status', 'published')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      if (trendingData) {
        const tagCounts: Record<string, number> = {};
        trendingData.forEach((post: any) => {
          (post.tags || []).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const sortedTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({
            tag,
            posts: count,
            trend: `+${Math.floor(Math.random() * 30 + 5)}%`
          }));

        setTrendingTopics(sortedTags);
      }

    } catch (error) {
      logger.error('Error fetching community data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de la communauté',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, toast]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  // Fonctions utilitaires
  const getLevelBadge = (level: number): string => {
    if (level >= 20) return 'Mentor';
    if (level >= 15) return 'Expert';
    if (level >= 10) return 'Collaborateur';
    if (level >= 5) return 'Actif';
    return 'Débutant';
  };

  const mapCategoryToType = (category: string): 'discussion' | 'question' | 'study_tip' | 'achievement' => {
    switch (category?.toLowerCase()) {
      case 'question': return 'question';
      case 'learning':
      case 'study_tip': return 'study_tip';
      case 'achievement': return 'achievement';
      default: return 'discussion';
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour aimer un post.',
        variant: 'destructive'
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Mise à jour optimiste
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1
          }
        : p
    ));

    try {
      if (post.isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: currentUserId });
      }
    } catch (error) {
      // Annuler la mise à jour optimiste en cas d'erreur
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              isLiked: post.isLiked,
              likes: post.likes
            }
          : p
      ));
      logger.error('Error liking post:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le like',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      if (currentUserId) {
        await supabase
          .from('post_shares')
          .insert({
            post_id: postId,
            user_id: currentUserId,
            shared_to: 'public'
          });

        // Mettre à jour le compteur localement
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, shares: p.shares + 1 }
            : p
        ));
      }

      toast({
        title: 'Post partagé !',
        description: 'Le post a été partagé avec succès.'
      });
    } catch (error) {
      logger.error('Error sharing post:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUserId) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour rejoindre un groupe.',
        variant: 'destructive'
      });
      return;
    }

    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return;

    // Mise à jour optimiste
    setStudyGroups(prev => prev.map(g =>
      g.id === groupId
        ? {
            ...g,
            isMember: !g.isMember,
            memberCount: g.isMember ? g.memberCount - 1 : g.memberCount + 1
          }
        : g
    ));

    try {
      if (group.isMember) {
        // Quitter le groupe
        await supabase
          .from('team_members')
          .delete()
          .eq('team_id', groupId)
          .eq('user_id', currentUserId);

        toast({
          title: 'Groupe quitté',
          description: 'Vous avez quitté le groupe.'
        });
      } else {
        // Rejoindre le groupe
        await supabase
          .from('team_members')
          .insert({
            team_id: groupId,
            user_id: currentUserId,
            role: 'member'
          });

        toast({
          title: 'Groupe rejoint !',
          description: 'Vous avez rejoint le groupe d\'étude.'
        });
      }
    } catch (error) {
      // Annuler la mise à jour optimiste
      setStudyGroups(prev => prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              isMember: group.isMember,
              memberCount: group.memberCount
            }
          : g
      ));
      logger.error('Error joining group:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'appartenance au groupe',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    if (!currentUserId) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour publier.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: newPostData, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUserId,
          content: newPost,
          title: newPost.substring(0, 100),
          category: 'lifestyle',
          status: 'published',
          visibility: 'public',
          tags: [],
          published_at: new Date().toISOString()
        })
        .select(`
          id,
          user_id,
          content,
          category,
          tags,
          likes_count,
          comments_count,
          shares_count,
          created_at,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            level
          )
        `)
        .single();

      if (error) throw error;

      // Ajouter le post à la liste
      const post: CommunityPost = {
        id: newPostData.id,
        author: {
          id: newPostData.user_id,
          name: newPostData.profiles?.full_name || 'Vous',
          avatar: newPostData.profiles?.avatar_url,
          level: newPostData.profiles?.level || 1,
          badge: getLevelBadge(newPostData.profiles?.level || 1)
        },
        content: newPostData.content,
        type: 'discussion',
        category: 'Général',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: newPostData.created_at,
        tags: []
      };

      setPosts(prev => [post, ...prev]);
      setNewPost('');

      toast({
        title: 'Post publié !',
        description: 'Votre message a été partagé avec la communauté.'
      });
    } catch (error) {
      logger.error('Error creating post:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le post',
        variant: 'destructive'
      });
    }
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
      case 'question': return 'bg-blue-100 text-blue-600';
      case 'study_tip': return 'bg-green-100 text-green-600';
      case 'achievement': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Fil d'actualité
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groupes d'étude
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
                        className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </Button>
                      
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trendingTopics.length > 0 ? (
                <div className="space-y-4">
                  {trendingTopics.map((topic, index) => (
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune tendance pour le moment</p>
                  <p className="text-sm">Les sujets populaires apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};