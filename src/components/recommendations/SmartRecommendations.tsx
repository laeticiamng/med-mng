import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Lightbulb, RotateCcw, ChevronRight, Flame, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';

interface Recommendation {
  id: string;
  recommended_item_code: string;
  recommendation_type: string;
  confidence_score: number;
  reasoning: string;
  metadata: RecommendationMetadata;
  expires_at: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  xpReward: number;
}

interface RecommendationMetadata {
  difficulty?: string;
  specialty?: string;
  category?: string;
  lastReviewed?: string;
  reviewCount?: number;
  averageScore?: number;
  prerequisites?: string[];
  relatedItems?: string[];
}

export const SmartRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logActivity } = useActivityTracking();
  const { stats: gamificationStats, loadStats, addPoints } = useGamification();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('edn_smart_recommendations')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        setRecommendations(data);
      } else {
        // Générer des recommandations de démonstration
        await generateDemoRecommendations();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      // Afficher des recommandations statiques en cas d'erreur
      setRecommendations([
        {
          id: 'demo-1',
          recommended_item_code: 'IC-001',
          recommendation_type: 'next_study',
          confidence_score: 0.95,
          reasoning: 'Item fondamental recommandé pour débuter votre apprentissage',
          metadata: { difficulty: 'A', specialty: 'Fondamentaux' },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'demo-2',
          recommended_item_code: 'IC-033',
          recommendation_type: 'interest_based',
          confidence_score: 0.88,
          reasoning: 'Basé sur votre intérêt pour la gynécologie-obstétrique',
          metadata: { difficulty: 'A', specialty: 'Gynécologie' },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoRecommendations = async () => {
    const demoRecs = [
      {
        recommended_item_code: 'IC-001',
        recommendation_type: 'next_study',
        confidence_score: 0.95,
        reasoning: 'Item fondamental pour commencer votre parcours d\'apprentissage EDN',
        metadata: { difficulty: 'A', category: 'fondamentaux', specialty: 'Médecine générale', prerequisites: [] },
        priority: 'high',
        estimatedTime: 30,
        xpReward: 50
      },
      {
        recommended_item_code: 'IC-033',
        recommendation_type: 'interest_based',
        confidence_score: 0.88,
        reasoning: 'Recommandé en fonction de vos préférences d\'apprentissage',
        metadata: { difficulty: 'A', category: 'gynecologie', specialty: 'Gynécologie-Obstétrique', relatedItems: ['IC-034', 'IC-035'] },
        priority: 'medium',
        estimatedTime: 45,
        xpReward: 60
      },
      {
        recommended_item_code: 'IC-087',
        recommendation_type: 'difficulty_match',
        confidence_score: 0.82,
        reasoning: 'Niveau de difficulté adapté à votre progression actuelle',
        metadata: { difficulty: 'B', category: 'neurologie', specialty: 'Neurologie', averageScore: 72 },
        priority: 'medium',
        estimatedTime: 60,
        xpReward: 80
      },
      {
        recommended_item_code: 'IC-156',
        recommendation_type: 'review',
        confidence_score: 0.75,
        reasoning: 'Révision recommandée pour consolider vos acquis',
        metadata: { difficulty: 'A', category: 'cardiologie', specialty: 'Cardiologie', lastReviewed: '2024-12-15', reviewCount: 3 },
        priority: 'low',
        estimatedTime: 20,
        xpReward: 30
      },
      {
        recommended_item_code: 'IC-078',
        recommendation_type: 'spaced_repetition',
        confidence_score: 0.90,
        reasoning: 'Basé sur la courbe d\'oubli - révision optimale maintenant',
        metadata: { difficulty: 'A', category: 'urgences', specialty: 'Médecine d\'urgence' },
        priority: 'high',
        estimatedTime: 25,
        xpReward: 40
      },
      {
        recommended_item_code: 'IC-112',
        recommendation_type: 'weakness',
        confidence_score: 0.85,
        reasoning: 'Zone à améliorer identifiée dans vos derniers examens',
        metadata: { difficulty: 'B', category: 'pneumologie', specialty: 'Pneumologie', averageScore: 58 },
        priority: 'high',
        estimatedTime: 50,
        xpReward: 70
      }
    ];

    try {
      const { data, error } = await supabase
        .from('edn_smart_recommendations')
        .insert(demoRecs)
        .select();

      if (!error && data) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'next_study':
        return <BookOpen className="h-4 w-4" />;
      case 'review':
        return <RotateCcw className="h-4 w-4" />;
      case 'difficulty_match':
        return <TrendingUp className="h-4 w-4" />;
      case 'interest_based':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getRecommendationLabel = (type: string) => {
    switch (type) {
      case 'next_study':
        return 'Prochaine étude';
      case 'review':
        return 'Révision';
      case 'difficulty_match':
        return 'Niveau adapté';
      case 'interest_based':
        return 'Basé sur vos intérêts';
      case 'spaced_repetition':
        return 'Répétition espacée';
      case 'weakness':
        return 'Zone à renforcer';
      case 'prerequisite':
        return 'Prérequis';
      case 'trending':
        return 'Populaire';
      default:
        return 'Recommandé';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'low':
        return 'bg-success/10 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Normal';
      case 'low':
        return 'Optionnel';
      default:
        return priority;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-success/10 text-success';
    if (score >= 0.7) return 'bg-primary/10 text-primary';
    return 'bg-warning/10 text-warning';
  };

  const handleItemClick = async (itemCode: string, recType: string) => {
    logActivity({
      activity_type: 'study',
      count: 1,
      metadata: { component: 'smart_recommendations', action: 'click_recommendation', itemCode, type: recType }
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      addPoints(user.id, 'itemReviewed');
    }
    const slug = itemCode.toLowerCase().replace('ic-', 'ic-');
    navigate(`/edn-complete/item/${slug}`);
  };

  if (loading) {
    return <div className="animate-pulse">Chargement des recommandations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Recommandations Intelligentes</h2>
          <p className="text-muted-foreground">
            Suggestions personnalisées basées sur votre profil d'apprentissage
          </p>
        </div>
        {gamificationStats && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Flame className="h-3 w-3 text-warning" />
              {gamificationStats.currentStreak}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3 text-primary" />
              Nv.{gamificationStats.level}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getRecommendationIcon(rec.recommendation_type)}
                  {rec.recommended_item_code}
                </CardTitle>
                <Badge 
                  variant="secondary" 
                  className={getConfidenceColor(rec.confidence_score)}
                >
                  {Math.round(rec.confidence_score * 100)}%
                </Badge>
              </div>
              <CardDescription>
                {getRecommendationLabel(rec.recommendation_type)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {rec.reasoning}
              </p>

              {/* Priority & Time */}
              <div className="flex items-center gap-2 mb-3">
                {rec.priority && (
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                    {getPriorityLabel(rec.priority)}
                  </Badge>
                )}
                {rec.estimatedTime && (
                  <Badge variant="outline" className="text-xs">
                    ~{rec.estimatedTime} min
                  </Badge>
                )}
                {rec.xpReward && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                    +{rec.xpReward} XP
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {rec.metadata?.difficulty && (
                    <Badge variant="outline" className="text-xs">
                      Rang {rec.metadata.difficulty}
                    </Badge>
                  )}
                  {rec.metadata?.specialty && (
                    <Badge variant="outline" className="text-xs">
                      {rec.metadata.specialty}
                    </Badge>
                  )}
                  {rec.metadata?.averageScore && (
                    <Badge variant="outline" className="text-xs">
                      Score moy: {rec.metadata.averageScore}%
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemClick(rec.recommended_item_code, rec.recommendation_type)}
                  className="p-1 h-auto"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recommendations.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aucune recommandation disponible</CardTitle>
            <CardDescription>
              Commencez à étudier pour recevoir des recommandations personnalisées !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(ROUTE_PATHS.ednComplete)}>
              Explorer les items EDN
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={loadRecommendations}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Actualiser les recommandations
        </Button>
      </div>
    </div>
  );
};