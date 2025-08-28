import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Brain, 
  Target,
  Calendar,
  Award,
  PlayCircle,
  BookOpen,
  Activity,
  Download
} from 'lucide-react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { withAuth } from '@/components/med-mng/withAuth';

interface LearningMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface StudySession {
  id: string;
  date: string;
  duration: number;
  itemsCovered: number;
  completionRate: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
}

interface WeakArea {
  id: string;
  domain: string;
  score: number;
  items: string[];
  recommendations: string[];
}

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7j');
  const [learningMetrics] = useState<LearningMetric[]>([
    {
      id: '1',
      name: 'Items Maîtrisés',
      value: 127,
      target: 200,
      trend: 'up',
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Temps d\'Étude Total',
      value: 45.5,
      target: 60,
      trend: 'up',
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'Taux de Réussite Moyen',
      value: 78,
      target: 85,
      trend: 'stable',
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Sessions Complètes',
      value: 32,
      target: 40,
      trend: 'up',
      color: 'bg-orange-500'
    }
  ]);

  const [studySessions] = useState<StudySession[]>([
    {
      id: '1',
      date: '2024-01-15',
      duration: 120,
      itemsCovered: 8,
      completionRate: 85,
      difficulty: 'moyen'
    },
    {
      id: '2',
      date: '2024-01-14',
      duration: 90,
      itemsCovered: 6,
      completionRate: 92,
      difficulty: 'facile'
    },
    {
      id: '3',
      date: '2024-01-13',
      duration: 150,
      itemsCovered: 12,
      completionRate: 75,
      difficulty: 'difficile'
    }
  ]);

  const [weakAreas] = useState<WeakArea[]>([
    {
      id: '1',
      domain: 'Cardiologie',
      score: 65,
      items: ['IC-221', 'IC-224', 'IC-229'],
      recommendations: [
        'Réviser les arythmies cardiaques',
        'Approfondir l\'ECG pathologique',
        'Étudier l\'insuffisance cardiaque'
      ]
    },
    {
      id: '2',
      domain: 'Neurologie',
      score: 70,
      items: ['IC-91', 'IC-95', 'IC-98'],
      recommendations: [
        'Travailler les AVC et leurs complications',
        'Revoir les épilepsies',
        'Approfondir les démences'
      ]
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'bg-green-100 text-green-800';
      case 'moyen': return 'bg-yellow-100 text-yellow-800';
      case 'difficile': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const data = {
      metrics: learningMetrics,
      sessions: studySessions,
      weakAreas: weakAreas,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medmng-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <MedMngLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytiques d'Apprentissage
            </h1>
            <p className="text-gray-600">
              Suivez votre progression et optimisez votre préparation
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md"
            >
              <option value="7j">7 derniers jours</option>
              <option value="30j">30 derniers jours</option>
              <option value="3m">3 derniers mois</option>
              <option value="1a">1 année</option>
            </select>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {learningMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${metric.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                    <Target className={`h-5 w-5 ${metric.color.replace('bg-', 'text-')}`} />
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Objectif: {metric.target}</span>
                    <span className={`${
                      metric.value >= metric.target ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {Math.round((metric.value / metric.target) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="progression" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progression">Progression</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="faiblesses">Points Faibles</TabsTrigger>
            <TabsTrigger value="recommandations">Recommandations</TabsTrigger>
          </TabsList>

          <TabsContent value="progression" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progression par Domaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { domain: 'Cardiologie', progress: 85, total: 45 },
                      { domain: 'Neurologie', progress: 72, total: 38 },
                      { domain: 'Pneumologie', progress: 90, total: 32 },
                      { domain: 'Gastroentérologie', progress: 78, total: 29 }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.domain}</span>
                          <span className="text-sm text-gray-500">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                        <p className="text-xs text-gray-500">{item.total} items disponibles</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Badges Obtenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Spécialiste Cardiologie', icon: '🫀', earned: true },
                      { name: 'Expert Neurologie', icon: '🧠', earned: true },
                      { name: 'Maître Pneumologie', icon: '🫁', earned: false },
                      { name: 'As des Urgences', icon: '🚨', earned: false }
                    ].map((badge, index) => (
                      <div key={index} className={`p-4 rounded-lg border text-center ${
                        badge.earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="text-2xl mb-2">{badge.icon}</div>
                        <p className={`text-sm font-medium ${
                          badge.earned ? 'text-yellow-800' : 'text-gray-500'
                        }`}>
                          {badge.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique des Sessions
                </CardTitle>
                <CardDescription>
                  Détail de vos dernières sessions d'étude
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <PlayCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Session du {session.date}</p>
                          <p className="text-sm text-gray-600">
                            {session.itemsCovered} items étudiés • {session.duration}min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getDifficultyColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                        <span className="font-medium text-green-600">
                          {session.completionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faiblesses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weakAreas.map((area) => (
                <Card key={area.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        {area.domain}
                      </span>
                      <Badge variant={area.score < 70 ? "destructive" : "secondary"}>
                        {area.score}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Items à réviser:</p>
                        <div className="flex flex-wrap gap-2">
                          {area.items.map((item, index) => (
                            <Badge key={index} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Recommandations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {area.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommandations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectifs Suggérés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Améliorer la Cardiologie',
                        description: 'Consacrer 30min/jour pendant 2 semaines',
                        priority: 'Haute',
                        color: 'text-red-600'
                      },
                      {
                        title: 'Révisions Neurologie',
                        description: 'Reprendre les items IC-91 à IC-98',
                        priority: 'Moyenne',
                        color: 'text-yellow-600'
                      },
                      {
                        title: 'Consolidation Générale',
                        description: 'Maintenir le rythme actuel',
                        priority: 'Basse',
                        color: 'text-green-600'
                      }
                    ].map((objective, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{objective.title}</h4>
                          <Badge variant="outline" className={objective.color}>
                            {objective.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{objective.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Planning Suggéré
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: 'Lundi', focus: 'Cardiologie - Arythmies', duration: '45min' },
                      { day: 'Mardi', focus: 'Neurologie - AVC', duration: '60min' },
                      { day: 'Mercredi', focus: 'Révisions générales', duration: '30min' },
                      { day: 'Jeudi', focus: 'Pneumologie - Asthme', duration: '45min' },
                      { day: 'Vendredi', focus: 'Quiz général', duration: '30min' }
                    ].map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-blue-900">{day.day}</p>
                          <p className="text-sm text-blue-700">{day.focus}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {day.duration}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MedMngLayout>
  );
};

export default withAuth(Analytics);