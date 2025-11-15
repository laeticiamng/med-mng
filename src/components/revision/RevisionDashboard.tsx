import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Zap,
  Trophy,
  Settings,
  Compass
} from 'lucide-react';
import { usePersonalizedRevision } from '@/hooks/usePersonalizedRevision';
import { useUserRevisionMethod, useTodayRevisions, useOverdueRevisions } from '@/hooks/useRevisionMethods';
import { REVISION_METHODS } from '@/types/revision-methods';
import { RevisionPlanCreator } from './RevisionPlanCreator';
import { TodayRevisionSession } from './TodayRevisionSession';
import { ProgressAnalytics } from './ProgressAnalytics';
import { MethodSelector } from './MethodSelector';
import { TodayRevisionsView } from './TodayRevisionsView';

export const RevisionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const {
    loading,
    error,
    revisionItems,
    currentPlan,
    getTodayRevisionItems,
    getProgressStats,
    analyzeUserWeaknesses
  } = usePersonalizedRevision();

  // New revision methods hooks
  const { data: activeMethod, isLoading: methodLoading } = useUserRevisionMethod();
  const { data: todayRevisions, isLoading: revisionsLoading } = useTodayRevisions();
  const { data: overdueRevisions } = useOverdueRevisions();

  const todayItems = getTodayRevisionItems();
  const stats = getProgressStats();

  // Compute stats from new system
  const newSystemTodayCount = todayRevisions
    ? todayRevisions.pending.length + todayRevisions.missed.length
    : 0;
  const newSystemOverdueCount = overdueRevisions?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Analyse de vos besoins de révision...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erreur: {error}</span>
          </div>
          <Button 
            onClick={analyzeUserWeaknesses} 
            variant="outline" 
            className="mt-4"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Méthode active banner */}
      {activeMethod && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Méthode actuelle</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {REVISION_METHODS[activeMethod].name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('method')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Changer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* En-tête avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Maîtrise globale</p>
                <p className="text-2xl font-bold text-blue-800">{stats.masteryRate}%</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Concepts maîtrisés</p>
                <p className="text-2xl font-bold text-green-800">{stats.masteredItems}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">À réviser aujourd'hui</p>
                <p className="text-2xl font-bold text-orange-800">
                  {activeMethod ? newSystemTodayCount : todayItems.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            {newSystemOverdueCount > 0 && activeMethod && (
              <div className="mt-2 pt-2 border-t border-orange-200">
                <p className="text-xs text-orange-600">
                  + {newSystemOverdueCount} en retard
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Objectif quotidien</p>
                <p className="text-2xl font-bold text-purple-800">{currentPlan?.daily_target || 0}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="method" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Méthode
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Use new system if method is active, otherwise use old system */}
          {activeMethod ? (
            <TodayRevisionsView method={activeMethod} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session de révision du jour
                </CardTitle>
                <CardDescription>
                  {todayItems.length > 0
                    ? `${todayItems.length} concept(s) à réviser selon votre planning personnalisé`
                    : "Aucune révision programmée pour aujourd'hui - Excellent travail !"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayItems.length > 0 ? (
                  <TodayRevisionSession items={todayItems} />
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium text-green-800">
                      Toutes vos révisions sont à jour !
                    </p>
                    <p className="text-green-600 mt-2">
                      Revenez demain pour continuer votre progression.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="method" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Choisir ma méthode de révision
              </CardTitle>
              <CardDescription>
                Sélectionne la méthode qui correspond le mieux à ton style d'apprentissage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MethodSelector
                currentMethod={activeMethod}
                showCurrentBadge={true}
                allowChange={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          {currentPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentPlan.plan_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentPlan.completion_rate}% terminé
                  </span>
                </CardTitle>
                <CardDescription>
                  Plan de {currentPlan.estimated_duration_days} jours • 
                  {currentPlan.daily_target} concepts/jour
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={currentPlan.completion_rate} className="w-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <span className="font-medium text-blue-800">Concepts ciblés</span>
                    <p className="text-blue-600">{currentPlan.target_items.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <span className="font-medium text-green-800">Jours restants</span>
                    <p className="text-green-600">
                      {Math.max(0, currentPlan.estimated_duration_days - Math.floor((new Date().getTime() - new Date(currentPlan.created_at).getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <span className="font-medium text-purple-800">Objectif quotidien</span>
                    <p className="text-purple-600">{currentPlan.daily_target} concepts</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('today')}
                >
                  Commencer la révision du jour
                </Button>
              </CardContent>
            </Card>
          ) : (
            <RevisionPlanCreator />
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ProgressAnalytics 
            revisionItems={revisionItems}
            stats={stats}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Répartition par difficulté */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition par difficulté</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => {
                  const count = revisionItems.filter(item => item.difficulty_level === level).length;
                  const percentage = revisionItems.length > 0 ? (count / revisionItems.length) * 100 : 0;
                  const colors = {
                    easy: 'bg-green-500',
                    medium: 'bg-yellow-500', 
                    hard: 'bg-red-500'
                  };
                  
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{level === 'easy' ? 'Facile' : level === 'medium' ? 'Moyen' : 'Difficile'}</span>
                        <span>{count} concepts</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${colors[level]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top concepts à réviser */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Concepts prioritaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revisionItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.concept}</p>
                        <p className="text-xs text-gray-500">{item.item_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.priority_score}</p>
                        <p className="text-xs text-gray-500">priorité</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};