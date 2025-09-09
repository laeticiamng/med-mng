/**
 * Tableau de bord unifié principal
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  BookOpen, 
  Brain, 
  Trophy, 
  TrendingUp,
  Star,
  CheckCircle,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/unified/useAuth';
import { useUserStats } from '@/hooks/unified/useUserStats';
import { AdaptiveLearningEngine } from '@/components/learning/AdaptiveLearningEngine';
// Import removed - component will be loaded dynamically when needed

const UnifiedDashboard = () => {
  const { user } = useAuth();
  const { stats, loading, refreshData } = useUserStats();
  const [activeTab, setActiveTab] = useState('overview');

  const welcomeMessage = user?.user_metadata?.name 
    ? `Bonjour ${user.user_metadata.name}` 
    : 'Bienvenue sur votre tableau de bord';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <section className="p-8 border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">{welcomeMessage}</h1>
          <p className="text-muted-foreground">
            Votre plateforme d'apprentissage médical personnalisée
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modules Terminés</p>
                  <p className="text-2xl font-bold">{stats?.modulesCompleted || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score Moyen</p>
                  <p className="text-2xl font-bold">{Math.round(stats?.averageScore || 0)}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Série Actuelle</p>
                  <p className="text-2xl font-bold">{stats?.streak || 0} jours</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Badges</p>
                  <p className="text-2xl font-bold">{stats?.badges || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="learning">Apprentissage</TabsTrigger>
            <TabsTrigger value="progress">Progression</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progression Globale</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={stats?.progress || 0} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(stats?.progress || 0)}% terminé
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning">
            <AdaptiveLearningEngine 
              focusArea="general"
              difficulty="medium"
              onModuleComplete={refreshData}
            />
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs de la Semaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Modules terminés</span>
                    <span>2/5</span>
                  </div>
                  <Progress value={40} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedDashboard;