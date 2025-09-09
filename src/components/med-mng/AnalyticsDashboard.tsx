import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const metrics = [
    {
      title: 'Items étudiés',
      value: '156',
      change: '+12%',
      trend: 'up',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Temps d\'étude',
      value: '23.4h',
      change: '+8%',
      trend: 'up',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      title: 'Score moyen',
      value: '87%',
      change: '-2%',
      trend: 'down',
      icon: Target,
      color: 'text-orange-600'
    },
    {
      title: 'Badges obtenus',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  const progressData = [
    { subject: 'Cardiologie', progress: 85, total: 120, completed: 102 },
    { subject: 'Pneumologie', progress: 72, total: 95, completed: 68 },
    { subject: 'Neurologie', progress: 91, total: 110, completed: 100 },
    { subject: 'Gastroentérologie', progress: 64, total: 88, completed: 56 },
    { subject: 'Endocrinologie', progress: 78, total: 75, completed: 58 }
  ];

  const recentActivity = [
    {
      action: 'Item EDN 245 complété',
      score: '92%',
      time: 'Il y a 2h',
      category: 'Cardiologie'
    },
    {
      action: 'Quiz ECOS réalisé',
      score: '85%',
      time: 'Il y a 4h',
      category: 'Pneumologie'
    },
    {
      action: 'Item EDN 198 complété',
      score: '78%',
      time: 'Il y a 6h',
      category: 'Neurologie'
    },
    {
      action: 'Session d\'étude terminée',
      score: '2.5h',
      time: 'Hier',
      category: 'Général'
    }
  ];

  const weeklyData = [
    { day: 'Lun', items: 8, time: 2.5 },
    { day: 'Mar', items: 12, time: 3.2 },
    { day: 'Mer', items: 6, time: 1.8 },
    { day: 'Jeu', items: 15, time: 4.1 },
    { day: 'Ven', items: 10, time: 2.9 },
    { day: 'Sam', items: 4, time: 1.2 },
    { day: 'Dim', items: 7, time: 2.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord analytique</h1>
          <p className="text-muted-foreground">Suivez vos progrès et performances en temps réel</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-muted/30`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Progression par matière */}
            <Card>
              <CardHeader>
                <CardTitle>Progression par spécialité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.subject}</span>
                      <span className="text-muted-foreground">
                        {item.completed}/{item.total} items
                      </span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="text-right text-sm text-muted-foreground">
                      {item.progress}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activité hebdomadaire */}
            <Card>
              <CardHeader>
                <CardTitle>Activité cette semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-sm w-8">{day.day}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 bg-primary/20 rounded-full w-20">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${(day.items / 15) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {day.items} items
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {day.time}h
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{activity.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendances de performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Points forts</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Excellent en Neurologie (91% de réussite)</li>
                      <li>• Progression constante en Cardiologie</li>
                      <li>• Temps d'étude régulier et efficace</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">Axes d'amélioration</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Renforcer la Gastroentérologie</li>
                      <li>• Augmenter le temps d'étude le weekend</li>
                      <li>• Réviser les items échoués</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Objectifs du mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items étudiés (180/250)</span>
                      <span>72%</span>
                    </div>
                    <Progress value={72} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Temps d'étude (45h/60h)</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score moyen (85%/90%)</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations personnalisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Focus recommandé
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Concentrez-vous sur la Gastroentérologie cette semaine pour améliorer votre score global.
                  </p>
                  <Button size="sm" variant="outline">
                    Voir les items suggérés
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Planning optimal
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Vos meilleures performances sont entre 14h et 16h. Planifiez vos sessions importantes.
                  </p>
                  <Button size="sm" variant="outline">
                    Planifier une session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};