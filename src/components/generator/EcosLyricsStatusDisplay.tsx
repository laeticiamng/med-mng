import React from 'react';
import { Music, CheckCircle2, Loader2, AlertTriangle, Stethoscope } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';

interface EcosLyricsStatusDisplayProps {
  selectedSituation: string;
  ecosLyrics: {
    scenario: {
      scenario_code: string;
      title: string;
      speciality: string;
      clinical_case: string;
      difficulty_level: string;
    };
    paroles: string[];
    isGenerated: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}

export const EcosLyricsStatusDisplay: React.FC<EcosLyricsStatusDisplayProps> = ({
  selectedSituation,
  ecosLyrics,
  loading,
  error
}) => {
  if (!selectedSituation) return null;

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-primary" />
        <TranslatedText text="Paroles du scénario ECOS" />
      </label>
      
      {loading && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Génération des paroles en cours...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Erreur: {error}</span>
          </div>
        </div>
      )}
      
      {ecosLyrics && (
        <div className="p-4 bg-success/5 border border-success/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">
              Paroles générées pour {ecosLyrics.scenario.scenario_code}
            </span>
          </div>
          
          {/* Infos du scénario */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {ecosLyrics.scenario.speciality}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {ecosLyrics.scenario.difficulty_level}
            </Badge>
            <Badge variant="default" className="text-xs bg-primary">
              <Music className="h-3 w-3 mr-1" />
              {ecosLyrics.paroles.filter(l => l.trim()).length} lignes
            </Badge>
          </div>

          {/* Preview complet des paroles avec scroll */}
          <div className="mt-3 p-3 bg-background/50 rounded-lg border border-border/30 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background/80 py-1">
              📝 Paroles générées ({ecosLyrics.paroles.filter(l => l.trim()).length} lignes) :
            </p>
            <div className="text-sm text-foreground/80 space-y-1">
              {ecosLyrics.paroles.slice(0, 16).map((line, idx) => (
                <p 
                  key={idx} 
                  className={
                    line.startsWith('[') 
                      ? 'font-semibold text-primary not-italic mt-2' 
                      : line.trim() === '' 
                        ? 'h-2' 
                        : 'italic'
                  }
                >
                  {line}
                </p>
              ))}
              {ecosLyrics.paroles.length > 16 && (
                <p className="text-muted-foreground text-xs mt-2 font-medium">
                  ... et {ecosLyrics.paroles.length - 16} lignes supplémentaires
                </p>
              )}
            </div>
          </div>
          
          {/* Cas clinique source */}
          {ecosLyrics.scenario.clinical_case && (
            <div className="mt-2 p-2 bg-muted/30 rounded-lg border border-border/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">📋 Cas source:</span> {ecosLyrics.scenario.clinical_case}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
