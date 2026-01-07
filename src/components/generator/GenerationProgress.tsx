import React, { useMemo, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Music, Loader2, X, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';

interface GenerationProgressProps {
  progress: number;
  isGenerating: boolean;
  message?: string;
  onCancel?: () => void;
  startTime?: number;
}

// Phases de génération avec durées estimées
const GENERATION_PHASES = [
  { threshold: 0, label: "🎵 Démarrage...", icon: "🚀", duration: "~10s" },
  { threshold: 10, label: "🎼 Analyse des paroles", icon: "📝", duration: "~20s" },
  { threshold: 25, label: "🎹 Composition musicale", icon: "🎹", duration: "~45s" },
  { threshold: 50, label: "🎸 Arrangement instrumental", icon: "🎸", duration: "~30s" },
  { threshold: 70, label: "🎧 Mixage audio", icon: "🎛️", duration: "~20s" },
  { threshold: 85, label: "🎤 Rendu vocal", icon: "🎤", duration: "~15s" },
  { threshold: 95, label: "✨ Finalisation", icon: "✨", duration: "~10s" }
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  isGenerating,
  message = "Génération en cours...",
  onCancel,
  startTime
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Mettre à jour le temps écoulé chaque seconde
  useEffect(() => {
    if (!isGenerating || !startTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating, startTime]);

  if (!isGenerating) return null;

  // Trouver la phase actuelle
  const currentPhase = useMemo(() => {
    for (let i = GENERATION_PHASES.length - 1; i >= 0; i--) {
      if (progress >= GENERATION_PHASES[i].threshold) {
        return GENERATION_PHASES[i];
      }
    }
    return GENERATION_PHASES[0];
  }, [progress]);

  // Calcul temps restant estimé
  const estimatedTimeRemaining = useMemo(() => {
    if (!startTime || progress <= 0) return null;
    
    if (progress >= 95) return "< 10s";
    
    // Estimation basée sur le temps écoulé et le progress
    const totalEstimatedSec = (elapsedSeconds / progress) * 100;
    const remainingSec = Math.max(0, Math.floor(totalEstimatedSec - elapsedSeconds));
    
    if (remainingSec < 60) return `~${remainingSec}s`;
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return `~${mins}m ${secs}s`;
  }, [startTime, progress, elapsedSeconds]);

  // Formatage du temps écoulé
  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Détection des seuils de timeout
  const isWarningTimeout = elapsedSeconds > 120 && progress < 90;
  const isCriticalTimeout = elapsedSeconds > 240 && progress < 95;

  return (
    <PremiumCard variant="gradient" className={`p-6 mb-6 ${isCriticalTimeout ? 'border-destructive/50' : isWarningTimeout ? 'border-warning/50' : ''}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isCriticalTimeout 
            ? 'bg-gradient-to-br from-destructive/20 to-destructive/10' 
            : 'bg-gradient-to-br from-primary to-primary/60'
        }`}>
          {isCriticalTimeout ? (
            <AlertCircle className="h-6 w-6 text-destructive" />
          ) : progress >= 95 ? (
            <CheckCircle2 className="h-6 w-6 text-primary-foreground animate-pulse" />
          ) : (
            <Music className="h-6 w-6 text-primary-foreground animate-bounce" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {currentPhase.label}
            <Badge variant="outline" className="text-xs ml-2">
              {currentPhase.duration}
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {message} • {Math.round(progress)}%
            {estimatedTimeRemaining && (
              <span className="flex items-center gap-1 text-primary">
                <Clock className="h-3 w-3" />
                {estimatedTimeRemaining}
              </span>
            )}
          </p>
        </div>
        
        {/* Bouton annuler */}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Annuler la génération"
          >
            <X className="h-4 w-4 mr-1" />
            <TranslatedText text="Annuler" />
          </Button>
        )}
      </div>
      
      <Progress value={progress} className={`h-3 ${isCriticalTimeout ? '[&>div]:bg-destructive' : isWarningTimeout ? '[&>div]:bg-warning' : ''}`} />
      
      {/* Indicateurs de phases visuels */}
      <div className="flex items-center justify-between mt-2 mb-3">
        {GENERATION_PHASES.filter((_, i) => i % 2 === 0).map((phase, idx) => (
          <div 
            key={idx} 
            className={`text-xs ${progress >= phase.threshold ? 'text-primary font-medium' : 'text-muted-foreground'}`}
          >
            {phase.icon}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Écoulé: {formatElapsed(elapsedSeconds)}</span>
          {progress >= 95 && (
            <span className="ml-2 text-success font-medium animate-pulse">
              ✨ Presque terminé !
            </span>
          )}
        </p>
        <p className="text-xs text-warning">
          ⚠️ <TranslatedText text="Ne fermez pas cette page" />
        </p>
      </div>
      
      {/* Message d'avertissement timeout - après 2 minutes */}
      {isWarningTimeout && !isCriticalTimeout && (
        <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-xs text-warning font-medium">
            ⚠️ La génération prend plus de temps que prévu ({Math.floor(elapsedSeconds / 60)}+ min).
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vous pouvez annuler et réessayer ou patienter encore un peu.
          </p>
        </div>
      )}
      
      {/* Message d'erreur timeout critique - après 4 minutes */}
      {isCriticalTimeout && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-xs text-destructive font-medium">
            ❌ Délai critique dépassé ({Math.floor(elapsedSeconds / 60)} min). Il est recommandé d'annuler et de réessayer.
          </p>
        </div>
      )}
    </PremiumCard>
  );
};
