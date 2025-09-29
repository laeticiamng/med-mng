import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Users, TrendingUp } from 'lucide-react';

// Lazy load des composants lourds
const GamificationPanel = React.lazy(() => 
  import('@/components/gamification/GamificationPanel').then(module => ({ 
    default: module.GamificationPanel 
  }))
);

const Achievements = () => {
  return (
    <>
      <Helmet>
        <title>Succès et Récompenses | MED-MNG</title>
        <meta name="description" content="Suivez vos progrès, débloquez des succès et relevez des défis sur MED-MNG" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Succès et Récompenses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez vos progrès, débloquez des succès et relevez des défis pour améliorer votre apprentissage
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Succès
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Défis
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement de vos statistiques...</p>
              </div>
            }>
              <GamificationPanel />
            </Suspense>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tous vos Succès</CardTitle>
                <CardDescription>
                  Explorez tous les succès disponibles et votre progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Liste détaillée des succès en cours de chargement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Défis Disponibles</CardTitle>
                <CardDescription>
                  Relevez ces défis pour gagner de l'XP et des récompenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Défis personnalisés en cours de chargement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Classement Global</CardTitle>
                <CardDescription>
                  Voyez où vous vous situez par rapport aux autres utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Classement en cours de chargement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Achievements;