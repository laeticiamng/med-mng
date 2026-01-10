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
      className={`p-6 mb-6 ${isCriticalTimeout ? 'border-destructive/50' : isWarningTimeout ? 'border-warning/50' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`Génération en cours: ${Math.round(progress)}%`}
    >
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
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {currentPhase.label}
            <Badge variant="outline" className="text-xs ml-2">
              {currentPhase.duration}
            </Badge>
            {rang && (
              <Badge variant="secondary" className="text-xs">
                Rang {rang}
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {message} • {Math.round(progress)}%
            {estimatedTimeRemaining && (
              <span className="flex items-center gap-1 text-primary">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {estimatedTimeRemaining}
              </span>
            )}
          </p>
        </div>
        
        {/* ✅ Indicateur réseau */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`p-2 rounded-full ${isOnline ? 'bg-success/10' : 'bg-destructive/10'}`}>
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-success" aria-label="Connecté" />
                ) : (
                  <WifiOff className="h-4 w-4 text-destructive" aria-label="Hors ligne" />
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
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Annuler la génération"
          >
            <X className="h-4 w-4 mr-1" aria-hidden="true" />
            <TranslatedText text="Annuler" />
          </Button>
        )}
      </div>
      
      <Progress 
        value={progress} 
        className={`h-3 ${isCriticalTimeout ? '[&>div]:bg-destructive' : isWarningTimeout ? '[&>div]:bg-warning' : ''}`}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      
      {/* Indicateurs de phases visuels */}
      <div className="flex items-center justify-between mt-2 mb-3" aria-hidden="true">
        {GENERATION_PHASES.filter((_, i) => i % 2 === 0).map((phase, idx) => (
          <div 
            key={idx} 
            className={`text-xs transition-all duration-300 ${progress >= phase.threshold ? 'text-primary font-medium scale-110' : 'text-muted-foreground'}`}
          >
            {phase.icon}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>Écoulé: {formatElapsed(elapsedSeconds)}</span>
          {taskId && (
            <span className="text-muted-foreground/50 font-mono text-[10px]">
              ID: {taskId.substring(0, 8)}...
            </span>
          )}
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
      
      {/* Message d'avertissement timeout - après 3 minutes */}
      {isWarningTimeout && !isCriticalTimeout && (
        <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-lg" role="alert">
          <p className="text-xs text-warning font-medium">
            ⚠️ La génération prend plus de temps que prévu ({Math.floor(elapsedSeconds / 60)}+ min). L'API Suno peut être occupée.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
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
