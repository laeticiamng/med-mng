/**
 * Moteur d'apprentissage adaptatif - IA personnalisée
 * Ajustement automatique difficultés, rythme, contenu
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Target, TrendingUp, Clock, Star, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/unified/useAuth';
import { contentService } from '@/services/business/ContentService';
import { analyticsService } from '@/services/business/AnalyticsService';
import { toast } from '@/hooks/use-toast';

interface AdaptationResult {
  type: 'difficulty' | 'pace' | 'content' | 'schedule';
  change: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
}

interface LearningState {
  currentLevel: number;
  masteryScore: number;
  engagementLevel: number;
  struggleAreas: string[];
  strongAreas: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  optimalDifficulty: number;
  recommendedPace: 'slow' | 'normal' | 'fast';
}

interface PersonalizationSettings {
  adaptDifficulty: boolean;
  adaptPace: boolean;
  adaptContent: boolean;
  adaptSchedule: boolean;
  interventionThreshold: number;
  confidenceThreshold: number;
}

export const AdaptiveLearningEngine: React.FC<{
  moduleId: string;
  onAdaptation?: (adaptation: AdaptationResult) => void;
}> = ({ moduleId, onAdaptation }) => {
  const { user } = useAuth();
  const [learningState, setLearningState] = useState<LearningState | null>(null);
  const [adaptations, setAdaptations] = useState<AdaptationResult[]>([]);
  const [settings, setSettings] = useState<PersonalizationSettings>({
    adaptDifficulty: true,
    adaptPace: true,
    adaptContent: true,
    adaptSchedule: false,
    interventionThreshold: 0.3,
    confidenceThreshold: 0.7,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

  // Analyser l'état d'apprentissage en continu
  useEffect(() => {
    if (user && moduleId) {
      analyzeLearningState();
      const interval = setInterval(analyzeLearningState, 30000); // Toutes les 30s
      return () => clearInterval(interval);
    }
  }, [user, moduleId]);

  const analyzeLearningState = useCallback(async () => {
    if (!user) return;

    try {
      setIsAnalyzing(true);

      // Récupérer les données d'apprentissage récentes
      const analytics = await analyticsService.getUserAnalytics(user.id, {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });

      // Analyser les patterns d'apprentissage
      const insights = await analyticsService.getPredictiveInsights(user.id);

      // Calculer l'état d'apprentissage actuel
      const state: LearningState = {
        currentLevel: calculateCurrentLevel(analytics),
        masteryScore: analytics.performance.overallScore,
        engagementLevel: calculateEngagement(analytics),
        struggleAreas: analytics.performance.weaknessAreas.map(area => area.name),
        strongAreas: analytics.performance.strengthAreas.map(area => area.name),
        learningStyle: detectLearningStyle(analytics),
        optimalDifficulty: calculateOptimalDifficulty(analytics),
        recommendedPace: calculateRecommendedPace(analytics),
      };

      setLearningState(state);
      setInsights(insights.recommendations);

      // Déclencher des adaptations si nécessaire
      await evaluateAdaptations(state, analytics);

    } catch (error) {
      console.warn('Failed to analyze learning state:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, moduleId, settings]);

  const evaluateAdaptations = async (state: LearningState, analytics: any) => {
    const potentialAdaptations: AdaptationResult[] = [];

    // Adaptation de difficulté
    if (settings.adaptDifficulty) {
      const difficultyAdaptation = evaluateDifficultyAdaptation(state, analytics);
      if (difficultyAdaptation) {
        potentialAdaptations.push(difficultyAdaptation);
      }
    }

    // Adaptation de rythme
    if (settings.adaptPace) {
      const paceAdaptation = evaluatePaceAdaptation(state, analytics);
      if (paceAdaptation) {
        potentialAdaptations.push(paceAdaptation);
      }
    }

    // Adaptation de contenu
    if (settings.adaptContent) {
      const contentAdaptation = evaluateContentAdaptation(state, analytics);
      if (contentAdaptation) {
        potentialAdaptations.push(contentAdaptation);
      }
    }

    // Appliquer les adaptations avec suffisamment de confiance
    const validAdaptations = potentialAdaptations.filter(
      adaptation => adaptation.confidence >= settings.confidenceThreshold
    );

    if (validAdaptations.length > 0) {
      setAdaptations(prev => [...prev, ...validAdaptations]);
      
      for (const adaptation of validAdaptations) {
        await applyAdaptation(adaptation);
        onAdaptation?.(adaptation);
      }
    }
  };

  const applyAdaptation = async (adaptation: AdaptationResult) => {
    if (!user) return;

    try {
      // Enregistrer l'adaptation
      await analyticsService.trackEvent(user.id, {
        type: 'adaptation_applied',
        category: 'learning_engine',
        action: adaptation.type,
        label: adaptation.change,
        value: adaptation.confidence,
        metadata: {
          moduleId,
          reason: adaptation.reason,
          expectedImpact: adaptation.expectedImpact,
        }
      });

      // Notification à l'utilisateur
      toast({
        title: "Apprentissage adapté",
        description: `${adaptation.change} - ${adaptation.reason}`,
      });

    } catch (error) {
      console.warn('Failed to apply adaptation:', error);
    }
  };

  const evaluateDifficultyAdaptation = (state: LearningState, analytics: any): AdaptationResult | null => {
    const recentScores = analytics.performance.scoreHistory.slice(-5);
    const avgScore = recentScores.reduce((sum: number, score: any) => sum + score.score, 0) / recentScores.length;

    if (avgScore < 60 && state.masteryScore < 70) {
      return {
        type: 'difficulty',
        change: 'Diminution de la difficulté',
        reason: 'Performance en baisse détectée',
        expectedImpact: 'Amélioration de la confiance et des résultats',
        confidence: 0.85,
      };
    }

    if (avgScore > 85 && state.masteryScore > 85) {
      return {
        type: 'difficulty',
        change: 'Augmentation de la difficulté',
        reason: 'Maîtrise élevée constatée',
        expectedImpact: 'Challenge optimal pour maintenir l\'engagement',
        confidence: 0.8,
      };
    }

    return null;
  };

  const evaluatePaceAdaptation = (state: LearningState, analytics: any): AdaptationResult | null => {
    const avgSessionDuration = analytics.engagement.avgSessionDuration;
    const engagementLevel = state.engagementLevel;

    if (engagementLevel < 0.4 && avgSessionDuration < 15) {
      return {
        type: 'pace',
        change: 'Ralentissement du rythme',
        reason: 'Engagement faible et sessions courtes',
        expectedImpact: 'Réduction du stress et amélioration de l\'assimilation',
        confidence: 0.75,
      };
    }

    if (engagementLevel > 0.8 && avgSessionDuration > 45) {
      return {
        type: 'pace',
        change: 'Accélération du rythme',
        reason: 'Engagement élevé et sessions longues',
        expectedImpact: 'Optimisation du temps d\'apprentissage',
        confidence: 0.7,
      };
    }

    return null;
  };

  const evaluateContentAdaptation = (state: LearningState, analytics: any): AdaptationResult | null => {
    if (state.struggleAreas.length > 2) {
      return {
        type: 'content',
        change: 'Ajout de contenu de révision personnalisé',
        reason: `Difficultés détectées dans: ${state.struggleAreas.join(', ')}`,
        expectedImpact: 'Renforcement des concepts faibles',
        confidence: 0.9,
      };
    }

    if (state.learningStyle && state.learningStyle !== 'mixed') {
      return {
        type: 'content',
        change: `Contenu adapté au style ${state.learningStyle}`,
        reason: 'Style d\'apprentissage préféré identifié',
        expectedImpact: 'Meilleure assimilation des concepts',
        confidence: 0.6,
      };
    }

    return null;
  };

  const calculateCurrentLevel = (analytics: any): number => {
    // Logique de calcul du niveau basée sur les performances
    const baseLevel = Math.floor(analytics.performance.overallScore / 20) + 1;
    return Math.min(Math.max(baseLevel, 1), 5);
  };

  const calculateEngagement = (analytics: any): number => {
    const factors = [
      analytics.engagement.retentionRate / 100,
      Math.min(analytics.engagement.avgSessionDuration / 30, 1),
      Math.min(analytics.engagement.streakData.current / 7, 1),
    ];
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  };

  const detectLearningStyle = (analytics: any): LearningState['learningStyle'] => {
    // Analyse simplifiée du style d'apprentissage
    // En réalité, cela nécessiterait une analyse plus sophistiquée
    return 'mixed';
  };

  const calculateOptimalDifficulty = (analytics: any): number => {
    const performance = analytics.performance.overallScore;
    if (performance < 50) return 0.3;
    if (performance < 70) return 0.5;
    if (performance < 85) return 0.7;
    return 0.9;
  };

  const calculateRecommendedPace = (analytics: any): LearningState['recommendedPace'] => {
    const engagement = analytics.engagement.retentionRate;
    if (engagement < 40) return 'slow';
    if (engagement > 80) return 'fast';
    return 'normal';
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Connectez-vous pour activer l'apprentissage adaptatif</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Moteur d'Apprentissage Adaptatif
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              Analyse en cours...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">État actuel</TabsTrigger>
            <TabsTrigger value="adaptations">Adaptations</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {learningState ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{learningState.currentLevel}</div>
                    <div className="text-sm text-muted-foreground">Niveau</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{learningState.masteryScore}%</div>
                    <div className="text-sm text-muted-foreground">Maîtrise</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{Math.round(learningState.engagementLevel * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Engagement</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold capitalize">{learningState.recommendedPace}</div>
                    <div className="text-sm text-muted-foreground">Rythme</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Difficulté optimale</h4>
                    <Progress value={learningState.optimalDifficulty * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(learningState.optimalDifficulty * 100).toFixed(0)}% de difficulté recommandée
                    </p>
                  </div>

                  {learningState.struggleAreas.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Zones de difficulté :</strong> {learningState.struggleAreas.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {learningState.strongAreas.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Points forts</h4>
                      <div className="flex flex-wrap gap-1">
                        {learningState.strongAreas.map((area, index) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {insights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommandations IA</h4>
                    <div className="space-y-2">
                      {insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="p-3 border rounded-lg text-sm">
                          <div className="font-medium">{insight.title}</div>
                          <div className="text-muted-foreground">{insight.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Collecte des données d'apprentissage...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="adaptations" className="space-y-4">
            {adaptations.length > 0 ? (
              <div className="space-y-3">
                {adaptations.slice(-5).map((adaptation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">
                        {adaptation.type}
                      </Badge>
                      <Badge variant="secondary">
                        {(adaptation.confidence * 100).toFixed(0)}% confiance
                      </Badge>
                    </div>
                    <div className="font-medium">{adaptation.change}</div>
                    <div className="text-sm text-muted-foreground mb-1">{adaptation.reason}</div>
                    <div className="text-sm text-green-600">{adaptation.expectedImpact}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Aucune adaptation nécessaire pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adaptation de difficulté</div>
                  <div className="text-sm text-muted-foreground">
                    Ajuster automatiquement la difficulté selon les performances
                  </div>
                </div>
                <Button
                  variant={settings.adaptDifficulty ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    adaptDifficulty: !prev.adaptDifficulty
                  }))}
                >
                  {settings.adaptDifficulty ? "Activé" : "Désactivé"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adaptation de rythme</div>
                  <div className="text-sm text-muted-foreground">
                    Modifier le rythme selon l'engagement
                  </div>
                </div>
                <Button
                  variant={settings.adaptPace ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    adaptPace: !prev.adaptPace
                  }))}
                >
                  {settings.adaptPace ? "Activé" : "Désactivé"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Adaptation de contenu</div>
                  <div className="text-sm text-muted-foreground">
                    Personnaliser le contenu selon le profil d'apprentissage
                  </div>
                </div>
                <Button
                  variant={settings.adaptContent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    adaptContent: !prev.adaptContent
                  }))}
                >
                  {settings.adaptContent ? "Activé" : "Désactivé"}
                </Button>
              </div>

              <div>
                <div className="font-medium mb-2">Seuil de confiance pour les adaptations</div>
                <Progress value={settings.confidenceThreshold * 100} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {(settings.confidenceThreshold * 100).toFixed(0)}% minimum
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};