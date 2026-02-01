// Composant Player Audio Unifié
// Remplace AudioPlayer (edn), AudioPlayer (music), MusicPlayer, etc.
// API flexible et composable

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { 
  HardDrive, 
  Loader2, 
  Pause, 
  Play, 
  SkipBack, 
  SkipForward, 
  Square, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import React from 'react';
import { useUnifiedAudio, type AudioTrack, type UseUnifiedAudioOptions } from '@/hooks/audio/useUnifiedAudio';

// ============================================
// Types
// ============================================

export interface UnifiedAudioPlayerProps {
  /** Track à jouer (ou passer audioUrl + title) */
  track?: AudioTrack;
  /** URL audio directe (alternative à track) */
  audioUrl?: string;
  /** Titre affiché */
  title?: string;
  /** Classes CSS */
  className?: string;
  /** Variante de style */
  variant?: 'default' | 'compact' | 'minimal' | 'card';
  /** Afficher le bouton stop */
  showStop?: boolean;
  /** Afficher les boutons skip */
  showSkip?: boolean;
  /** Afficher le contrôle de vitesse */
  showPlaybackRate?: boolean;
  /** Afficher le bouton cache offline */
  showOfflineCache?: boolean;
  /** Afficher les badges gamification */
  showGamification?: boolean;
  /** Couleur thème */
  themeColor?: 'primary' | 'warning' | 'success' | 'accent';
  /** Callbacks */
  onEnded?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
  /** Options du hook audio */
  audioOptions?: UseUnifiedAudioOptions;
}

// ============================================
// Composant Principal
// ============================================

export const UnifiedAudioPlayer: React.FC<UnifiedAudioPlayerProps> = ({
  track,
  audioUrl,
  title,
  className,
  variant = 'default',
  showStop = true,
  showSkip = true,
  showPlaybackRate = false,
  showOfflineCache = true,
  showGamification = false,
  themeColor = 'primary',
  onEnded,
  onNext,
  onPrevious,
  onClose,
  audioOptions
}) => {
  // Construire le track si audioUrl fourni directement
  const resolvedTrack: AudioTrack | undefined = track || (audioUrl ? {
    id: audioUrl,
    title: title || 'Audio',
    audioUrl
  } : undefined);

  const { state, controls, currentTrack } = useUnifiedAudio({
    ...audioOptions,
    onEnded: onEnded || onNext
  });

  // Auto-play au mount si track fourni
  React.useEffect(() => {
    if (resolvedTrack && !currentTrack) {
      // Ne pas auto-play, juste préparer
    }
  }, [resolvedTrack, currentTrack]);

  const handlePlayPause = () => {
    if (state.isPlaying) {
      controls.pause();
    } else if (state.isPaused) {
      controls.resume();
    } else if (resolvedTrack) {
      controls.play(resolvedTrack);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Styles basés sur thème
  const themeClasses = {
    primary: 'text-primary border-primary/30 bg-primary',
    warning: 'text-warning border-warning/30 bg-warning',
    success: 'text-success border-success/30 bg-success',
    accent: 'text-accent border-accent/30 bg-accent'
  };

  const isCompact = variant === 'compact' || variant === 'minimal';
  const isCard = variant === 'card' || variant === 'default';

  // ============================================
  // Render Minimal
  // ============================================

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          onClick={handlePlayPause}
          size="sm"
          variant="outline"
          disabled={state.isLoading}
          className={cn(`border-${themeColor}/30`)}
        >
          {state.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm truncate max-w-[150px]">
          {resolvedTrack?.title || 'Aucun audio'}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTime(state.currentTime)}/{formatTime(state.duration)}
        </span>
      </div>
    );
  }

  // ============================================
  // Render Principal
  // ============================================

  const Wrapper = isCard ? Card : 'div';
  const ContentWrapper = isCard ? CardContent : 'div';

  return (
    <Wrapper className={cn(
      isCard && `border-${themeColor}/20`,
      className
    )}>
      <ContentWrapper className={cn(isCard ? "p-6" : "", "space-y-4")}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={cn(
            "font-semibold truncate flex-1",
            `text-${themeColor}`,
            isCompact ? "text-sm" : "text-lg"
          )}>
            {resolvedTrack?.title || 'Aucun audio sélectionné'}
          </h3>
          
          <div className="flex items-center gap-2">
            {state.isCached && showOfflineCache && (
              <Badge variant="outline" className="text-success border-success/30 text-xs">
                <HardDrive className="h-3 w-3 mr-1" />
                Hors-ligne
              </Badge>
            )}
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm">
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {(state.isLoading || state.isBuffering) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{state.isBuffering ? 'Mise en mémoire tampon...' : 'Chargement...'}</span>
          </div>
        )}

        {/* Progress bar */}
        <div>
          <Slider
            value={[state.currentTime]}
            max={state.duration || 100}
            step={1}
            onValueChange={([value]) => controls.seek(value)}
            className="w-full"
          />
          <div className={cn(
            "flex justify-between mt-1",
            `text-${themeColor}`,
            isCompact ? "text-xs" : "text-sm"
          )}>
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-4">
          {showSkip && onPrevious && (
            <Button
              onClick={onPrevious}
              variant="outline"
              size="sm"
              className={`border-${themeColor}/30 hover:bg-${themeColor}/10`}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}

          {showSkip && (
            <Button
              onClick={() => controls.skipBackward(10)}
              variant="outline"
              size="sm"
              className={`border-${themeColor}/30`}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}

          <Button
            onClick={handlePlayPause}
            disabled={state.isLoading || !resolvedTrack}
            className={cn(
              "rounded-full",
              themeClasses[themeColor],
              isCompact ? "w-10 h-10" : "w-12 h-12"
            )}
          >
            {state.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : state.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          {showStop && (
            <Button
              onClick={controls.stop}
              variant="outline"
              size="sm"
              className={`border-${themeColor}/30`}
            >
              <Square className="h-4 w-4" />
            </Button>
          )}

          {showSkip && (
            <Button
              onClick={() => controls.skipForward(10)}
              variant="outline"
              size="sm"
              className={`border-${themeColor}/30`}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}

          {showSkip && onNext && (
            <Button
              onClick={onNext}
              variant="outline"
              size="sm"
              className={`border-${themeColor}/30 hover:bg-${themeColor}/10`}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Volume and secondary controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Volume */}
          <div className="flex items-center gap-2 flex-1">
            <Button
              onClick={controls.toggleMute}
              variant="ghost"
              size="sm"
              className={`text-${themeColor}`}
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[state.volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => controls.setVolume(value / 100)}
              className="w-24"
            />
            <span className={cn("text-xs w-8", `text-${themeColor}`)}>
              {Math.round(state.volume * 100)}%
            </span>
          </div>

          {/* Playback rate */}
          {showPlaybackRate && (
            <div className="flex items-center gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  variant={state.playbackRate === rate ? "default" : "ghost"}
                  size="sm"
                  onClick={() => controls.setPlaybackRate(rate)}
                  className={cn(
                    "h-6 px-2 text-xs",
                    state.playbackRate === rate 
                      ? themeClasses[themeColor]
                      : `text-${themeColor} hover:bg-${themeColor}/10`
                  )}
                >
                  {rate}x
                </Button>
              ))}
            </div>
          )}

          {/* Cache button */}
          {showOfflineCache && !state.isCached && resolvedTrack && (
            <Button
              onClick={controls.cacheTrack}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <HardDrive className="h-4 w-4" />
              <span className="hidden sm:inline">Cacher</span>
            </Button>
          )}
        </div>

        {/* Error display */}
        {state.error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {state.error}
          </div>
        )}
      </ContentWrapper>
    </Wrapper>
  );
};

// Alias pour rétrocompatibilité
export const AudioPlayer = UnifiedAudioPlayer;
export const MusicPlayer = UnifiedAudioPlayer;
