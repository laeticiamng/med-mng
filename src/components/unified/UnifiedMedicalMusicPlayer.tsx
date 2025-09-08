// ============================================
// LECTEUR MUSICAL MÉDICAL UNIFIÉ ET ACCESSIBLE
// ============================================

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat, 
  Shuffle, 
  Heart,
  Plus,
  Download,
  Maximize2,
  Minimize2,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMedicalMusicOrchestrator } from '@/hooks/unified/useMedicalMusicOrchestrator';
import type { MedicalMusicTrack } from '@/types/music-unified';

// ==========================================
// INTERFACES ET TYPES
// ==========================================

interface UnifiedMedicalMusicPlayerProps {
  // Mode d'affichage
  variant?: 'full' | 'compact' | 'minimal' | 'floating';
  
  // Configuration
  showPlaylist?: boolean;
  showLyrics?: boolean;
  showVisualizer?: boolean;
  autoPlay?: boolean;
  enableKeyboardControls?: boolean;
  
  // Callbacks
  onTrackChange?: (track: MedicalMusicTrack | null) => void;
  onPlaylistUpdate?: (playlist: MedicalMusicTrack[]) => void;
  onVolumeChange?: (volume: number) => void;
  
  // Styling
  className?: string;
  theme?: 'light' | 'dark' | 'medical' | 'auto';
  
  // Accessibilité
  reducedMotion?: boolean;
  highContrast?: boolean;
  largeControls?: boolean;
  screenReaderOptimized?: boolean;
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

export const UnifiedMedicalMusicPlayer: React.FC<UnifiedMedicalMusicPlayerProps> = ({
  variant = 'full',
  showPlaylist = false,
  showLyrics = false,
  showVisualizer = false,
  autoPlay = false,
  enableKeyboardControls = true,
  onTrackChange,
  onPlaylistUpdate,
  onVolumeChange,
  className = '',
  theme = 'auto',
  reducedMotion = false,
  highContrast = false,
  largeControls = false,
  screenReaderOptimized = false
}) => {
  
  // ==========================================
  // HOOKS ET ÉTAT
  // ==========================================
  
  const orchestrator = useMedicalMusicOrchestrator({
    autoPlay,
    enableAnalytics: true,
    accessibilityConfig: {
      keyboardNavigation: enableKeyboardControls,
      reducedMotion,
      highContrast,
      largeFonts: largeControls,
      ariaLabels: true,
      liveRegions: screenReaderOptimized
    }
  });
  
  const {
    playerState,
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    setPlaybackRate,
    playNext,
    playPrevious,
    setRepeatMode,
    toggleShuffle,
    addToLibrary,
    toggleLike,
    announceToScreenReader
  } = orchestrator;
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // ==========================================
  // EFFETS ET CALLBACKS
  // ==========================================
  
  // Notifier les changements de track
  useEffect(() => {
    onTrackChange?.(playerState.currentTrack || null);
  }, [playerState.currentTrack, onTrackChange]);
  
  // Notifier les changements de playlist
  useEffect(() => {
    onPlaylistUpdate?.(playerState.playlist);
  }, [playerState.playlist, onPlaylistUpdate]);
  
  // Notifier les changements de volume
  useEffect(() => {
    onVolumeChange?.(playerState.volume);
  }, [playerState.volume, onVolumeChange]);
  
  // Gestion du seek via la barre de progression
  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || playerState.duration === 0) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * playerState.duration;
    
