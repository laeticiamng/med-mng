import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useSecureStreaming } from '@/hooks/useSecureStreaming';
import { toast } from 'sonner';

interface SecureAudioPlayerProps {
  songId: string;
  title: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
  songId,
  title,
  onPlayStart,
  onPlayEnd,
  className = ''
}) => {
  const {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    volume,
    createSecureStream,
    play,
    pause,
    setVolume,
    seek,
    cleanup
  } = useSecureStreaming();

  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  // Initialiser le stream sécurisé
  const handleInitializeStream = async () => {
    try {
      const streamUrl = await createSecureStream(songId);
      if (streamUrl) {
        setIsInitialized(true);
        setSessionExpiry(Date.now() + 30 * 60 * 1000); // 30 minutes
        toast.success('Streaming sécurisé initialisé', {
          description: 'Votre session d\'écoute est prête'
        });
      }
    } catch (error) {
      console.error('Erreur initialisation stream:', error);
      toast.error('Erreur d\'initialisation du streaming sécurisé');
    }
  };

  // Gérer lecture/pause
  const handlePlayPause = async () => {
    if (!isInitialized) {
      await handleInitializeStream();
      return;
    }

    if (isPlaying) {
      pause();
      onPlayEnd?.();
    } else {
      play();
      onPlayStart?.();
    }
  };

  // Formater le temps
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculer le temps restant de session
  const getSessionTimeRemaining = (): string => {
    if (!sessionExpiry) return '';
    const remaining = Math.max(0, sessionExpiry - Date.now());
    const minutes = Math.floor(remaining / (60 * 1000));
    return `${minutes}min restantes`;
  };

  // Nettoyage à l'unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Mise à jour du timer de session
  useEffect(() => {
    if (!sessionExpiry) return;

    const interval = setInterval(() => {
      const remaining = sessionExpiry - Date.now();
      if (remaining <= 0) {
        setIsInitialized(false);
        setSessionExpiry(null);
        cleanup();
        toast.warning('Session d\'écoute expirée');
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [sessionExpiry, cleanup]);

  return (
    <div className={`bg-card border rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header avec sécurité */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Streaming sécurisé
          </Badge>
          
          {sessionExpiry && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {getSessionTimeRemaining()}
            </Badge>
          )}
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Progress bar */}
        <div className="flex-1 space-y-1">
          {isInitialized && duration > 0 && (
            <>
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={([value]) => seek(value)}
                className="flex-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        {/* Contrôle volume */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={([value]) => setVolume(value)}
            className="w-20"
          />
        </div>
      </div>

      {/* Informations de sécurité */}
      {!isInitialized && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="h-3 w-3" />
            <span className="font-medium">Streaming sécurisé</span>
          </div>
          <p>Cliquez sur lecture pour créer une session d'écoute sécurisée (30min).</p>
          <p>Aucun téléchargement possible - Écoute uniquement en streaming.</p>
        </div>
      )}

      {/* Avertissement de sécurité */}
      <div className="text-xs text-muted-foreground border-l-2 border-green-500 pl-2">
        🔒 Audio protégé par streaming sécurisé - Téléchargement impossible
      </div>
    </div>
  );
};