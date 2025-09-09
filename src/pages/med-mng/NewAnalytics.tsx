import React, { useState } from 'react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Heart,
  Headphones,
  Music,
  Calendar,
  Target,
  Award,
  Activity,
  Users,
  Download
} from 'lucide-react';

const NewAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalListeningTime: 1547, // minutes
    songsCreated: 23,
    favoriteGenre: 'Relaxation',
    averageSessionTime: 34,
    streakDays: 12,
    wellnessScore: 8.4,
    focusImprovement: 15,
    stressReduction: 22
  };

  const listeningData = [
    { day: 'Lun', minutes: 45, focus: 8.2 },
    { day: 'Mar', minutes: 62, focus: 7.8 },
    { day: 'Mer', minutes: 38, focus: 8.5 },
    { day: 'Jeu', minutes: 71, focus: 9.1 },
    { day: 'Ven', minutes: 55, focus: 8.7 },
    { day: 'Sam', minutes: 29, focus: 7.9 },
    { day: 'Dim', minutes: 43, focus: 8.3 }
  ];

  const genreBreakdown = [
    { genre: 'Relaxation', percentage: 35, minutes: 541 },
    { genre: 'Concentration', percentage: 28, minutes: 433 },
    { genre: 'Énergie', percentage: 22, minutes: 340 },
    { genre: 'Méditation', percentage: 15, minutes: 233 }
  ];

  const medicalFocusData = [
    { subject: 'Anatomie', sessions: 45, improvement: 18 },
    { subject: 'Physiologie', sessions: 32, improvement: 12 },
    { subject: 'Pathologie', sessions: 28, improvement: 15 },
    { subject: 'Pharmacologie', sessions: 21, improvement: 9 }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                Analytics MED-MNG
              </h1>
              <p className="text-gray-600">
                Analysez votre progression et optimisez votre apprentissage
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                  <SelectItem value="1y">1 an</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps d'écoute total</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatTime(stats.totalListeningTime)}</p>
                  </div>
                  <Headphones className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chansons créées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.songsCreated}</p>
                  </div>
                  <Music className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score bien-être</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.wellnessScore}/10</p>
                  </div>
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Série actuelle</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.streakDays} jours</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="listening">Écoute</TabsTrigger>
              <TabsTrigger value="learning">Apprentissage</TabsTrigger>
              <TabsTrigger value="wellness">Bien-être</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité hebdomadaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {listeningData.map((day) => (
                        <div key={day.day} className="flex items-center gap-4">
                          <div className="w-8 text-sm font-medium">{day.day}</div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1 text-xs">
                              <span>{day.minutes}min</span>
                              <span>Focus: {day.focus}/10</span>
                            </div>
                            <Progress value={(day.minutes / 80) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Genres préférés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {genreBreakdown.map((item) => (
                        <div key={item.genre}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">{item.genre}</span>
                            <span className="text-sm text-gray-600">{item.percentage}% • {formatTime(item.minutes)}</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="listening" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Habitudes d'écoute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <p className="text-2xl font-bold">{formatTime(stats.averageSessionTime)}</p>
                      <p className="text-sm text-gray-600">Session moyenne</p>
                    </div>
                    <div className="text-center">
                      <Music className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="text-2xl font-bold">{stats.favoriteGenre}</p>
                      <p className="text-sm text-gray-600">Genre préféré</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                      <p className="text-2xl font-bold">5.2</p>
                      <p className="text-sm text-gray-600">Sessions/jour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance par matière</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalFocusData.map((subject) => (
                      <div key={subject.subject} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex-1">
                          <h3 className="font-medium">{subject.subject}</h3>
                          <p className="text-sm text-gray-600">{subject.sessions} sessions</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 font-medium">+{subject.improvement}%</span>
                          </div>
                          <p className="text-xs text-gray-500">amélioration</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impact sur le bien-être</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Amélioration du focus</span>
                      <span className="text-sm text-green-600">+{stats.focusImprovement}%</span>
                    </div>
                    <Progress value={stats.focusImprovement} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Réduction du stress</span>
                      <span className="text-sm text-green-600">+{stats.stressReduction}%</span>
                    </div>
                    <Progress value={stats.stressReduction} className="h-2" />
                  </div>

                  <div className="pt-4 border-t text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold text-red-500">{stats.wellnessScore}/10</p>
                    <p className="text-sm text-gray-600">Score de bien-être global</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MedMngLayout>
  );
};

export default NewAnalytics;