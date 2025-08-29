import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Search, 
  Heart, 
  MessageCircle, 
  Share, 
  Star,
  Calendar,
  Award,
  Bookmark
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    verified: boolean;
  };
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  badges: string[];
  contributions: number;
  reputation: number;
}

const Community: React.FC = () => {
  const { trackEvent } = usePlatformAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Dr. Sophie Martin',
        avatar: '/avatars/sophie.jpg',
        role: 'Médecin urgentiste',
        verified: true
      },
      content: 'Excellente session de formation sur les nouvelles techniques de réanimation. Le module EDN permet vraiment une approche immersive qui améliore la rétention des connaissances. Recommandé pour tous les praticiens !',
      category: 'Formation',
      timestamp: '2h',
      likes: 24,
      comments: 8,
      shares: 3,
      tags: ['EDN', 'Réanimation', 'Formation'],
      isLiked: false,
      isBookmarked: true
    },
    {
      id: '2',
      author: {
        name: 'Prof. Antoine Dubois',
        avatar: '/avatars/antoine.jpg',
        role: 'Professeur de médecine',
        verified: true
      },
      content: 'Je partage avec vous cette étude de cas intéressante sur l\'utilisation de l\'IA dans le diagnostic précoce. Les outils MED-MNG offrent des perspectives prometteuses pour l\'analyse prédictive.',
      category: 'Recherche',
      timestamp: '4h',
      likes: 45,
      comments: 12,
      shares: 7,
      tags: ['IA', 'Diagnostic', 'Recherche'],
      isLiked: true,
      isBookmarked: false
    },
    {
      id: '3',
      author: {
        name: 'Dr. Marie Leroy',
        avatar: '/avatars/marie.jpg',
        role: 'Cardiologue',
        verified: false
      },
      content: 'Question à la communauté : quelles sont vos meilleures pratiques pour l\'utilisation des simulations ECOS ? J\'aimerais optimiser mes sessions de formation.',
      category: 'Discussion',
      timestamp: '6h',
      likes: 18,
      comments: 15,
      shares: 2,  
      tags: ['ECOS', 'Simulation', 'Bonnes pratiques'],
      isLiked: false,
      isBookmarked: false
    }
  ]);

  const [topUsers, setTopUsers] = useState<CommunityUser[]>([
    {
      id: '1',
      name: 'Dr. Sophie Martin',
      avatar: '/avatars/sophie.jpg',
      role: 'Médecin urgentiste',
      badges: ['Expert', 'Contributeur actif', 'Mentor'],
      contributions: 156,
      reputation: 2850
    },
    {
      id: '2',  
      name: 'Prof. Antoine Dubois',
      avatar: '/avatars/antoine.jpg',
      role: 'Professeur',
      badges: ['Chercheur', 'Innovateur', 'Leader'],
      contributions: 203,
      reputation: 3240
    },
    {
      id: '3',
      name: 'Dr. Claire Moreau',
      avatar: '/avatars/claire.jpg',
      role: 'Pédiatre',
      badges: ['Spécialiste', 'Éducateur'],
      contributions: 89,
      reputation: 1920
    }
  ]);

  useEffect(() => {
    trackEvent('community_visit');
  }, [trackEvent]);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
    trackEvent('community_like', { post_id: postId });
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    trackEvent('community_bookmark', { post_id: postId });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || 
      post.category.toLowerCase() === activeFilter.toLowerCase();
      
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', 'formation', 'recherche', 'discussion', 'annonces'];

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Communauté MED-MNG</h1>
            <p className="text-white/70">Partagez, apprenez et collaborez avec la communauté médicale</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Stats de la communauté */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-white/80 text-sm">Membres</span>
                      </div>
                      <span className="text-white font-medium">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-400" />
                        <span className="text-white/80 text-sm">Posts</span>
                      </div>
                      <span className="text-white font-medium">3,891</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-white/80 text-sm">Actifs</span>
                      </div>
                      <span className="text-white font-medium">423</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Top contributeurs */}
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Top Contributeurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topUsers.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-sm">#{index + 1}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-white/20 text-white text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{user.name}</p>
                          <p className="text-white/60 text-xs">{user.reputation} pts</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Filters */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                      <Input
                        placeholder="Rechercher dans la communauté..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={activeFilter === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveFilter(category)}
                          className={`${
                            activeFilter === category
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                          } capitalize`}
                        >
                          {category === 'all' ? 'Tout' : category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Posts */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="pt-6">
                      {/* Author info */}
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback className="bg-white/20 text-white">
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{post.author.name}</h4>
                            {post.author.verified && (
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            )}
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 text-xs">
                              {post.author.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>Il y a {post.timestamp}</span>
                            <span>•</span>
                            <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-white/90 leading-relaxed">{post.content}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="border-white/20 text-white/70 text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`text-white/70 hover:text-white ${
                              post.isLiked ? 'text-red-400 hover:text-red-300' : ''
                            }`}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white"
                          >
                            <Share className="h-4 w-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(post.id)}
                          className={`text-white/70 hover:text-white ${
                            post.isBookmarked ? 'text-yellow-400 hover:text-yellow-300' : ''
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredPosts.length === 0 && (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-medium mb-2">
                        Aucun post trouvé
                      </h3>
                      <p className="text-white/60">
                        Essayez de modifier vos filtres ou votre recherche.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Community;