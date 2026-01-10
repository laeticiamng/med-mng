import React, { useMemo, useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Music, Loader2, X, Clock, AlertCircle, CheckCircle2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GenerationProgressProps {
  progress: number;
  isGenerating: boolean;
  message?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  startTime?: number;
  taskId?: string;
  rang?: 'A' | 'B' | 'AB';
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
  onRetry,
  startTime,
  taskId,
  rang
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Surveiller l'état réseau
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Return early APRÈS tous les hooks
  if (!isGenerating) return null;

  // Détection des seuils de timeout (alignés avec ABSOLUTE_TIMEOUT de 5 min)
  const isWarningTimeout = elapsedSeconds > 180 && progress < 80; // 3 min warning
  const isCriticalTimeout = elapsedSeconds > 300 && progress < 95; // 5 min critical

  return (
    <PremiumCard 
      variant="gradient" 
      className={`p-3 sm:p-6 mb-4 sm:mb-6 ${isCriticalTimeout ? 'border-destructive/50' : isWarningTimeout ? 'border-warning/50' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Génération en cours: ${Math.round(progress)}%`}
    >
      {/* Header - responsive layout */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
          isCriticalTimeout 
            ? 'bg-gradient-to-br from-destructive/20 to-destructive/10' 
            : 'bg-gradient-to-br from-primary to-primary/60'
        }`}>
          {isCriticalTimeout ? (
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
          ) : progress >= 95 ? (
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground animate-pulse" />
          ) : (
            <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground animate-bounce" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" aria-hidden="true" />
            <span className="truncate">{currentPhase.label}</span>
            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
              {currentPhase.duration}
            </Badge>
            {rang && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                Rang {rang}
              </Badge>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
            <span className="truncate">{message}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
            {estimatedTimeRemaining && (
              <span className="flex items-center gap-1 text-primary shrink-0">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {estimatedTimeRemaining}
              </span>
            )}
          </p>
        </div>
        
        {/* Actions - mobile: stack vertically */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Indicateur réseau */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`p-1.5 sm:p-2 rounded-full ${isOnline ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" aria-label="Connecté" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" aria-label="Hors ligne" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isOnline ? 'Connexion active' : 'Hors ligne - La génération reprendra automatiquement'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Bouton annuler */}
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 sm:px-3 text-xs sm:text-sm"
              aria-label="Annuler la génération"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
              <span className="hidden sm:inline"><TranslatedText text="Annuler" /></span>
            </Button>
          )}
        </div>
      </div>
      
      <Progress 
        value={progress} 
        className={`h-2 sm:h-3 ${isCriticalTimeout ? '[&>div]:bg-destructive' : isWarningTimeout ? '[&>div]:bg-warning' : ''}`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      
      {/* Indicateurs de phases visuels - hidden on small mobile */}
      <div className="hidden xs:flex items-center justify-between mt-2 mb-2 sm:mb-3" aria-hidden="true">
        {GENERATION_PHASES.filter((_, i) => i % 2 === 0).map((phase, idx) => (
          <div 
            key={idx} 
            className={`text-xs transition-all duration-300 ${progress >= phase.threshold ? 'text-primary font-medium scale-110' : 'text-muted-foreground'}`}
          >
            {phase.icon}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 xs:gap-2 mt-2">
        <p className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-1 sm:gap-2">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Écoulé: {formatElapsed(elapsedSeconds)}</span>
          {taskId && (
            <span className="text-muted-foreground/50 font-mono text-[10px] hidden sm:inline">
              ID: {taskId.substring(0, 8)}...
            </span>
          )}
          {progress >= 95 && (
            <span className="text-success font-medium animate-pulse">
              ✨ Presque terminé !
            </span>
          )}
        </p>
        <p className="text-[10px] sm:text-xs text-warning shrink-0">
          ⚠️ <span className="hidden sm:inline"><TranslatedText text="Ne fermez pas cette page" /></span>
          <span className="sm:hidden">Ne pas fermer</span>
        </p>
      </div>
      
      {/* Message d'avertissement timeout - après 3 minutes */}
      {isWarningTimeout && !isCriticalTimeout && (
        <div className="mt-2 sm:mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg" role="alert">
          <p className="text-[10px] sm:text-xs text-warning font-medium">
            ⚠️ Génération longue ({Math.floor(elapsedSeconds / 60)}+ min) - API occupée
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
            La génération peut prendre jusqu'à 5 minutes. Patientez ou annulez pour réessayer.
          </p>
        </div>
      )}
      
      {/* Message d'erreur timeout critique - après 5 minutes */}
      {isCriticalTimeout && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg" role="alert">
          <p className="text-xs text-destructive font-medium">
            ❌ Délai critique dépassé ({Math.floor(elapsedSeconds / 60)} min). La génération a échoué.
          </p>
          <div className="flex items-center gap-2 mt-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
                Réessayer
              </Button>
            )}
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-7 text-xs text-destructive"
              >
                <X className="h-3 w-3 mr-1" aria-hidden="true" />
                Annuler
              </Button>
            )}
          </div>
        </div>
      )}
    </PremiumCard>
  );
};
