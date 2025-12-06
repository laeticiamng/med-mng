import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Wifi,
  WifiOff,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useEnhancedAudioPlayer } from '@/hooks/useEnhancedAudioPlayer';

interface EnhancedMusicPlayerControlsProps {
  audioUrl?: string;
  title?: string;
  isGenerating?: boolean;
  generationProgress?: number;
  onRetry?: () => void;
  showDetailedMetrics?: boolean;
}

export const EnhancedMusicPlayerControls: React.FC<EnhancedMusicPlayerControlsProps> = ({
  audioUrl,
  title = 'Piste audio',
  isGenerating = false,
  generationProgress = 0,
  onRetry,
  showDetailedMetrics = false
}) => {
  const { toast } = useToast();
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isBuffering,
    bufferPercent,
    readyToPlay,
    streamingDelay,
    hasError,
    errorMessage,
    retryCount,
    play,
    pause,
    resume,
    retry: audioRetry,
    preloadAudio,
    changeVolume
  } = useEnhancedAudioPlayer();

  const [showStreamingInfo, setShowStreamingInfo] = useState(false);
  const [estimatedReadyTime, setEstimatedReadyTime] = useState<number | null>(null);

  // Préchargement automatique quand l'URL est disponible
  useEffect(() => {
    if (audioUrl && !isGenerating && readyToPlay === false) {
      console.log('🎵 Préchargement automatique de l\'audio');
      preloadAudio(audioUrl);
      
      // Estimer le temps de préparation
      const estimatedTime = 2000; // 2 secondes par défaut
      setEstimatedReadyTime(Date.now() + estimatedTime);
      
      const timer = setTimeout(() => {
        setEstimatedReadyTime(null);
      }, estimatedTime);
      
      return () => clearTimeout(timer);
    }
  }, [audioUrl, isGenerating, readyToPlay, preloadAudio]);

  // Affichage d'informations de streaming après 2 secondes
  useEffect(() => {
    if (isBuffering && audioUrl) {
      const timer = setTimeout(() => {
        setShowStreamingInfo(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowStreamingInfo(false);
    }
  }, [isBuffering, audioUrl]);

  const handlePlayPause = async () => {
    if (!audioUrl) {
      toast({
        title: "Aucune piste disponible",
        description: "Veuillez d'abord générer une piste audio",
        variant: "destructive"
      });
      return;
    }

    if (hasError) {
      audioRetry();
      return;
    }

    if (isPlaying) {
      pause();
    } else if (currentTime > 0) {
      resume();
    } else {
      await play(audioUrl);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      audioRetry();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayButtonContent = () => {
    if (hasError) {
      return (
        <>
          <RotateCcw className="h-4 w-4" />
          Réessayer {retryCount > 0 && `(${retryCount})`}
        </>
      );
    }

    if (isGenerating) {
      return (
        <>
          <Clock className="h-4 w-4 animate-pulse" />
          Génération...
        </>
      );
    }

    if (isBuffering) {
      return (
        <>
          <WifiOff className="h-4 w-4 animate-pulse" />
          Préparation...
        </>
      );
    }

    if (!readyToPlay && audioUrl && !isGenerating) {
      return (
        <>
          <Wifi className="h-4 w-4 animate-pulse" />
          Chargement...
        </>
      );
    }

    return (
      <>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {isPlaying ? 'Pause' : 'Lecture'}
      </>
    );
  };

  const getStreamingMessage = () => {
    if (isGenerating) {
      return `Génération en cours... ${generationProgress}%`;
    }

    if (estimatedReadyTime && !readyToPlay) {
      const remaining = Math.max(0, estimatedReadyTime - Date.now());
      const seconds = Math.ceil(remaining / 1000);
      return `Votre piste est prête, lecture dans ${seconds}s...`;
    }

    if (isBuffering) {
      return `Mise en mémoire tampon... ${bufferPercent}%`;
    }

    if (streamingDelay && streamingDelay > 1000) {
      return `Délai de streaming: ${Math.round(streamingDelay)}ms`;
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Contrôles principaux */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handlePlayPause}
          disabled={isGenerating && generationProgress < 100}
          variant={hasError ? "destructive" : "default"}
          className="gap-2 min-w-[120px]"
        >
          {getPlayButtonContent()}
        </Button>

        {/* Contrôle du volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => changeVolume(parseInt(e.target.value) / 100)}
            className="w-20"
          />
        </div>

        {/* Bouton retry si erreur */}
        {hasError && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Nouvelle génération
          </Button>
        )}
      </div>

      {/* Barre de progression générale */}
      <div className="space-y-2">
        {isGenerating ? (
          <>
            <div className="flex justify-between text-sm">
              <span>Génération de "{title}"</span>
              <span>{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="h-2" />
          </>
        ) : audioUrl && duration > 0 ? (
          <>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>"{title}"</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Progress value={(currentTime / duration) * 100} className="h-2" />
          </>
        ) : null}
      </div>

      {/* Barre de buffer */}
      {audioUrl && !isGenerating && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Buffer</span>
            <span>{bufferPercent}%</span>
          </div>
          <Progress 
            value={bufferPercent} 
            className="h-1"
          />
        </div>
      )}

      {/* Messages d'état */}
      {getStreamingMessage() && (
        <Alert className="border-primary/20 bg-primary/5">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">{getStreamingMessage()}</span>
              {showStreamingInfo && (
                <span className="text-xs text-muted-foreground">
                  Objectif: &lt;3s
                </span>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte d'erreur */}
      {hasError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Erreur de lecture audio</p>
              <p className="text-sm">{errorMessage}</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={audioRetry}
                  disabled={retryCount >= 3}
                >
                  Réessayer la lecture
                </Button>
                {onRetry && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleRetry}
                  >
                    Régénérer la piste
                  </Button>
                )}
              </div>
              {retryCount >= 3 && (
                <p className="text-xs text-muted-foreground">
                  Nombre maximum de tentatives atteint
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Métriques détaillées (développement) */}
      {showDetailedMetrics && streamingDelay && (
        <Alert className="border-muted bg-muted/50">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="text-xs space-y-1">
              <p>📊 Métriques de streaming:</p>
              <p>• Délai total: {Math.round(streamingDelay)}ms</p>
              <p>• Buffer: {bufferPercent}%</p>
              <p>• Statut: {streamingDelay < 3000 ? '✅ Acceptable' : '⚠️ Lent'}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};