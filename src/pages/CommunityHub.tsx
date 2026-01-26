import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification, XP_PER_LEVEL, POINTS_CONFIG } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import {
    BookOpen,
    Calendar,
    Flame,
    GraduationCap,
    Heart,
    Lightbulb,
    MapPin,
    MessageCircle,
    MessageSquare,
    Plus,
    Share2,
    Star,
    TrendingUp,
    Trophy,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
// Import new community components
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { MentorshipSystem } from '@/components/mentorship/MentorshipSystem';
import { ForumDiscussion } from '@/components/social/ForumDiscussion';
import { ResourceSharing } from '@/components/social/ResourceSharing';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    specialty: string;
    level: string;
  };
  content: string;
  type: 'discussion' | 'question' | 'resource' | 'success';
  tags: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'meetup' | 'competition';
  date: Date;
  participants: number;
  maxParticipants: number;
  isRegistered: boolean;
  location?: string;
}

const CommunityHub = () => {
  const { toast } = useToast();
  const { stats, addPoints } = useGamification();
  const { logActivity } = useActivityTracking();
  const [activeTab, setActiveTab] = useState('feed');
  const [_leaderboard, setLeaderboard] = useState<any[]>([]);
  const [_loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userBadgesCount, setUserBadgesCount] = useState(0);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .maybeSingle();
        setCurrentUser({ ...user, profile });
        
        // Get badges count from stats
        if (stats?.badges) {
          setUserBadgesCount(stats.badges.length);
        }
      }
    };
    loadUser();
  }, [stats]);

  // Load real leaderboard data from user_activity_log
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        // Get aggregated activity data for the past week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: activities, error } = await supabase
          .from('user_activity_log')
          .select('user_id, count')
          .gte('activity_date', weekAgo.toISOString().split('T')[0]);

        if (error) throw error;

        // Aggregate by user
        const userScores: Record<string, number> = {};
        activities?.forEach((a: any) => {
          userScores[a.user_id] = (userScores[a.user_id] || 0) + (a.count || 1) * 10;
        });

        // Get user profiles for names
        const userIds = Object.keys(userScores);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);

          const leaderboardData = Object.entries(userScores)
            .map(([userId, points]) => {
              const profile = profiles?.find((p: any) => p.id === userId);
              return {
                userId,
                name: profile?.name || profile?.email?.split('@')[0] || 'Utilisateur',
                specialty: 'Médecine',
                points,
              };
            })
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map((user, idx) => ({ ...user, rank: idx + 1 }));

          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  const [posts, _setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Dr. Sarah Martin',
        avatar: '',
        specialty: 'Cardiologie',
        level: 'Expert'
      },
      content: 'Excellente session sur l\'IC-78 aujourd\'hui ! Les nouvelles approches musicales pour mémoriser les algorithmes de prise en charge sont vraiment efficaces. Quelqu\'un a-t-il testé la méthode sur d\'autres pathologies ?',
      type: 'discussion',
      tags: ['IC-78', 'cardiologie', 'mémorisation'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8,
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Marie Dubois',
        avatar: '',
        specialty: 'Pédiatrie',
        level: 'Étudiant'
      },
      content: 'Question sur l\'IC-23 : quelqu\'un peut-il m\'expliquer la différence entre les approches de rang A et rang B pour la contraception chez l\'adolescente ? Les tableaux sont un peu confus pour moi 🤔',
      type: 'question',
      tags: ['IC-23', 'pédiatrie', 'aide'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 12,
      comments: 15,
      isLiked: true
    },
    {
      id: '3',
      author: {
        name: 'Prof. Laurent Chen',
        avatar: '',
        specialty: 'Neurologie',
        level: 'Professeur'
      },
      content: 'Nouveau ressource disponible : J\'ai créé une playlist de 15 musiques mnémotechniques pour les items de neurologie (IC-87 à IC-102). Parfait pour les révisions ! 🎵🧠',
      type: 'resource',
      tags: ['neurologie', 'musique', 'ressource'],
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 56,
      comments: 23,
      isLiked: true
    },
    {
      id: '4',
      author: {
        name: 'Thomas Leroux',
        avatar: '',
        specialty: 'Médecine générale',
        level: 'Résident'
      },
      content: '🎉 Victoire ! J\'ai enfin validé tous les items de rang A ! La méthode MED-MNG m\'a vraiment aidé à structurer mes révisions. Merci à toute la communauté pour le soutien !',
      type: 'success',
      tags: ['réussite', 'rang-a', 'motivation'],
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 89,
      comments: 34,
      isLiked: false
    }
  ]);

  const [events, _setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Webinaire : Nouvelles Approches Pédagogiques',
      description: 'Découvrez les dernières innovations en pédagogie médicale et l\'utilisation de la musique dans l\'apprentissage',
      type: 'webinar',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      participants: 187,
      maxParticipants: 500,
      isRegistered: false,
      location: 'En ligne'
    },
    {
      id: '2',
      title: 'Atelier Pratique : Mémorisation Musicale',
      description: 'Session pratique pour apprendre à créer ses propres mnémotechniques musicales',
      type: 'workshop',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: 23,
      maxParticipants: 30,
      isRegistered: true,
      location: 'Paris, Faculté de Médecine'
    },
    {
      id: '3',
      title: 'Concours : Meilleure Chanson EDN',
      description: 'Participez au concours de création musicale pour les items EDN. Prix : 500€ !',
      type: 'competition',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      participants: 78,
      maxParticipants: 0,
      isRegistered: false
    }
  ]);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <MessageCircle className="h-4 w-4" />;
      case 'question': return <Lightbulb className="h-4 w-4" />;
      case 'resource': return <BookOpen className="h-4 w-4" />;
      case 'success': return <Trophy className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion': return 'bg-primary/10 text-primary';
      case 'question': return 'bg-warning/10 text-warning';
      case 'resource': return 'bg-success/10 text-success';
      case 'success': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <Users className="h-4 w-4" />;
      case 'workshop': return <BookOpen className="h-4 w-4" />;
      case 'meetup': return <MapPin className="h-4 w-4" />;
      case 'competition': return <Trophy className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-primary/10 text-primary';
      case 'workshop': return 'bg-success/10 text-success';
      case 'meetup': return 'bg-accent/10 text-accent';
      case 'competition': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleLike = async (postId: string) => {
    // Track like activity
    if (currentUser) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'community_like', postId }
      });
      await addPoints(currentUser.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
    }
    
    toast({
      title: "👍 Post liké",
      description: "Votre réaction a été enregistrée",
    });
  };

  const handleRegister = async (eventId: string) => {
    // Track event registration
    if (currentUser) {
      await logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { action: 'event_registration', eventId }
      });
      await addPoints(currentUser.id, POINTS_CONFIG.dailyStreak, 'dailyStreak');
    }
    
    toast({
      title: "✅ Inscription confirmée",
      description: "Vous êtes maintenant inscrit à cet événement",
    });
  };

  return (
    <>
      <Helmet>
        <title>Hub Communautaire | MED-MNG</title>
        <meta name="description" content="Rejoignez la communauté MED-MNG, partagez vos expériences et participez aux événements" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Hub Communautaire</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connectez-vous avec d'autres étudiants et professionnels de santé, partagez vos expériences et apprenez ensemble
          </p>
        </div>

        {/* User Profile Card */}
        {currentUser && stats && (
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {(currentUser.profile?.name || currentUser.email)?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {currentUser.profile?.name || currentUser.email?.split('@')[0]}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {stats.currentStreak} jours
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Niveau {stats.level}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3 text-amber-500" />
                      {userBadgesCount} badges
                    </Badge>
                  </div>
                </div>

                <div className="w-full md:w-48 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>XP</span>
                    <span>{stats.totalPoints % XP_PER_LEVEL} / {XP_PER_LEVEL}</span>
                  </div>
                  <Progress
                    value={(stats.totalPoints % XP_PER_LEVEL) / XP_PER_LEVEL * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistiques de la communauté */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-sm text-muted-foreground">Membres actifs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold">1,523</div>
              <p className="text-sm text-muted-foreground">Discussions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">456</div>
              <p className="text-sm text-muted-foreground">Ressources partagées</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">23</div>
              <p className="text-sm text-muted-foreground">Événements ce mois</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Fil</span>
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Forum</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Événements</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Ressources</span>
            </TabsTrigger>
            <TabsTrigger value="mentorship" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Mentorat</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Classement</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Fil d'Actualité</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Post
              </Button>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{post.author.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {post.author.specialty}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {post.author.level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {post.timestamp.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getPostTypeColor(post.type)}>
                        {getPostTypeIcon(post.type)}
                        <span className="ml-1 capitalize">{post.type}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-foreground leading-relaxed">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 ${post.isLiked ? 'text-destructive' : ''}`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Événements à Venir</h2>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Proposer un Événement
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          {event.title}
                        </CardTitle>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      {event.isRegistered && (
                        <Badge className="bg-success/10 text-success">Inscrit</Badge>
                      )}
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {event.date.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.participants} participants
                      {event.maxParticipants > 0 && ` / ${event.maxParticipants} max`}
                    </div>
                    
                    {!event.isRegistered ? (
                      <Button 
                        onClick={() => handleRegister(event.id)}
                        className="w-full"
                        disabled={event.maxParticipants > 0 && event.participants >= event.maxParticipants}
                      >
                        {event.maxParticipants > 0 && event.participants >= event.maxParticipants 
                          ? 'Complet' 
                          : 'S\'inscrire'
                        }
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full">
                        Inscrit ✓
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forum" className="space-y-6">
            <ForumDiscussion />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <ResourceSharing />
          </TabsContent>

          <TabsContent value="mentorship" className="space-y-6">
            <MentorshipSystem />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CommunityHub;