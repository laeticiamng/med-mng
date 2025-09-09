import React, { useState } from 'react';
import { MedMngLayout } from '@/components/med-mng/MedMngLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Music, 
  Play, 
  Heart, 
  Brain, 
  TrendingUp,
  Clock,
  Award,
  Headphones,
  Plus,
  Library,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { toast } from 'sonner';

const NewDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const userStats = {
    songsGenerated: 47,
    totalListeningTime: 342,
    favoriteGenre: 'Relaxation',
    streakDays: 12,
    achievementsUnlocked: 8,
    learningProgress: 68
  };

  const recentSongs = [
    { id: 1, title: 'Relaxation Anatomie', genre: 'Ambient', duration: '4:32', plays: 23 },
    { id: 2, title: 'Rythme Cardiaque', genre: 'Electronic', duration: '3:45', plays: 18 },
    { id: 3, title: 'Neurologie Zen', genre: 'Classical', duration: '5:12', plays: 31 },
    { id: 4, title: 'Focus Chirurgie', genre: 'Instrumental', duration: '6:18', plays: 42 }
  ];

  const handleQuickAction = (action: string) => {
    toast.info(`Action: ${action}`);
  };

  return (
    <MedMngLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour, {user?.user_metadata?.name || 'Utilisateur'} 👋
            </h1>
            <p className="text-gray-600">
              Votre plateforme de musique thérapeutique médicale personnalisée
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chansons créées</p>
                    <p className="text-2xl font-bold text-blue-600">{userStats.songsGenerated}</p>
                  </div>
                  <Music className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps d'écoute</p>
                    <p className="text-2xl font-bold text-green-600">{Math.floor(userStats.totalListeningTime / 60)}h {userStats.totalListeningTime % 60}m</p>
                  </div>
                  <Headphones className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Série actuelle</p>
                    <p className="text-2xl font-bold text-purple-600">{userStats.streakDays} jours</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Succès</p>
                    <p className="text-2xl font-bold text-orange-600">{userStats.achievementsUnlocked}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="recent">Récents</TabsTrigger>
              <TabsTrigger value="achievements">Succès</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Progression d'apprentissage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Anatomie</span>
                          <span className="text-sm text-gray-600">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Physiologie</span>
                          <span className="text-sm text-gray-600">72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => handleQuickAction('Créer une nouvelle chanson')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une nouvelle chanson
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleQuickAction('Parcourir la bibliothèque')}
                    >
                      <Library className="h-4 w-4 mr-2" />
                      Parcourir la bibliothèque
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chansons récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSongs.map((song) => (
                      <div key={song.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{song.title}</h3>
                            <p className="text-sm text-gray-600">{song.genre} • {song.duration}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Succès et réalisations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Vos succès et badges apparaîtront ici.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistiques d'utilisation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Analytics détaillées bientôt disponibles</p>
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

export default NewDashboard;