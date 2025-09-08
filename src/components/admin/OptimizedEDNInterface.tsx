import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';import { Input } from '@/components/ui/input';
import { 
  Search, Play, Pause, Music, BookOpen, 
  Target, CheckCircle, AlertTriangle, Filter,
  RefreshCw, Volume2
} from 'lucide-react';
import { useOptimizedEdnItems } from '@/hooks/useOptimizedEdnItems';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export const OptimizedEDNInterface = () => {
  const {
    items,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
    search,
    searchQuery
  } = useOptimizedEdnItems();
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    search(query);
    logger.info('ui', 'Recherche EDN optimisée', {
      component: 'OptimizedEDNInterface',
      action: 'search',
      metadata: { query, totalItems: totalCount }
    });
  };

  const playLyrics = (itemCode: string, lyrics: string[]) => {
    if (currentlyPlaying === itemCode) {
      // Arrêter la lecture
      const audio = audioElements.get(itemCode);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentlyPlaying(null);
      return;
    }

    // Créer une synthèse vocale des paroles (pour la démo)
    if ('speechSynthesis' in window) {
      // Arrêter toute synthèse en cours
      speechSynthesis.cancel();
      
      const lyricsText = lyrics
        .filter(line => !line.startsWith('[') && line.trim() !== '')
        .join('. ')
        .substring(0, 300); // Limiter pour la démo

      const utterance = new SpeechSynthesisUtterance(lyricsText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setCurrentlyPlaying(itemCode);
      utterance.onend = () => setCurrentlyPlaying(null);
      utterance.onerror = () => {
        setCurrentlyPlaying(null);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire les paroles",
          variant: "destructive"
        });
      };

      speechSynthesis.speak(utterance);

      logger.info('ui', 'Lecture paroles démarrée', {
        component: 'OptimizedEDNInterface',
        action: 'playLyrics',
        metadata: { itemCode, lyricsLength: lyrics.length }
      });
    }
  };

  const getQualityIndicator = (item: any) => {
    const hasGoodLyrics = item.paroles_musicales && 
                         Array.isArray(item.paroles_musicales) && 
                         item.paroles_musicales.length > 5 &&
                         item.paroles_musicales.some((line: string) => line.includes('[Couplet') || line.includes('[Refrain'));
    
    const hasCompetences = (item.competences_count_total || 0) > 0;
    const goodCompleteness = (item.completeness_score || 0) > 80;

    if (hasGoodLyrics && hasCompetences && goodCompleteness) {
      return <CheckCircle className="h-4 w-4 text-primary" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-secondary" />;
    }
  };

  const formatLyrics = (lyrics: string[]) => {
    if (!lyrics || lyrics.length === 0) return "Aucune parole disponible";
    
    return lyrics
      .filter(line => !line.startsWith('[') && line.trim() !== '')
      .slice(0, 3)
      .join(' • ') + (lyrics.length > 5 ? '...' : '');
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Chargement optimisé des items EDN...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h3 className="font-medium mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche optimisée */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Interface EDN Optimisée</CardTitle>
              <p className="text-muted-foreground">
                {totalCount} items • Pagination intelligente • Qualité optimisée
              </p>
            </div>
            <Badge variant="outline" className="text-primary">
              {items.length} chargés
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou code item..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des items optimisée */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{item.item_code}</Badge>
                    {getQualityIndicator(item)}
                    <h4 className="font-medium truncate text-foreground">
                      {item.title}
                    </h4>
                  </div>
                  
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.subtitle}
                    </p>
                  )}

                  {/* Aperçu des paroles optimisées */}
                  <div className="text-sm text-muted-foreground">
                    <Music className="h-3 w-3 inline mr-1" />
                    {formatLyrics(item.paroles_musicales || [])}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Indicateurs de qualité */}
                  <div className="text-xs text-center">
                    <div className="font-medium">{item.completeness_score || 0}%</div>
                    <div className="text-muted-foreground">Qualité</div>
                  </div>
                  
                  {/* Stats compétences */}
                  <div className="text-xs text-center">
                    <div className="font-medium">{item.competences_count_total || 0}</div>
                    <div className="text-muted-foreground">Compét.</div>
                  </div>

                  {/* Bouton lecture */}
                  {item.paroles_musicales && item.paroles_musicales.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playLyrics(item.item_code, item.paroles_musicales)}
                      className="ml-2"
                    >
                      {currentlyPlaying === item.item_code ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chargement progressif */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Charger plus d'items
              </>
            )}
          </Button>
        </div>
      )}

      {/* Statistiques en bas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {items.length} items affichés sur {totalCount} au total
            </span>
            <span>
              Pagination côté serveur • Performance optimisée
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};