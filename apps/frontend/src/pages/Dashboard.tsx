import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProgressCharts } from '@/components/dashboard/ProgressCharts';
import { DifficultyAnalysis } from '@/components/dashboard/DifficultyAnalysis';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { StreaksAndBadges } from '@/components/dashboard/StreaksAndBadges';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

/**
 * Page Dashboard Principale - Vue d'ensemble complète avec statistiques avancées
 */
const Dashboard: React.FC = () => {
  return (
    <LanguageProvider>
      <Helmet>
        <title>Dashboard - Plateforme Médicale MED-MNG</title>
        <meta name="description" content="Tableau de bord principal de la plateforme médicale avec monitoring, analytics, progression EDN et recommandations IA." />
        <meta name="keywords" content="dashboard, medical platform, monitoring, analytics, healthcare technology, EDN progress" />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre progression et statistiques de révision
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="difficulty" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Difficulté
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Recommandations
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Badges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ProgressCharts />
            </TabsContent>

            <TabsContent value="difficulty" className="space-y-6">
              <DifficultyAnalysis />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <AIRecommendations />
            </TabsContent>

            <TabsContent value="badges" className="space-y-6">
              <StreaksAndBadges />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Dashboard;