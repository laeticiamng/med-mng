
import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Music, Loader2, X, Clock } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';

interface GenerationProgressProps {
  progress: number;
  isGenerating: boolean;
  message?: string;
  onCancel?: () => void;
  startTime?: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  isGenerating,
  message = "Génération en cours...",
  onCancel,
  startTime
}) => {
  if (!isGenerating) return null;

  const getStatusMessage = () => {
    if (progress < 10) return "🎵 Démarrage de la génération...";
    if (progress < 30) return "🎼 Analyse des paroles...";
    if (progress < 50) return "🎹 Composition musicale...";
    if (progress < 70) return "🎸 Arrangement instrumental...";
    if (progress < 90) return "🎧 Mixage final...";
    return "✨ Finalisation...";
  };

  // Calcul temps restant estimé
  const estimatedTimeRemaining = useMemo(() => {
    if (!startTime || progress <= 0) return null;
    const elapsedMs = Date.now() - startTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    
    if (progress >= 95) return "< 10s";
    
    // Estimation basée sur le temps écoulé et le progress
    const totalEstimatedSec = (elapsedSec / progress) * 100;
    const remainingSec = Math.max(0, Math.floor(totalEstimatedSec - elapsedSec));
    
    if (remainingSec < 60) return `~${remainingSec}s`;
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    return `~${mins}m ${secs}s`;
  }, [startTime, progress]);

  return (
    <PremiumCard variant="gradient" className="p-6 mb-6 animate-pulse-slow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
          <Music className="h-6 w-6 text-primary-foreground animate-bounce" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {getStatusMessage()}
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
      
      <Progress value={progress} className="h-3" />
      
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          ⏱️ <TranslatedText text="Durée estimée: 2-3 minutes" />
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
      
      {/* Message d'erreur timeout */}
      {progress >= 90 && estimatedTimeRemaining && estimatedTimeRemaining.includes('m') && parseInt(estimatedTimeRemaining) > 3 && (
        <p className="text-xs text-warning mt-2 animate-pulse">
          ⚠️ La génération prend plus de temps que prévu. Vous pouvez annuler et réessayer.
        </p>
      )}
    </PremiumCard>
  );
};
