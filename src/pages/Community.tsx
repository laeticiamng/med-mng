import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  BookOpen, 
  ArrowLeft,
  Search,
  Heart,
  Share2,
  UserPlus,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Target
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';

interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  speciality: string;
  level: number;
  points: number;
  badge: string;
  isOnline: boolean;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  lastActivity: string;
  category: string;
  isHot: boolean;
}

interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  participants: number;
  maxParticipants: number;
}

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchQuery, setSearchQuery] = useState('');

  const topMembers: CommunityMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Martin',
      avatar: '/api/placeholder/32/32',
      speciality: 'Cardiologie',
      level: 12,
      points: 2847,
      badge: 'Expert',
      isOnline: true
    },
    {
      id: '2',
      name: 'Alex Dubois',
      avatar: '/api/placeholder/32/32',
      speciality: 'Médecine Générale',
      level: 8,
      points: 1923,
      badge: 'Mentor',
      isOnline: false
    },
    {
      id: '3',
      name: 'Marie Chen',
      avatar: '/api/placeholder/32/32',
      speciality: 'Neurologie',
      level: 15,
      points: 3456,
      badge: 'Maître',
      isOnline: true
    }
  ];

  const discussions: Discussion[] = [
    {
      id: '1',
      title: 'Nouvelles techniques en cardiologie interventionnelle',
      author: 'Dr. Martin',
      replies: 23,
      likes: 45,
      lastActivity: 'il y a 2h',
      category: 'Cardiologie',
      isHot: true
    },
    {
      id: '2',
      title: 'Préparation ECN 2024 - Conseils et stratégies',
      author: 'Alex Dubois',
      replies: 67,
      likes: 89,
      lastActivity: 'il y a 4h',
      category: 'ECN',
      isHot: true
    },
    {
      id: '3',
      title: 'Cas clinique complexe en neurologie',
      author: 'Marie Chen',
      replies: 12,
      likes: 28,
      lastActivity: 'il y a 6h',
      category: 'Neurologie',
      isHot: false
    }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Webinaire: Intelligence Artificielle en Médecine',
      type: 'Webinaire',
      date: '2024-02-15 14:00',
      participants: 45,
      maxParticipants: 100
    },
    {
      id: '2',
      title: 'Défi QCM Hebdomadaire',
      type: 'Compétition',
      date: '2024-02-12 20:00',
      participants: 156,
      maxParticipants: 200
    },
    {
      id: '3',
      title: 'Session de révision collaborative',
      type: 'Étude de groupe',
      date: '2024-02-18 18:00',
      participants: 23,
      maxParticipants: 30
    }
  ];

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        {/* Header */}
        <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Communauté MED-MNG</h1>
              <p className="text-muted-foreground">Connectez-vous avec d'autres étudiants et professionnels</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Membres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Top Membres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="text-sm font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.points} pts</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {member.badge}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <UserPlus className="w-4 h-4" />
                  Voir tous
                </Button>
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Membres actifs</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Discussions</span>
                  <span className="text-sm font-medium">589</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Réponses</span>
                  <span className="text-sm font-medium">3,421</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Événements</span>
                  <span className="text-sm font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="discussions" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Événements
                </TabsTrigger>
                <TabsTrigger value="achievements" className="gap-2">
                  <Award className="w-4 h-4" />
                  Succès
                </TabsTrigger>
              </TabsList>

              {/* Discussions */}
              <TabsContent value="discussions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Discussions récentes</h2>
                  <Button className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Nouvelle discussion
                  </Button>
                </div>

                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <Card key={discussion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{discussion.title}</h3>
                              {discussion.isHot && (
                                <Badge variant="destructive" className="text-xs">
                                  🔥 Tendance
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {discussion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Par {discussion.author} • {discussion.lastActivity}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {discussion.replies} réponses
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {discussion.likes} likes
                              </span>
                              <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                                <Share2 className="w-3 h-3" />
                                Partager
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Événements */}
              <TabsContent value="events" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Événements à venir</h2>
                  <Button className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Créer un événement
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <CardDescription>{event.type}</CardDescription>
                          </div>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(event.date).toLocaleString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {event.participants}/{event.maxParticipants} participants
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                            />
                          </div>
                          <Button className="w-full gap-2">
                            <UserPlus className="w-4 h-4" />
                            Participer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Succès */}
              <TabsContent value="achievements" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Succès communautaires</h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: MessageCircle,
                      title: 'Premier post',
                      description: 'Publiez votre première discussion',
                      progress: 100,
                      unlocked: true
                    },
                    {
                      icon: Heart,
                      title: 'Populaire',
                      description: 'Recevez 50 likes sur vos posts',
                      progress: 60,
                      unlocked: false
                    },
                    {
                      icon: Users,
                      title: 'Mentor',
                      description: 'Aidez 10 étudiants dans leurs questions',
                      progress: 30,
                      unlocked: false
                    },
                    {
                      icon: Trophy,
                      title: 'Expert reconnu',
                      description: 'Obtenez le badge Expert',
                      progress: 80,
                      unlocked: false
                    },
                    {
                      icon: Star,
                      title: 'Contributeur actif',
                      description: 'Participez 30 jours d\'affilée',
                      progress: 45,
                      unlocked: false
                    },
                    {
                      icon: Target,
                      title: 'Défi relevé',
                      description: 'Gagnez 3 défis QCM',
                      progress: 67,
                      unlocked: false
                    }
                  ].map((achievement, index) => (
                    <Card key={index} className={achievement.unlocked ? 'border-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            <achievement.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                achievement.unlocked ? 'bg-primary' : 'bg-muted-foreground'
                              }`}
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
    </MedMngLayout>
  );
}