import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/unified/useAuth';
import { ConsistentBackground } from '@/components/layout/ConsistentBackground';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Plus,
  Star,
  Trophy,
  BookOpen,
  Target
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    specialty: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  type: 'discussion' | 'question' | 'study_group' | 'achievement';
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  subject: string;
  nextSession: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const Community: React.FC = () => {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Dr. Marie Martin',
        avatar: '',
        level: 5,
        specialty: 'Cardiologie'
      },
      content: 'Excellent article sur les nouveaux protocoles de traitement de l\'insuffisance cardiaque. Qu\'en pensez-vous ?',
      timestamp: '2h',
      likes: 24,
      comments: 8,
      tags: ['cardiologie', 'traitement'],
      type: 'discussion'
    },
    {
      id: '2',
      author: {
        name: 'Thomas Dubois',
        avatar: '',
        level: 3,
        specialty: 'Étudiant M4'
      },
      content: 'Quelqu\'un peut-il m\'expliquer la différence entre tachycardie ventriculaire et fibrillation ventriculaire ?',
      timestamp: '4h',
      likes: 12,
      comments: 15,
      tags: ['urgences', 'cardiologie'],
      type: 'question'
    }
  ]);

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'ECN Cardiologie',
      description: 'Préparation intensive pour les ECN en cardiologie',
      members: 15,
      maxMembers: 20,
      subject: 'Cardiologie',
      nextSession: '2024-01-15T18:00',
      difficulty: 'advanced'
    },
    {
      id: '2',
      name: 'Anatomie Débutants',
      description: 'Révisions d\'anatomie pour les premières années',
      members: 8,
      maxMembers: 12,
      subject: 'Anatomie',
      nextSession: '2024-01-14T16:00',
      difficulty: 'beginner'
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.user_metadata?.name || 'Utilisateur',
        avatar: '',
        level: 2,
        specialty: 'Étudiant'
      },
      content: newPost,
      timestamp: 'maintenant',
      likes: 0,
      comments: 0,
      tags: [],
      type: 'discussion'
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-200',
      intermediate: 'bg-yellow-500/20 text-yellow-200',
      advanced: 'bg-red-500/20 text-red-200'
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      discussion: MessageSquare,
      question: Target,
      study_group: Users,
      achievement: Trophy
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  return (
    <ConsistentBackground variant="secondary">
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Communauté Médicale</h1>
            <p className="text-white/70">Échangez, apprenez et progressez ensemble</p>
          </div>

          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Fil d'actualité
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="study-groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groupes d'étude
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Classement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Create Post */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-white/20 text-white">
                            {user?.email?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                          <Textarea
                            placeholder="Partagez vos connaissances, posez une question..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Discussion
                              </Badge>
                            </div>
                            <Button onClick={handleCreatePost} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Publier
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {posts.map((post) => {
                      const TypeIcon = getTypeIcon(post.type);
                      return (
                        <Card key={post.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                          <CardContent className="pt-6">
                            <div className="flex gap-4">
                              <Avatar>
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback className="bg-white/20 text-white">
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-medium">{post.author.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    Niveau {post.author.level}
                                  </Badge>
                                  <span className="text-white/60 text-sm">{post.author.specialty}</span>
                                  <span className="text-white/40 text-sm">•</span>
                                  <span className="text-white/60 text-sm">{post.timestamp}</span>
                                </div>
                                <p className="text-white/90 mb-3">{post.content}</p>
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <Heart className="h-4 w-4" />
                                    {post.likes}
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                    {post.comments}
                                  </button>
                                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                                    <Share2 className="h-4 w-4" />
                                    Partager
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Membres actifs</span>
                        <span className="text-white font-semibold">1,247</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Questions cette semaine</span>
                        <span className="text-white font-semibold">89</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Discussions actives</span>
                        <span className="text-white font-semibold">34</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Sujets populaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {['cardiologie', 'urgences', 'anatomie', 'ECN', 'pédiatrie'].map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="study-groups" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Groupes d'étude</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyGroups.map((group) => (
                  <Card key={group.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">{group.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(group.difficulty)}>
                          {group.difficulty}
                        </Badge>
                        <span className="text-white/60 text-sm">
                          {group.members}/{group.maxMembers} membres
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <BookOpen className="h-4 w-4" />
                          {group.subject}
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <Calendar className="h-4 w-4" />
                          Prochaine session: {new Date(group.nextSession).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white">
                        Rejoindre le groupe
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Top Contributeurs</CardTitle>
                  <CardDescription className="text-white/70">
                    Classement basé sur l'activité et la qualité des contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Dr. Marie Martin', points: 2890, specialty: 'Cardiologie', rank: 1 },
                      { name: 'Prof. Jean Dupont', points: 2756, specialty: 'Neurologie', rank: 2 },
                      { name: 'Dr. Sarah Chen', points: 2634, specialty: 'Urgences', rank: 3 },
                      { name: 'Thomas Dubois', points: 1890, specialty: 'Étudiant M4', rank: 4 },
                    ].map((user) => (
                      <div key={user.rank} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white font-bold">
                          {user.rank}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-white/20 text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{user.name}</h4>
                          <p className="text-white/60 text-sm">{user.specialty}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{user.points.toLocaleString()}</div>
                          <div className="text-white/60 text-sm">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ConsistentBackground>
  );
};

export default Community;