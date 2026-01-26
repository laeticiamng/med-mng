import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Lightbulb, RotateCcw, ChevronRight, Flame, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { POINTS_CONFIG, useGamification } from '@/hooks/useGamification';

interface Recommendation {
  id: string;
  recommended_item_code: string;
  recommendation_type: string;
  confidence_score: number;
  reasoning: string;
  metadata: any;
  expires_at: string;
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
        metadata: { difficulty: 'A', category: 'fondamentaux' }
      },
      {
        recommended_item_code: 'IC-033',
        recommendation_type: 'interest_based',
        confidence_score: 0.88,
        reasoning: 'Recommandé en fonction de vos préférences d\'apprentissage',
        metadata: { difficulty: 'A', category: 'gynecologie' }
      },
      {
        recommended_item_code: 'IC-087',
        recommendation_type: 'difficulty_match',
        confidence_score: 0.82,
        reasoning: 'Niveau de difficulté adapté à votre progression actuelle',
        metadata: { difficulty: 'B', category: 'neurologie' }
      },
      {
        recommended_item_code: 'IC-156',
        recommendation_type: 'review',
        confidence_score: 0.75,
        reasoning: 'Révision recommandée pour consolider vos acquis',
        metadata: { difficulty: 'A', category: 'cardiologie' }
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
      default:
        return 'Recommandé';
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
      addPoints(user.id, POINTS_CONFIG.itemReviewed, 'itemReviewed');
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
              <p className="text-sm text-muted-foreground mb-4">
                {rec.reasoning}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {rec.metadata?.difficulty && (
                    <Badge variant="outline" className="text-xs">
                      Rang {rec.metadata.difficulty}
                    </Badge>
                  )}
                  {rec.metadata?.category && (
                    <Badge variant="outline" className="text-xs">
                      {rec.metadata.category}
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