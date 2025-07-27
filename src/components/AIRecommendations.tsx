import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Star, TrendingUp, Settings } from 'lucide-react';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';

export const AIRecommendations = () => {
  const { isLoading, recommendations, generateRecommendations } = useAIRecommendations();
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Génération automatique au premier chargement
    generateRecommendations();
  }, [generateRecommendations]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generateRecommendations();
    }, 30 * 60 * 1000); // Toutes les 30 minutes

    return () => clearInterval(interval);
  }, [autoRefresh, generateRecommendations]);

  if (isLoading && !recommendations) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Génération des recommandations IA...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Recommandations IA
            </CardTitle>
            <CardDescription>
              Suggestions personnalisées basées sur votre historique d'écoute
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {autoRefresh ? 'Désactiver' : 'Activer'} auto-refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={generateRecommendations}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-1" />
              )}
              Actualiser
            </Button>
          </div>
        </CardHeader>
        
        {recommendations && (
          <CardContent className="space-y-6">
            {/* Pattern d'écoute */}
            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium mb-2">Votre pattern d'écoute</h4>
              <p className="text-sm text-muted-foreground">{recommendations.listening_pattern}</p>
            </div>

            {/* Recommandations */}
            <div>
              <h4 className="font-medium mb-3">Recommandations personnalisées</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.recommendations.map((rec, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {rec.specialty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="text-xs font-medium">
                          {Math.round(rec.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{rec.genre}</Badge>
                        <Badge variant="outline">{rec.mood}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rec.reason}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {recommendations.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Conseils pour optimiser votre apprentissage</h4>
                <ul className="space-y-2">
                  {recommendations.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};