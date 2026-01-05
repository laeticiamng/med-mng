import React, { useEffect } from 'react';
import { AlertTriangle, Music, CheckCircle2, XCircle } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { Badge } from '@/components/ui/badge';

interface LyricsStatusDisplayProps {
  selectedItem: string;
  lyricsLoading: boolean;
  lyricsError: string | null;
  ednLyrics: any;
  selectedRang?: string;
}

export const LyricsStatusDisplay: React.FC<LyricsStatusDisplayProps> = ({
  selectedItem,
  lyricsLoading,
  lyricsError,
  ednLyrics,
  selectedRang
}) => {
  const { logActivity } = useActivityTracking();

  // Track lyrics found
  useEffect(() => {
    if (ednLyrics && selectedItem) {
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { type: 'lyrics_found', itemCode: selectedItem }
      });
    }
  }, [ednLyrics, selectedItem, logActivity]);

  if (!selectedItem) return null;

  // Vérifier disponibilité par rang
  const hasRangA = ednLyrics?.paroles_rang_a && ednLyrics.paroles_rang_a.length > 0;
  const hasRangB = ednLyrics?.paroles_rang_b && ednLyrics.paroles_rang_b.length > 0;
  const hasRangAB = ednLyrics?.paroles_rang_ab && ednLyrics.paroles_rang_ab.length > 0;
  const hasLegacy = ednLyrics?.paroles_musicales && ednLyrics.paroles_musicales.length > 0;

  // Obtenir les paroles pour le rang sélectionné
  const getSelectedLyrics = () => {
    if (!ednLyrics || !selectedRang) return null;
    switch (selectedRang) {
      case 'A': return hasRangA ? ednLyrics.paroles_rang_a : null;
      case 'B': return hasRangB ? ednLyrics.paroles_rang_b : null;
      case 'AB': return hasRangAB ? ednLyrics.paroles_rang_ab : null;
      default: return null;
    }
  };

  const selectedLyrics = getSelectedLyrics();

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-foreground">
        <TranslatedText text="Paroles de l'item" />
      </label>
      
      {lyricsLoading && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span>Chargement des paroles...</span>
          </div>
        </div>
      )}
      
      {lyricsError && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur: {lyricsError}</span>
          </div>
        </div>
      )}
      
      {ednLyrics && (
        <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-success">
            <Music className="h-5 w-5" />
            <span className="font-semibold">Paroles trouvées pour {ednLyrics.title}</span>
          </div>
          
          {/* Badges de disponibilité par rang */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={hasRangA ? "default" : "secondary"} className={hasRangA ? "bg-primary" : "opacity-50"}>
              {hasRangA ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              Rang A ({ednLyrics.paroles_rang_a?.length || 0} lignes)
            </Badge>
            <Badge variant={hasRangB ? "default" : "secondary"} className={hasRangB ? "bg-accent" : "opacity-50"}>
              {hasRangB ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              Rang B ({ednLyrics.paroles_rang_b?.length || 0} lignes)
            </Badge>
            <Badge variant={hasRangAB ? "default" : "secondary"} className={hasRangAB ? "bg-warning text-warning-foreground" : "opacity-50"}>
              {hasRangAB ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
              Rang A+B ({ednLyrics.paroles_rang_ab?.length || 0} lignes)
            </Badge>
          </div>

          {/* Preview complet des paroles pour le rang sélectionné */}
          {selectedRang && selectedLyrics && (
            <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/30 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background/80 py-1">
                📝 Paroles Rang {selectedRang} ({selectedLyrics.length} lignes):
              </p>
              <div className="text-sm text-foreground/80 space-y-1">
                {selectedLyrics.slice(0, 12).map((line: string, idx: number) => (
                  <p key={idx} className={line.startsWith('[') ? 'font-semibold text-primary not-italic' : 'italic'}>
                    {line}
                  </p>
                ))}
                {selectedLyrics.length > 12 && (
                  <p className="text-muted-foreground text-xs">
                    ... et {selectedLyrics.length - 12} lignes de plus
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fallback si le rang sélectionné n'a pas de paroles spécifiques */}
          {selectedRang && !selectedLyrics && hasLegacy && (
            <div className="mt-2 text-sm text-warning">
              ⚠️ Paroles spécifiques au rang {selectedRang} non disponibles, utilisation des paroles génériques.
            </div>
          )}
        </div>
      )}
    </div>
  );
};