import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Music,
  Brain,
  Stethoscope,
  Target,
  Users,
  TrendingUp,
  Award,
  Clock,
  Star,
  Play,
  Heart,
  Share2,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useNavAction } from '@/hooks/useNavAction';

// Mock data pour overview de la plateforme
const mockPlatformData = {
  stats: {
    totalUsers: 15420,
    activeToday: 3420,
    contentCreated: 8934,
    hoursStudied: 125670,
    successRate: 89.2,
    averageScore: 87.5
  },
  features: [
    {
      id: 'edn',
      name: 'Items EDN',
      description: 'Maîtrisez les 360 items EDN avec notre plateforme interactive',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      stats: { items: 360, completed: 78, users: 5420 },
      highlights: ['Mode immersif', 'Suivi progression', 'Analytics détaillées']
    },
    {
      id: 'music',
      name: 'Musique Médicale',
      description: 'Créez et écoutez des chansons pour mémoriser vos cours',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      stats: { tracks: 428, plays: 15670, creators: 2340 },
      highlights: ['IA générative', 'Styles variés', 'Communauté créative']
    },
    {
      id: 'ecos',
      name: 'Simulations ECOS',
      description: 'Entraînez-vous avec des cas cliniques réalistes',
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      stats: { scenarios: 104, attempts: 8930, avgScore: 85 },
      highlights: ['Cas réels', 'Feedback immédiat', 'Progression adaptative']
    },
    {
      id: 'ai',
      name: 'Assistant IA',
      description: 'Votre compagnon d\'apprentissage intelligent',
      icon: Brain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      stats: { queries: 25670, accuracy: 96, users: 7890 },
      highlights: ['Réponses instantanées', 'Explications détaillées', 'Apprentissage personnalisé']
    }
  ],
  recentActivity: [
    {
      id: 1,
      type: 'achievement',
      user: 'Marie L.',
      avatar: '/api/placeholder/32/32',
      action: 'a terminé le parcours Cardiologie',
      time: '2 min',
      badge: 'Expert Cardio'
    },
    {
      id: 2,
      type: 'music',
      user: 'Thomas R.',
      avatar: '/api/placeholder/32/32',
      action: 'a créé "IC-290 Trap Beat"',
      time: '5 min',
      plays: 23
    },
    {
      id: 3,
      type: 'ecos',
      user: 'Sarah M.',
      avatar: '/api/placeholder/32/32',
      action: 'a réussi le scenario Urgences avec 94%',
      time: '8 min',
      score: 94
    }
  ],
  topContent: [
    {
      id: 'ic-331',
      title: 'IC-331: Arrêt cardio-circulatoire',
      type: 'EDN',
      engagement: 94.5,
      completions: 1250,
      rating: 4.8,
      difficulty: 'Expert'
    },
    {
      id: 'cardio-flow',
      title: 'Cardiologie Flow - Rap Médical',
      type: 'Music',
      engagement: 92.1,
      plays: 2340,
      likes: 456,
      genre: 'Rap'
    },
    {
      id: 'urgences-pediatriques',
      title: 'Urgences Pédiatriques',
      type: 'ECOS',
      engagement: 89.7,
      attempts: 890,
      avgScore: 87,
      duration: '25min'
    }
  ]
};

interface PlatformOverviewProps {
  className?: string;
}