    seekTo(newTime);
  }, [playerState.duration, seekTo]);
  
  // Toggle play/pause
  const handlePlayToggle = useCallback(() => {
    if (playerState.isPlaying) {
      pause();
    } else if (playerState.currentTrack) {
      resume();
    }
  }, [playerState.isPlaying, playerState.currentTrack, pause, resume]);
  
  // Formatage du temps
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Calcul des pourcentages de progression
  const progressPercentage = useMemo(() => {
    return playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0;
  }, [playerState.currentTime, playerState.duration]);
  
  const bufferPercentage = useMemo(() => {
    return playerState.duration > 0 ? (playerState.bufferedTime / playerState.duration) * 100 : 0;
  }, [playerState.bufferedTime, playerState.duration]);
  
  // ==========================================
  // RENDU CONDITIONNEL SELON LE VARIANT
  // ==========================================
  
  // Mode minimal (lecture/pause uniquement)
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          variant="ghost"
          size={largeControls ? "default" : "sm"}
          onClick={handlePlayToggle}
          disabled={!playerState.currentTrack}
          aria-label={playerState.isPlaying ? "Mettre en pause" : "Lire"}
        >
          {playerState.isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
          ) : playerState.isPlaying ? (
            <Pause className={largeControls ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <Play className={largeControls ? "h-6 w-6" : "h-4 w-4"} />
          )}
        </Button>
        
        {playerState.currentTrack && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {playerState.currentTrack.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {playerState.currentTrack.medical_metadata.item_code} • 
              Rang {playerState.currentTrack.medical_metadata.rang}
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Mode compact
  if (variant === 'compact') {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="p-4">
          {/* Info du track */}
          {playerState.currentTrack && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold truncate flex-1">
                  {playerState.currentTrack.title}
                </h4>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Rang {playerState.currentTrack.medical_metadata.rang}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {playerState.currentTrack.medical_metadata.item_code} • 
                {playerState.currentTrack.medical_metadata.style}
              </p>
            </div>
          )}
          
          {/* Barre de progression */}
          <div className="mb-3">
            <div 
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="relative w-full h-1 bg-secondary rounded-full cursor-pointer group"
              role="slider"
              aria-label="Position dans la piste"
              aria-valuemin={0}
              aria-valuemax={playerState.duration}
              aria-valuenow={playerState.currentTime}
              tabIndex={0}
            >
              {/* Buffer */}
              <div 
                className="absolute top-0 left-0 h-full bg-secondary-foreground/30 rounded-full"
                style={{ width: `${bufferPercentage}%` }}
              />
              {/* Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
          </div>
          
          {/* Contrôles */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={playPrevious}
              disabled={playerState.playlist.length <= 1}
              aria-label="Piste précédente"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handlePlayToggle}
              disabled={!playerState.currentTrack}
              className="w-10 h-10 rounded-full"
              aria-label={playerState.isPlaying ? "Mettre en pause" : "Lire"}
            >
              {playerState.isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : playerState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={playNext}
              disabled={playerState.playlist.length <= 1}
              aria-label="Piste suivante"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Mode floating (en bas de page)
  if (variant === 'floating') {
    if (!playerState.currentTrack || playerState.isMinimized) {
      return null;
    }
    
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}>
        <Card className="rounded-none border-t border-l-0 border-r-0 border-b-0 bg-background/95 backdrop-blur">
          <CardContent className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Track info */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium truncate">
                    {playerState.currentTrack.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {playerState.currentTrack.medical_metadata.item_code} • 
                    Rang {playerState.currentTrack.medical_metadata.rang}
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playPrevious}
                  disabled={playerState.playlist.length <= 1}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handlePlayToggle}
                  size="sm"
                  className="w-8 h-8 rounded-full"
                >
                  {playerState.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={playNext}
                  disabled={playerState.playlist.length <= 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Volume */}
              <div className="flex items-center space-x-2 flex-1 max-w-32 justify-end">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[playerState.volume]}
                  onValueChange={([value]) => setVolume(value)}
                  max={1}
                  step={0.05}
                  className="w-16"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // ==========================================
  // MODE FULL - LECTEUR COMPLET
  // ==========================================
  
  return (
    <TooltipProvider>
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          {/* Header avec info du track */}
          {playerState.currentTrack && (
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold truncate mb-1">
                    {playerState.currentTrack.title}
                  </h2>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">
                      {playerState.currentTrack.medical_metadata.item_code}
                    </Badge>
                    <Badge 
                      variant={playerState.currentTrack.medical_metadata.rang === 'A' ? 'default' : 'secondary'}
                    >
                      Rang {playerState.currentTrack.medical_metadata.rang}
                    </Badge>
                    <Badge variant="outline">
                      {playerState.currentTrack.medical_metadata.style}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Domaine: {playerState.currentTrack.medical_metadata.medical_domain} • 
                    Difficulté: {playerState.currentTrack.medical_metadata.difficulty_level}/5 •
                    Langue: {playerState.currentTrack.generation_metadata.language}
                  </p>
                </div>
                
                {/* Actions rapides */}
                <div className="flex items-center space-x-1 ml-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(playerState.currentTrack!.id)}
                        className={playerState.currentTrack.interaction_metadata.is_liked ? 'text-red-500' : ''}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {playerState.currentTrack.interaction_metadata.is_liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addToLibrary(playerState.currentTrack!)}
                        disabled={playerState.currentTrack.interaction_metadata.is_in_library}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {playerState.currentTrack.interaction_metadata.is_in_library ? 'Déjà dans la bibliothèque' : 'Ajouter à la bibliothèque'}
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = playerState.currentTrack!.audio_url;
                          link.download = `${playerState.currentTrack!.title}.mp3`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Télécharger</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Métadonnées étendues */}
              {playerState.currentTrack.medical_metadata.learning_objectives.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Objectifs d'apprentissage:</h4>
                  <div className="flex flex-wrap gap-1">
                    {playerState.currentTrack.medical_metadata.learning_objectives.map((objective, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Message si pas de track */}
          {!playerState.currentTrack && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune musique sélectionnée</h3>
              <p className="text-muted-foreground">
                Générez ou sélectionnez une musique médicale pour commencer
              </p>
            </div>
          )}
          
          {/* Barre de progression interactive */}
          <div className="mb-6">
            <div 
              ref={progressBarRef}
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  seekTo(Math.max(0, playerState.currentTime - 10));
                } else if (e.key === 'ArrowRight') {
                  seekTo(Math.min(playerState.duration, playerState.currentTime + 10));
                }
              }}
              className="relative w-full h-3 bg-secondary rounded-lg cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="slider"
              aria-label="Position dans la piste"
              aria-valuemin={0}
              aria-valuemax={playerState.duration}
              aria-valuenow={playerState.currentTime}
              tabIndex={enableKeyboardControls ? 0 : -1}
            >
              {/* Buffer indicator */}
              <div 
                className="absolute top-0 left-0 h-full bg-secondary-foreground/20 rounded-lg transition-all duration-300"
                style={{ width: `${bufferPercentage}%` }}
              />
              
              {/* Progress indicator */}
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-lg transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
              
              {/* Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200"
                style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
              
              {/* Time tooltip */}
              <div 
                className="absolute -top-8 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
              >
                {formatTime(playerState.currentTime)}
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span className="font-mono">{formatTime(playerState.currentTime)}</span>
              <span className="font-mono">{formatTime(playerState.duration)}</span>
            </div>
            
            {/* Loading indicator */}
            {playerState.isLoading && (
              <Progress value={66} className="mt-2 h-1" />
            )}
          </div>
          
          {/* Contrôles principaux */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* Shuffle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShuffle}
                  className={playerState.shuffleMode ? 'text-primary' : 'text-muted-foreground'}
                  aria-label="Mode aléatoire"
                  aria-pressed={playerState.shuffleMode}
                >
                  <Shuffle className={largeControls ? "h-5 w-5" : "h-4 w-4"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Mode aléatoire {playerState.shuffleMode ? 'activé' : 'désactivé'}
              </TooltipContent>
            </Tooltip>
            
            {/* Previous */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={largeControls ? "default" : "sm"}
                  onClick={playPrevious}
                  disabled={playerState.playlist.length <= 1}
                  aria-label="Piste précédente"
                >
                  <SkipBack className={largeControls ? "h-6 w-6" : "h-5 w-5"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Piste précédente</TooltipContent>
            </Tooltip>
            
            {/* Play/Pause */}
            <Button
              onClick={handlePlayToggle}
              disabled={!playerState.currentTrack}
              className={`${largeControls ? 'w-14 h-14' : 'w-12 h-12'} rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl`}
              aria-label={
                playerState.isLoading ? "Chargement..." : 
                playerState.isPlaying ? "Mettre en pause" : "Lire"
              }
            >
              {playerState.isLoading ? (
                <div className={`animate-spin ${largeControls ? 'w-6 h-6' : 'w-5 h-5'} border-2 border-primary-foreground border-t-transparent rounded-full`} />
              ) : playerState.isPlaying ? (
                <Pause className={largeControls ? "h-7 w-7" : "h-6 w-6"} />
              ) : (
                <Play className={largeControls ? "h-7 w-7" : "h-6 w-6"} />
              )}
            </Button>
            
            {/* Next */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={largeControls ? "default" : "sm"}
                  onClick={playNext}
                  disabled={playerState.playlist.length <= 1}
                  aria-label="Piste suivante"
                >
                  <SkipForward className={largeControls ? "h-6 w-6" : "h-5 w-5"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Piste suivante</TooltipContent>
            </Tooltip>
            
            {/* Repeat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const modes: ('none' | 'track' | 'playlist')[] = ['none', 'track', 'playlist'];
                    const currentIndex = modes.indexOf(playerState.repeatMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    setRepeatMode(nextMode);
                  }}
                  className={playerState.repeatMode !== 'none' ? 'text-primary' : 'text-muted-foreground'}
                  aria-label={`Mode répétition: ${playerState.repeatMode}`}
                >
                  <Repeat className={largeControls ? "h-5 w-5" : "h-4 w-4"} />
                  {playerState.repeatMode === 'track' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Répétition: {
                  playerState.repeatMode === 'none' ? 'désactivée' :
                  playerState.repeatMode === 'track' ? 'piste actuelle' :
                  'playlist complète'
                }
              </TooltipContent>
            </Tooltip>
          </div>
          
          <Separator className="mb-6" />
          
          {/* Contrôles secondaires */}
          <div className="flex items-center justify-between">
            {/* Volume */}
            <div className="flex items-center space-x-3 flex-1 max-w-48">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVolume(playerState.isMuted ? 0.8 : 0)}
                aria-label={playerState.isMuted ? "Activer le son" : "Couper le son"}
              >
                {playerState.isMuted || playerState.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <Slider
                value={[playerState.isMuted ? 0 : playerState.volume]}
                onValueChange={([value]) => setVolume(value)}
                max={1}
                step={0.05}
                className="flex-1"
                aria-label="Volume"
              />
              
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round((playerState.isMuted ? 0 : playerState.volume) * 100)}%
              </span>
            </div>
            
            {/* Vitesse de lecture */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Vitesse:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs font-mono">
                    {playerState.playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Vitesse de lecture</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <DropdownMenuItem 
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={rate === playerState.playbackRate ? 'bg-accent' : ''}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Options avancées */}
            <div className="flex items-center space-x-1">
              {showLyrics && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Afficher les paroles</TooltipContent>
                </Tooltip>
              )}
              
              {showVisualizer && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Visualiseur audio</TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Paramètres</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* Affichage des erreurs */}
          {playerState.hasError && playerState.currentTrack && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                ❌ Erreur de lecture: Impossible de charger la piste audio
              </p>
            </div>
          )}
          
          {/* Info de la playlist */}
          {playerState.playlist.length > 1 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Piste {playerState.currentIndex + 1} sur {playerState.playlist.length} • 
                {playerState.shuffleMode && " Mode aléatoire"} • 
                {playerState.repeatMode !== 'none' && ` Répétition ${playerState.repeatMode}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};