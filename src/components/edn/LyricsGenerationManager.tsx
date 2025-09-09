import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Loader2, CheckCircle, AlertCircle, 
  Music, RefreshCw, Eye 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAllSpecificLyrics, checkLyricsProgress } from '@/scripts/generateAllLyrics';
import { logger } from '@/services/logger';

interface GenerationStats {
  totalItems: number;
  itemsWithLyrics: number;
  progress: number;
  sampleWithoutLyrics: Array<{item_code: string, title: string}>;
}

interface GenerationResult {
  stats?: {
    processed?: number;
    success?: number;
    errors?: number;
    total?: number;
  };
}

export const LyricsGenerationManager: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const { toast } = useToast();

  // Charger les statistiques au démarrage
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await checkLyricsProgress();
      setStats(progressData);
      setProgress(progressData.progress);
    } catch (error) {
      logger.error('Erreur chargement progrès', {
        component: 'LyricsGenerationManager',
        action: 'loadProgress',
        metadata: { error }
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    }
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setLastResult(null);
    
    try {
      toast({
        title: "🎵 Génération lancée",
        description: "Création des paroles spécifiques pour tous les items EDN...",
      });

      const result = await generateAllSpecificLyrics();
      setLastResult(result);
      
      // Recharger les stats
      await loadProgress();

      toast({
        title: "✅ Génération terminée",
        description: `Paroles générées avec succès: ${result?.stats?.success || 0} items`,
      });

    } catch (error: unknown) {
      logger.error('Erreur génération', {
        component: 'LyricsGenerationManager',
        action: 'handleGenerateAll',
        metadata: { error }
      });
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast({
        title: "❌ Erreur génération",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header et contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Music className="h-6 w-6 text-blue-600" />
            Génération des Paroles Musicales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateAll}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isGenerating ? 'Génération en cours...' : 'Générer toutes les paroles'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadProgress}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>

          {isGenerating && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Génération en cours... Cela peut prendre plusieurs minutes pour traiter tous les items EDN.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Statistiques de progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression globale</span>
                <span className="font-semibold">{stats.itemsWithLyrics}/{stats.totalItems} items</span>
              </div>
              <Progress value={stats.progress} className="h-2" />
              <div className="text-right text-sm text-muted-foreground">
                {stats.progress}% complété
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.itemsWithLyrics}</div>
                <div className="text-sm text-muted-foreground">Avec paroles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalItems - stats.itemsWithLyrics}</div>
                <div className="text-sm text-muted-foreground">Restants</div>
              </div>
            </div>

            {stats.sampleWithoutLyrics.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Exemples d'items sans paroles:</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.sampleWithoutLyrics.map((item) => (
                    <Badge key={item.item_code} variant="outline" className="text-xs">
                      {item.item_code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Résultats de la dernière génération */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Résultats de la génération
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {lastResult.stats?.processed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Traités</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {lastResult.stats?.success || 0}
                </div>
                <div className="text-sm text-muted-foreground">Succès</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {lastResult.stats?.errors || 0}
                </div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-600">
                  {lastResult.stats?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};