import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppliedRecommendations } from '@/hooks/useAppliedRecommendations';
import { useEffectivenessScores } from '@/hooks/useEffectivenessScores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Loader2, 
  Lightbulb, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  Zap, 
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Trophy,
  TrendingDown
} from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'timing' | 'platform' | 'volume' | 'quality';
  actionable: string;
  historicalScore?: number;
  priority?: number;
}

interface AnalysisSummary {
  total: number;
  successRate: number;
  bestHours: string[];
  bestDays: string[];
}

const categoryIcons = {
  timing: Clock,
  platform: BarChart3,
  volume: TrendingUp,
  quality: Zap,
};

const categoryColors = {
  timing: 'text-blue-600',
  platform: 'text-purple-600',
  volume: 'text-green-600',
  quality: 'text-orange-600',
};

const impactColors = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-green-50 text-green-700 border-green-200',
};

const impactLabels = {
  high: 'Impact élevé',
  medium: 'Impact moyen',
  low: 'Impact faible',
};

export function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [notes, setNotes] = useState('');
  
  const { applyRecommendation, loading: applyLoading } = useAppliedRecommendations();
  const { scores, getScoreForCategory } = useEffectivenessScores();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleApplyRecommendation = async () => {
    if (!selectedRec) return;
    
    try {
      await applyRecommendation(
        {
          id: `${selectedRec.category}-${Date.now()}`,
          title: selectedRec.title,
          description: selectedRec.description,
          category: selectedRec.category,
          impact: selectedRec.impact,
        },
        notes
      );
      setSelectedRec(null);
      setNotes('');
    } catch (error) {
      console.error('Error applying recommendation:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Envoyer les scores historiques à l'edge function
      const { data, error: functionError } = await supabase.functions.invoke('generate-recommendations', {
        body: { historicalScores: scores }
      });

      if (functionError) {
        if (functionError.message.includes('429')) {
          throw new Error('Trop de requêtes. Veuillez réessayer dans quelques instants.');
        }
        if (functionError.message.includes('402')) {
          throw new Error('Crédits Lovable AI épuisés. Veuillez recharger votre compte.');
        }
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.message) {
        setError(data.message);
        setRecommendations([]);
        return;
      }

      // Enrichir les recommandations avec les scores historiques et calculer la priorité
      const enrichedRecs = (data.recommendations || []).map((rec: Recommendation) => {
        const historicalScore = getScoreForCategory(rec.category);
        const impactWeight = rec.impact === 'high' ? 3 : rec.impact === 'medium' ? 2 : 1;
        // Priorité = (impact * 100) + score historique
        const priority = (impactWeight * 100) + historicalScore;
        return {
          ...rec,
          historicalScore,
          priority,
        };
      });

      // Trier par priorité décroissante
      enrichedRecs.sort((a: Recommendation, b: Recommendation) => 
        (b.priority || 0) - (a.priority || 0)
      );

      setRecommendations(enrichedRecs);
      setAnalysis(data.analysis || null);
      
      if (data.recommendations?.length > 0) {
        toast.success('Recommandations générées avec succès');
      }
    } catch (error: any) {
      console.error('Error loading recommendations:', error);
      setError(error.message || 'Erreur lors de la génération des recommandations');
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Analyse des données en cours...</p>
          <p className="text-sm text-muted-foreground mt-2">L'IA génère vos recommandations personnalisées</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recommandations d'Optimisation
            </CardTitle>
            <CardDescription>
              Suggestions personnalisées générées par IA pour améliorer vos performances
            </CardDescription>
          </div>
          <Button
            onClick={loadRecommendations}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{analysis.total}</p>
                  <p className="text-xs text-muted-foreground">Notifications analysées</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{analysis.successRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Taux de succès</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg font-bold">{analysis.bestHours.join(', ')}</p>
                  <p className="text-xs text-muted-foreground">Meilleurs horaires</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg font-bold">{analysis.bestDays.join(', ')}</p>
                  <p className="text-xs text-muted-foreground">Meilleurs jours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {recommendations.length === 0 && !error ? (
          <div className="text-center py-12 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune recommandation disponible</p>
            <p className="text-sm mt-2">Cliquez sur "Actualiser" pour générer des recommandations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = categoryIcons[rec.category];
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${categoryColors[rec.category]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{rec.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>
                          </div>
                          <Badge variant="outline" className={impactColors[rec.impact]}>
                            {impactLabels[rec.impact]}
                          </Badge>
                         </div>
                         <div className="bg-primary/5 p-3 rounded-lg">
                           <p className="text-sm font-medium mb-1">Action recommandée:</p>
                           <p className="text-sm">{rec.actionable}</p>
                         </div>
                         
                         {rec.historicalScore && rec.historicalScore !== 50 && (
                           <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                             {rec.historicalScore > 60 ? (
                               <Trophy className="h-4 w-4 text-yellow-600" />
                             ) : (
                               <TrendingDown className="h-4 w-4 text-muted-foreground" />
                             )}
                             <div className="flex-1">
                               <p className="text-xs font-medium">
                                 Efficacité historique: {rec.historicalScore.toFixed(0)}/100
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 {rec.historicalScore > 70 ? 'Excellent historique de résultats' :
                                  rec.historicalScore > 60 ? 'Bons résultats historiques' :
                                  rec.historicalScore > 50 ? 'Résultats moyens' :
                                  'Efficacité à prouver'}
                               </p>
                             </div>
                           </div>
                         )}
                         
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="text-xs">
                               {rec.category === 'timing' && '⏰ Timing'}
                               {rec.category === 'platform' && '📊 Plateforme'}
                               {rec.category === 'volume' && '📈 Volume'}
                               {rec.category === 'quality' && '⚡ Qualité'}
                             </Badge>
                             {rec.priority && rec.priority > 250 && (
                               <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                                 <Trophy className="h-3 w-3 mr-1" />
                                 Prioritaire
                               </Badge>
                             )}
                           </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRec(rec)}
                              >
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Marquer comme appliquée
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Appliquer la recommandation</DialogTitle>
                                <DialogDescription>
                                  Les métriques actuelles seront enregistrées pour mesurer l'impact futur de cette recommandation.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">{rec.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                  <div className="bg-primary/5 p-3 rounded-lg">
                                    <p className="text-sm font-medium mb-1">Action recommandée:</p>
                                    <p className="text-sm">{rec.actionable}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Notes (optionnel)
                                  </label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Ajoutez des notes sur l'implémentation de cette recommandation..."
                                    rows={3}
                                  />
                                </div>

                                <Button
                                  onClick={handleApplyRecommendation}
                                  disabled={applyLoading}
                                  className="w-full"
                                >
                                  {applyLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                  )}
                                  Confirmer l'application
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {recommendations.length > 0 && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Ces recommandations sont générées par IA en analysant vos 30 derniers jours de données. 
              Elles sont mises à jour régulièrement en fonction de l'évolution de vos métriques.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
