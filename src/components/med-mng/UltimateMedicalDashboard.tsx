import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  BookOpen, 
  Users, 
  Clock, 
  Brain,
  Activity,
  Zap,
  Star,
  BarChart3
} from 'lucide-react';

interface StudyMetrics {
  totalStudyTime: number;
  itemsStudied: number;
  averageScore: number;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'study' | 'quiz' | 'ecos' | 'chat';
  title: string;
  score?: number;
  timestamp: Date;
  specialty: string;
}

export const UltimateMedicalDashboard = () => {
  const [metrics, setMetrics] = useState<StudyMetrics>({
    totalStudyTime: 247,
    itemsStudied: 89,
    averageScore: 87.3,
    streak: 12,
    weeklyGoal: 20,
    weeklyProgress: 14
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'study',
      title: 'IC-221 - Hypertension artérielle',
      score: 92,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      specialty: 'Cardiologie'
    },
    {
      id: '2',
      type: 'ecos',
      title: 'Simulation - Examen cardiovasculaire',
      score: 88,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      specialty: 'Cardiologie'
    },
    {
      id: '3',
      type: 'quiz',
      title: 'Quiz Neurologie - AVC',
      score: 95,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      specialty: 'Neurologie'
    },
    {
      id: '4',
      type: 'chat',
      title: 'Discussion sur les bêta-bloquants',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      specialty: 'Pharmacologie'
    }
  ]);

  const [personalizedRecommendations] = useState([
    {
      id: '1',
      title: 'Réviser la cardiologie',
      description: 'Vos scores en cardiologie ont baissé de 5% cette semaine',
      priority: 'high',
      action: 'Étudier 3 items cardiologie'
    },
    {
      id: '2',
      title: 'Simulation ECOS',
      description: 'Vous n\'avez pas fait de simulation depuis 3 jours',
      priority: 'medium',
      action: 'Faire une simulation'
    },
    {
      id: '3',
      title: 'Quiz hebdomadaire',
      description: 'Complétez votre objectif de quiz de la semaine',
      priority: 'low',
      action: '6 quiz restants'
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'quiz': return <Brain className="h-4 w-4" />;
      case 'ecos': return <Users className="h-4 w-4" />;
      case 'chat': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Temps d'étude</p>
                <p className="text-2xl font-bold">{metrics.totalStudyTime}h</p>
                <p className="text-xs text-green-600">+12h cette semaine</p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Items étudiés</p>
                <p className="text-2xl font-bold">{metrics.itemsStudied}</p>
                <p className="text-xs text-green-600">+7 cette semaine</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Score moyen</p>
                <p className="text-2xl font-bold">{metrics.averageScore}%</p>
                <p className="text-xs text-blue-600">+2.3% ce mois</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{metrics.streak} jours</p>
                <p className="text-xs text-yellow-600">Record personnel !</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectif hebdomadaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objectif hebdomadaire
          </CardTitle>
          <CardDescription>
            Progressez vers votre objectif de {metrics.weeklyGoal} items par semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{metrics.weeklyProgress}/{metrics.weeklyGoal} items</span>
            </div>
            <Progress value={(metrics.weeklyProgress / metrics.weeklyGoal) * 100} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round((metrics.weeklyProgress / metrics.weeklyGoal) * 100)}% complété</span>
              <span>{metrics.weeklyGoal - metrics.weeklyProgress} items restants</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommandations personnalisées */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recommandations IA Personnalisées
            </CardTitle>
            <CardDescription>
              Suggestions basées sur vos performances et objectifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalizedRecommendations.map((rec) => (
                <div key={rec.id} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Suggestion'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                    <Button size="sm" variant="outline" className="ml-4">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium leading-tight">{activity.title}</h4>
                      {activity.score && (
                        <Badge variant={activity.score >= 90 ? 'default' : activity.score >= 75 ? 'secondary' : 'outline'} className="text-xs">
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{activity.specialty}</span>
                      <span>{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics avancées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="specialties">Spécialités</TabsTrigger>
              <TabsTrigger value="goals">Objectifs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Performance globale</p>
                      <p className="text-3xl font-bold text-green-600">87.3%</p>
                      <p className="text-xs text-muted-foreground">+5.2% vs mois dernier</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Efficacité d'étude</p>
                      <p className="text-3xl font-bold text-blue-600">92%</p>
                      <p className="text-xs text-muted-foreground">Excellent niveau</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">Rétention</p>
                      <p className="text-3xl font-bold text-purple-600">89%</p>
                      <p className="text-xs text-muted-foreground">+3% ce mois</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Progression mensuelle</h4>
                  <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Graphique de progression</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specialties" className="space-y-4">
              <div className="space-y-4">
                {['Cardiologie', 'Neurologie', 'Gastroentérologie', 'Pneumologie'].map((specialty, index) => (
                  <div key={specialty} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{specialty}</span>
                      <span>{85 + index * 3}%</span>
                    </div>
                    <Progress value={85 + index * 3} className="h-2" />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Objectifs du mois
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Items étudiés</span>
                          <span className="text-green-600">89/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score moyen</span>
                          <span className="text-green-600">87.3/85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Simulations ECOS</span>
                          <span className="text-orange-500">12/20</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Défis personnels</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Streak de 12 jours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Maîtriser 5 spécialités</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Score parfait en quiz</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};