export default function PlatformOverview({ className }: PlatformOverviewProps) {
  const [selectedFeature, setSelectedFeature] = useState('edn');
  const executeAction = useNavAction();

  const handleFeatureAction = async (featureId: string) => {
    switch (featureId) {
      case 'edn':
        await executeAction({ type: "route", to: "/edn" });
        break;
      case 'music':
        await executeAction({ type: "route", to: "/med-mng/dashboard" });
        break;
      case 'ecos':
        await executeAction({ type: "route", to: "/ecos" });
        break;
      case 'ai':
        await executeAction({ type: "route", to: "/chat" });
        break;
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = "primary" }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {change && (
                <Badge variant="secondary" className="text-xs">
                  {change}
                </Badge>
              )}
            </div>
          </div>
          <Icon className={`h-8 w-8 text-${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const FeatureCard = ({ feature }: { feature: any }) => (
    <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
      selectedFeature === feature.id ? 'border-primary' : 'border-transparent'
    }`} onClick={() => setSelectedFeature(feature.id)}>
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
          <feature.icon className={`h-6 w-6 ${feature.color}`} />
        </div>
        <h3 className="font-semibold text-lg mb-2">{feature.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
          {Object.entries(feature.stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="font-bold text-lg">{typeof value === 'number' ? value.toLocaleString() : value}</div>
              <div className="text-muted-foreground capitalize">{key}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {feature.highlights.map((highlight: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-4" 
          variant={selectedFeature === feature.id ? "default" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            handleFeatureAction(feature.id);
          }}
        >
          Explorer
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'achievement':
          return <Award className="w-4 h-4 text-yellow-600" />;
        case 'music':
          return <Music className="w-4 h-4 text-purple-600" />;
        case 'ecos':
          return <Stethoscope className="w-4 h-4 text-green-600" />;
        default:
          return <Target className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <Avatar className="w-8 h-8">
          <AvatarImage src={activity.avatar} />
          <AvatarFallback>{activity.user[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {getIcon()}
            <span className="font-medium">{activity.user}</span>
            <span className="text-muted-foreground">{String(activity.action)}</span>
          </div>
          {activity.badge && (
            <Badge variant="secondary" className="text-xs mt-1">{activity.badge}</Badge>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{activity.time}</div>
          {activity.plays && <div>{activity.plays} écoutes</div>}
          {activity.score && <div>{activity.score}%</div>}
        </div>
      </div>
    );
  };

  const ContentCard = ({ content }: { content: any }) => {
    const getTypeColor = () => {
      switch (content.type) {
        case 'EDN': return 'text-blue-600';
        case 'Music': return 'text-purple-600';
        case 'ECOS': return 'text-green-600';
        default: return 'text-gray-600';
      }
    };

    const getTypeIcon = () => {
      switch (content.type) {
        case 'EDN': return <BookOpen className="w-4 h-4" />;
        case 'Music': return <Music className="w-4 h-4" />;
        case 'ECOS': return <Stethoscope className="w-4 h-4" />;
        default: return <Target className="w-4 h-4" />;
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
                {content.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getTypeColor()}`}>
                  {getTypeIcon()}
                  {content.type}
                </Badge>
                {content.difficulty && (
                  <Badge variant="secondary" className="text-xs">
                    {content.difficulty}
                  </Badge>
                )}
                {content.genre && (
                  <Badge variant="secondary" className="text-xs">
                    {content.genre}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 text-green-600" />
                {content.engagement}%
              </div>
              {content.rating && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {content.rating}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {content.completions && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{content.completions} complétions</span>
              </div>
            )}
            {content.plays && (
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4 text-purple-600" />
                <span>{content.plays} écoutes</span>
              </div>
            )}
            {content.attempts && (
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-green-600" />
                <span>{content.attempts} tentatives</span>
              </div>
            )}
            {content.likes && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-600" />
                <span>{content.likes} likes</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t">
            <Progress value={content.engagement} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Taux d'engagement: {content.engagement}%
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          Plateforme d'apprentissage médicale de nouvelle génération
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Vue d'ensemble de la plateforme
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez tous les outils et fonctionnalités qui révolutionnent l'apprentissage médical
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={Users}
          title="Utilisateurs"
          value={mockPlatformData.stats.totalUsers.toLocaleString()}
          change="+12.5%"
        />
        <StatCard
          icon={Zap}
          title="Actifs aujourd'hui"
          value={mockPlatformData.stats.activeToday.toLocaleString()}
          change="+8.2%"
        />
        <StatCard
          icon={BookOpen}
          title="Contenu créé"
          value={mockPlatformData.stats.contentCreated.toLocaleString()}
          change="+15.3%"
        />
        <StatCard
          icon={Clock}
          title="Heures d'étude"
          value={`${Math.floor(mockPlatformData.stats.hoursStudied / 1000)}k`}
          change="+18.7%"
        />
        <StatCard
          icon={Target}
          title="Taux de réussite"
          value={`${mockPlatformData.stats.successRate}%`}
          change="+2.3%"
        />
        <StatCard
          icon={Award}
          title="Score moyen"
          value={`${mockPlatformData.stats.averageScore}%`}
          change="+1.8%"
        />
      </div>

      {/* Features Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Fonctionnalités principales</h2>
          <p className="text-muted-foreground">
            Explorez nos outils innovants pour maximiser votre apprentissage
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {mockPlatformData.features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>

      {/* Activity & Performance */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="top-content">Top contenu</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Activité de la communauté
              </CardTitle>
              <CardDescription>
                Dernières réalisations et créations de nos utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockPlatformData.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Voir toute l'activité
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-content" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockPlatformData.topContent.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Insights de performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Engagement par type de contenu</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Items EDN</span>
                      <div className="flex items-center gap-2">
                        <Progress value={89} className="w-24 h-2" />
                        <span className="text-sm font-semibold">89%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Musique médicale</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-24 h-2" />
                        <span className="text-sm font-semibold">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Simulations ECOS</span>
                      <div className="flex items-center gap-2">
                        <Progress value={87} className="w-24 h-2" />
                        <span className="text-sm font-semibold">87%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Métriques clés</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Temps moyen par session</span>
                      <span className="font-semibold">23min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Taux de complétion</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Satisfaction utilisateur</span>
                      <span className="font-semibold">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rétention 7 jours</span>
                      <span className="font-semibold">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}