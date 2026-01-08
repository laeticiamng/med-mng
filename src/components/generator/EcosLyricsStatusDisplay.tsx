import React, { useState, useCallback } from 'react';
import { Music, CheckCircle2, Loader2, AlertTriangle, Stethoscope, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLyrics = useCallback(async () => {
    if (!ecosLyrics?.paroles) return;
    try {
      await navigator.clipboard.writeText(ecosLyrics.paroles.join('\n'));
      setCopied(true);
      toast.success('Paroles copiées !');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie paroles:', err);
      toast.error('Erreur lors de la copie');
    }
  }, [ecosLyrics]);

  if (!selectedSituation) return null;

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'facile': return 'bg-success text-success-foreground';
      case 'moyen': return 'bg-warning text-warning-foreground';
      case 'difficile': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <label className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
        <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
        <TranslatedText text="Paroles ECOS" />
      </label>
      
      {loading && (
        <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 text-primary text-sm sm:text-base">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Génération des paroles...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 sm:p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive text-sm sm:text-base">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="truncate">Erreur: {error}</span>
          </div>
        </div>
      )}
      
      {ecosLyrics && (
        <div className="p-3 sm:p-4 bg-success/5 border border-success/20 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">
              {ecosLyrics.scenario.scenario_code} - {ecosLyrics.scenario.title}
            </span>
          </div>
          
          {/* Infos du scénario */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="outline" className="text-xs">
              {ecosLyrics.scenario.speciality}
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(ecosLyrics.scenario.difficulty_level)}`}>
              {ecosLyrics.scenario.difficulty_level}
            </Badge>
            <Badge variant="default" className="text-xs bg-primary">
              <Music className="h-3 w-3 mr-1" />
              {ecosLyrics.paroles.filter(l => l.trim()).length} lignes
            </Badge>
          </div>

          {/* Preview des paroles avec expand/collapse */}
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-background/50 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-xs font-medium text-muted-foreground truncate">
                📝 Paroles générées
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleCopyLyrics}
                  title="Copier"
                >
                  {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  <span className="text-xs ml-1 hidden sm:inline">{isExpanded ? 'Réduire' : 'Voir tout'}</span>
                </Button>
              </div>
            </div>
            <div className={`text-xs sm:text-sm text-foreground/80 space-y-1 ${isExpanded ? 'max-h-[300px]' : 'max-h-24 sm:max-h-32'} overflow-y-auto transition-all`}>
              {(isExpanded ? ecosLyrics.paroles : ecosLyrics.paroles.slice(0, 6)).map((line, idx) => (
                <p 
                  key={idx} 
                  className={
                    line.startsWith('[') 
                      ? 'font-semibold text-primary not-italic mt-2' 
                      : line.trim() === '' 
                        ? 'h-1' 
                        : 'italic'
                  }
                >
                  {line}
                </p>
              ))}
              {!isExpanded && ecosLyrics.paroles.length > 6 && (
                <p 
                  className="text-muted-foreground text-xs cursor-pointer hover:text-primary mt-1" 
                  onClick={() => setIsExpanded(true)}
                >
                  ... +{ecosLyrics.paroles.length - 6} lignes
                </p>
              )}
            </div>
          </div>
          
          {/* Cas clinique source - compact */}
          {ecosLyrics.scenario.clinical_case && (
            <div className="p-2 bg-muted/30 rounded-lg border border-border/20">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium">📋 Cas:</span> {ecosLyrics.scenario.clinical_case}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
