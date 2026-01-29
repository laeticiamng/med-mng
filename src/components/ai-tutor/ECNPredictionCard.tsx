import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, TrendingUp, TrendingDown, RefreshCw, 
  Award, AlertTriangle, BookOpen, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useECNPrediction } from '@/hooks/useECNPrediction';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ECNPredictionCard: React.FC = () => {
  const { 
    loading, 
    currentPrediction, 
    generatePrediction, 
    getLatestPrediction 
  } = useECNPrediction();
  
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    getLatestPrediction();
  }, [getLatestPrediction]);

  const handleRefresh = async () => {
    await generatePrediction();
  };

  if (!currentPrediction && !loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="py-8 text-center space-y-4">
          <Target className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Aucune prédiction disponible. Commencez à réviser pour obtenir une estimation de votre rang ECN.
          </p>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Générer ma prédiction
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rankAvg = currentPrediction 
    ? Math.round((currentPrediction.predicted_rank_min + currentPrediction.predicted_rank_max) / 2)
    : 0;

  const getRankColor = (rank: number) => {
    if (rank <= 500) return 'text-green-500';
    if (rank <= 2000) return 'text-blue-500';
    if (rank <= 5000) return 'text-yellow-500';
    return 'text-orange-500';
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Prédiction ECN
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentPrediction && (
          <>
            {/* Main Prediction */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Rang estimé</p>
              <div className={`text-4xl font-bold ${getRankColor(rankAvg)}`}>
                {currentPrediction.predicted_rank_min} - {currentPrediction.predicted_rank_max}
              </div>
              <Badge variant="outline" className="mt-2">
                Top {Math.round(100 - currentPrediction.predicted_percentile)}%
              </Badge>
            </motion.div>

            {/* Confidence */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Indice de confiance</span>
                <span className="font-medium">{currentPrediction.confidence_interval}%</span>
              </div>
              <Progress value={currentPrediction.confidence_interval} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Plus vous révisez, plus la prédiction est précise
              </p>
            </div>

            {/* Last update */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Mise à jour: {format(new Date(currentPrediction.prediction_date), 'PPp', { locale: fr })}
            </div>

            {/* Details Toggle */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Masquer les détails' : 'Voir les détails'}
            </Button>

            {/* Details Section */}
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {/* Strong Items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-success">
                    <Award className="h-4 w-4" />
                    Points forts ({currentPrediction.strong_items.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentPrediction.strong_items.slice(0, 5).map(item => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {currentPrediction.strong_items.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentPrediction.strong_items.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Weak Items */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    À travailler ({currentPrediction.weak_items.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentPrediction.weak_items.slice(0, 5).map(item => (
                      <Badge key={item} variant="destructive" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {currentPrediction.weak_items.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentPrediction.weak_items.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Study Plan */}
                {currentPrediction.recommended_study_plan && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Plan de révision recommandé
                    </div>
                    <div className="space-y-2">
                      {currentPrediction.recommended_study_plan.daily_goals?.map((goal, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{goal.item_code}</span>
                          <Badge variant="outline">{goal.target_sessions} sessions/jour</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-success">
                      <TrendingUp className="h-3 w-3" />
                      Amélioration estimée: +{currentPrediction.recommended_study_plan.estimated_improvement}%
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
