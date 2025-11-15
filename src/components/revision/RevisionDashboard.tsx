import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings
} from 'lucide-react';
import { usePersonalizedRevision } from '@/hooks/usePersonalizedRevision';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';
import { REVISION_METHODS } from '@/types/revision-methods';
import { RevisionMethodSelector } from './RevisionMethodSelector';
import { JMethodView } from './JMethodView';
import { BlockMethodView } from './BlockMethodView';
import { QCMFirstView } from './QCMFirstView';
import { RevisionPlanCreator } from './RevisionPlanCreator';
import { TodayRevisionSession } from './TodayRevisionSession';
import { ProgressAnalytics } from './ProgressAnalytics';

export const RevisionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  // New revision methods hook
  const {
    loading: methodsLoading,
    error: methodsError,
    currentMethod,
    todayItems: methodTodayItems,
    overdueItems,
    stats: methodStats,
    blockConfig,
    todayQCMSession
  } = useRevisionMethods();

  // Legacy personalized revision hook (for backwards compatibility)
  const {
    loading,
    error,
    revisionItems,
    currentPlan,
    getTodayRevisionItems,
    getProgressStats,
    analyzeUserWeaknesses
  } = usePersonalizedRevision();

  const todayItems = getTodayRevisionItems();
  const stats = getProgressStats();

  // Use new system if available, fall back to legacy
  const isUsingNewSystem = currentMethod !== null;
  const displayLoading = isUsingNewSystem ? methodsLoading : loading;
  const displayError = isUsingNewSystem ? methodsError : error;

  if (displayLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Analyse de vos besoins de révision...</span>
      </div>
    );
  }

  if (displayError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Erreur: {displayError}</span>
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

  // Show method selector if no method is selected
  if (!currentMethod) {
    return (
      <div className="space-y-6">
        <RevisionMethodSelector />
      </div>
    );
  }

  const currentMethodInfo = REVISION_METHODS[currentMethod];

  return (
    <div className="space-y-6">
      {/* Method Indicator */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentMethodInfo.emoji}</span>
              <div>
                <p className="text-sm text-gray-600">Méthode actuelle</p>
                <p className="text-lg font-bold text-gray-900">{currentMethodInfo.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMethodSelector(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Changer de méthode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Method Selector Dialog */}
      {showMethodSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Changer de méthode de révision</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMethodSelector(false)}
                >
                  ✕
                </Button>
              </div>
              <RevisionMethodSelector
                currentMethod={currentMethod}
                onMethodSelected={() => setShowMethodSelector(false)}
                showCancelButton
              />
            </div>
          </div>
        </div>
      )}

      {/* En-tête avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Taux de complétion</p>
                <p className="text-2xl font-bold text-blue-800">
                  {methodStats?.completion_rate || stats.masteryRate || 0}%
                </p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Complétées aujourd'hui</p>
                <p className="text-2xl font-bold text-green-800">
                  {methodStats?.completed_today || stats.todayCompleted || 0}
                </p>
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
                  {methodStats?.pending_today || methodTodayItems.length || todayItems.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">En retard</p>
                <p className="text-2xl font-bold text-purple-800">
                  {methodStats?.overdue_count || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Plan de révision
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
          {/* Render method-specific view */}
          {currentMethod === 'J_METHOD' && (
            <JMethodView
              todayItems={methodTodayItems}
              overdueItems={overdueItems}
            />
          )}

          {currentMethod === 'BLOCK_METHOD' && (
            <BlockMethodView
              todayItems={methodTodayItems}
              blockConfig={blockConfig}
            />
          )}

          {currentMethod === 'QCM_FIRST' && (
            <QCMFirstView
              todayItems={methodTodayItems}
              todaySession={todayQCMSession}
            />
          )}
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