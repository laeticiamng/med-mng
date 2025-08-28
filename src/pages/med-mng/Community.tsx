import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Trophy, 
  Star,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  BookOpen
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';
import { useToast } from '@/hooks/use-toast';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    university: string;
    year: string;
  };
  content: string;
  category: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  tags: string[];
  hasLiked?: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  isPrivate: boolean;
  nextSession?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  university: string;
  points: number;
  streak: number;
}

const Community = () => {
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [posts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: {
        name: 'Marie Dubois',
        university: 'Paris Descartes',
        year: 'D4'
      },
      content: 'Quelqu\'un aurait-il des mnémotechniques efficaces pour retenir les antiarythmiques ? Je galère avec la classification de Vaughan Williams ! 😅',
      category: 'Cardiologie',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2h',
      tags: ['cardiologie', 'pharmacologie', 'aide'],
      hasLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Thomas Martin',
        university: 'Lyon 1',
        year: 'D3'
      },
      content: 'Excellente session d\'étude sur les AVC aujourd\'hui ! Les nouvelles chansons MED-MNG sont vraiment efficaces. Qui veut réviser ensemble demain ?',
      category: 'Neurologie',
      likes: 31,
      comments: 12,
      shares: 7,
      timestamp: '4h',
      tags: ['neurologie', 'avc', 'groupe-etude'],
      hasLiked: true
    }
  ]);

  const [studyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'Cardiologie Intensive',
      description: 'Groupe d\'étude focalisé sur la cardiologie pour les D3/D4',
      members: 28,
      category: 'Cardiologie',
      isPrivate: false,
      nextSession: '2024-01-16 18:00'
    },
    {
      id: '2',
      name: 'Urgences & Réanimation',
      description: 'Préparation aux situations d\'urgence et réanimation',
      members: 45,
      category: 'Urgences',
      isPrivate: false,
      nextSession: '2024-01-17 19:30'
    },
    {
      id: '3',
      name: 'Révisions ECN Paris',
      description: 'Groupe privé pour les révisions ECN - Paris uniquement',
      members: 15,
      category: 'ECN',
      isPrivate: true
    }
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      name: 'Sophie Chen',
      university: 'Sorbonne',
      points: 2847,
      streak: 12
    },
    {
      rank: 2,
      name: 'Alexandre Roy',
      university: 'Lyon 1',
      points: 2735,
      streak: 8
    },
    {
      rank: 3,
      name: 'Emma Bernard',
      university: 'Marseille',
      points: 2698,
      streak: 15
    }
  ]);

  const handleLike = (postId: string) => {
    toast({
      title: "Interaction enregistrée",
      description: "Votre réaction a été prise en compte !",
    });
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`https://medmng.com/community/post/${postId}`);
    toast({
      title: "Lien copié",
      description: "Le lien du post a été copié dans votre presse-papier.",
    });
  };

  const createPost = () => {
    if (!newPostContent.trim()) return;
    
    toast({
      title: "Post publié",
      description: "Votre message a été partagé avec la communauté !",
    });
    setNewPostContent('');
  };

  const joinGroup = (groupId: string) => {
    toast({
      title: "Groupe rejoint",
      description: "Vous avez rejoint le groupe d'étude !",
    });
  };

  return (
    <MedMngLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Communauté MED-MNG</h1>
          <p className="text-gray-600">
            Connectez-vous avec d'autres étudiants en médecine et partagez vos connaissances
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="feed" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed">Fil d'actualité</TabsTrigger>
                <TabsTrigger value="groups">Groupes d'étude</TabsTrigger>
                <TabsTrigger value="events">Événements</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {/* Créer un post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Partager avec la communauté
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Partagez une question, une découverte, ou encouragez vos collègues..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          {['Cardiologie', 'Neurologie', 'Pédiatrie', 'Question', 'Aide'].map((tag) => (
                            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50">
                              #{tag.toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                        <Button onClick={createPost} disabled={!newPostContent.trim()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Publier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recherche et filtres */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Rechercher dans les discussions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Liste des posts */}
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{post.author.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {post.author.university} • {post.author.year}
                            </Badge>
                            <span className="text-gray-500 text-sm">• {post.timestamp}</span>
                          </div>
                          
                          <Badge className="mb-3 bg-blue-100 text-blue-800">
                            {post.category}
                          </Badge>
                          
                          <p className="text-gray-700 mb-4">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-6 text-gray-500">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={post.hasLiked ? 'text-red-500' : ''}
                            >
                              <Heart className={`h-4 w-4 mr-1 ${post.hasLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                              <Share2 className="h-4 w-4 mr-1" />
                              {post.shares}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="groups" className="space-y-6">
                {studyGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{group.name}</h3>
                            {group.isPrivate && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                                Privé
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{group.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {group.members} membres
                            </span>
                            <Badge className="bg-purple-100 text-purple-800">
                              {group.category}
                            </Badge>
                            {group.nextSession && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Prochaine session: {new Date(group.nextSession).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button onClick={() => joinGroup(group.id)}>
                          Rejoindre
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Créer un groupe d'étude</h3>
                    <p className="text-gray-600 mb-4">
                      Organisez vos propres sessions d'étude et invitez d'autres étudiants
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un groupe
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Événements à venir</h3>
                      <p className="text-gray-600 mb-4">
                        Découvrez les événements organisés par la communauté MED-MNG
                      </p>
                      <Button variant="outline">
                        Voir le calendrier complet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Classement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Classement Hebdomadaire
                </CardTitle>
                <CardDescription>
                  Top des étudiants les plus actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {entry.rank}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar} />
                        <AvatarFallback>
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{entry.name}</p>
                        <p className="text-xs text-gray-500">{entry.university}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{entry.points}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {entry.streak}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistiques communauté */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Membres actifs</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Posts cette semaine</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Groupes d'étude</span>
                    <span className="font-bold">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sessions terminées</span>
                    <span className="font-bold">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Suggestions pour vous</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 text-sm">Groupe Cardiologie Avancée</p>
                    <p className="text-blue-700 text-xs">Basé sur vos centres d'intérêt</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 text-sm">Révisions ECN Paris</p>
                    <p className="text-green-700 text-xs">Étudiants de votre université</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900 text-sm">Session Neurologie</p>
                    <p className="text-purple-700 text-xs">Demain à 18h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default withAuth(Community);