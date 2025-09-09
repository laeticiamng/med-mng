/**
 * Moteur d'apprentissage adaptatif simplifié
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/unified/useAuth';
import { contentService } from '@/services/business/SimpleContentService';
import { analyticsService } from '@/services/UnifiedAnalyticsService';
import type { ContentModule } from '@/services/business/SimpleContentService';
import type { UserStats } from '@/services/UnifiedAnalyticsService';

interface AdaptiveLearningEngineProps {
  focusArea?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onModuleComplete?: (moduleId: string, score: number) => void;
}

export const AdaptiveLearningEngine: React.FC<AdaptiveLearningEngineProps> = ({
  focusArea = 'general',
  difficulty = 'medium',
  onModuleComplete
}) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [currentModule, setCurrentModule] = useState<ContentModule | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [user?.id, focusArea]);

  const loadInitialData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const [modulesResponse, statsResponse, recommendationsResponse] = await Promise.all([
        contentService.getModules({ category: focusArea, difficulty }),
        analyticsService.getUserStats(user.id),
        analyticsService.getRecommendations(user.id)
      ]);

      if (modulesResponse.success && modulesResponse.data) {
        setModules(modulesResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setUserStats(statsResponse.data);
      }

      if (recommendationsResponse.success && recommendationsResponse.data) {
        setRecommendations(recommendationsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (module: ContentModule) => {
    setCurrentModule(module);
    
    // Tracker l'événement de démarrage
    await analyticsService.trackEvent('module_started', {
      moduleId: module.id,
      category: module.category,
      difficulty: module.difficulty
    });
  };

  const completeModule = useCallback(async (moduleId: string, score: number) => {
    try {
      // Sauvegarder le progrès
      await contentService.saveProgress(moduleId, 100);
      
      // Tracker la completion
      await analyticsService.trackEvent('module_completed', {
        moduleId,
        score,
        timestamp: new Date().toISOString()
      });

      // Recharger les stats
      if (user?.id) {
        const statsResponse = await analyticsService.getUserStats(user.id);
        if (statsResponse.success && statsResponse.data) {
          setUserStats(statsResponse.data);
        }
      }

      onModuleComplete?.(moduleId, score);
      setCurrentModule(null);
    } catch (error) {
      console.error('Erreur lors de la completion du module:', error);
    }
  }, [user?.id, onModuleComplete]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Chargement de votre parcours d'apprentissage...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentModule) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentModule.title}</CardTitle>
              <CardDescription>{currentModule.description}</CardDescription>
            </div>
            <Badge variant="outline">
              {currentModule.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            {currentModule.content && typeof currentModule.content === 'object' ? (
              <div dangerouslySetInnerHTML={{ 
                __html: JSON.stringify(currentModule.content, null, 2)
              }} />
            ) : (
              <p>{currentModule.content}</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentModule(null)}
            >
              Retour
            </Button>
            <Button onClick={() => completeModule(currentModule.id, 85)}>
              Marquer comme terminé
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Stats utilisateur */}
      {userStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Votre Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{userStats.level}</div>
                <div className="text-sm text-muted-foreground">Niveau</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.modulesCompleted}</div>
                <div className="text-sm text-muted-foreground">Modules terminés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(userStats.averageScore)}%</div>
                <div className="text-sm text-muted-foreground">Score moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.streak}</div>
                <div className="text-sm text-muted-foreground">Série</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recommandations IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <Alert key={index}>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{rec.title}:</strong> {rec.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modules disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Modules d'Apprentissage
          </CardTitle>
          <CardDescription>
            Sélectionnez un module pour commencer votre apprentissage adaptatif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{module.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {module.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        ~{module.estimatedTime}min
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => startModule(module)}
                        className="h-8"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {modules.length === 0 && (
            <Alert>
              <AlertDescription>
                Aucun module disponible pour cette catégorie. Essayez de changer les filtres.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};