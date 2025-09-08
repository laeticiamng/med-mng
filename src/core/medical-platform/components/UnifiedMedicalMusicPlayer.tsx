import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Download,
  Share,
  Heart,
  Maximize2,
  Minimize2,
  Settings,
  Headphones,
  Brain,
  BookOpen
} from 'lucide-react';
import { useGlobalAudio } from '@/contexts/GlobalAudioContext';
import { useToast } from '@/hooks/use-toast';

// ===============================================
// UNIFIED MEDICAL MUSIC PLAYER - PREMIUM
// ===============================================

interface MedicalTrack {
  id: string;
  title: string;
  audioUrl: string;
  rang: 'A' | 'B' | 'AB';
  itemCode: string;
  duration: number;
  lyrics?: string[];
  medicalContext?: {
    specialty?: string;
    difficulty?: string;
    keywords?: string[];
  };
  metadata?: {
    generatedAt: string;
    style: string;
    language: string;
  };
}

interface UnifiedMedicalMusicPlayerProps {
  track: MedicalTrack;
  isCompact?: boolean;
  showLyrics?: boolean;
  showMedicalContext?: boolean;
  onTrackEnd?: () => void;
  onFavorite?: (trackId: string) => void;
  className?: string;
}

export const UnifiedMedicalMusicPlayer: React.FC<UnifiedMedicalMusicPlayerProps> = ({
  track,
  isCompact = false,
  showLyrics = true,
  showMedicalContext = true,
  onTrackEnd,
  onFavorite,
  className = ""
}) => {
  // States
  const [isMinimized, setIsMinimized] = useState(isCompact);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Hooks
  const { toast } = useToast();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    stop,
    seek,
    changeVolume
  } = useGlobalAudio();

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle play/pause
  const handlePlayPause = () => {
    if (currentTrack?.url === track.audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        play({
          url: track.audioUrl,
          title: track.title,
          rang: track.rang
        });
      }
    } else {
      play({
        url: track.audioUrl,
        title: track.title,
        rang: track.rang
      });
    }
  };

  // Handle stop
  const handleStop = () => {
    stop();
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  // Handle volume
  const handleVolumeChange = (value: number[]) => {
    changeVolume(value[0] / 100);
  };

  // Handle speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = track.audioUrl;
      link.download = `${track.itemCode}_Rang_${track.rang}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Téléchargement lancé",
        description: `${track.title}.mp3`
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `Écoutez cette musique médicale : ${track.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié !",
          description: "Le lien a été copié dans le presse-papier"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de partage",
        description: "Impossible de partager",
        variant: "destructive"
      });
    }
  };

  // Handle favorite
  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.(track.id);
    
    toast({
      title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: track.title
    });
  };

  // Track end handler
  useEffect(() => {
    if (currentTime >= duration && duration > 0) {
      onTrackEnd?.();
    }
  }, [currentTime, duration, onTrackEnd]);

  // Compact view
  if (isMinimized) {
    return (
      <Card className={`${className} border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying && currentTrack?.url === track.audioUrl ? 
                <Pause className="h-4 w-4" /> : 
                <Play className="h-4 w-4" />
              }
            </Button>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground">
                {track.itemCode} • Rang {track.rang}
              </p>
            </div>

            {/* Progress */}
            <div className="flex-1 max-w-xs">
              <Progress value={progress} className="h-1" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              aria-label="Agrandir le lecteur"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <Card className={`${className} border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              {track.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {track.itemCode}
              </Badge>
              <Badge 
                variant={track.rang === 'A' ? 'default' : track.rang === 'B' ? 'secondary' : 'destructive'}
                className="gap-1"
              >
                Rang {track.rang}
              </Badge>
              {track.medicalContext?.specialty && (
                <Badge variant="outline">{track.medicalContext.specialty}</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Paramètres"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              aria-label="Réduire le lecteur"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Controls */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="w-full"
              aria-label="Position dans la piste"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => seek(Math.max(0, currentTime - 15))}
              aria-label="Reculer de 15 secondes"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handlePlayPause}
              className="rounded-full w-12 h-12"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying && currentTrack?.url === track.audioUrl ? 
                <Pause className="h-5 w-5" /> : 
                <Play className="h-5 w-5" />
              }
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              aria-label="Arrêter"
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => seek(Math.min(duration, currentTime + 15))}
              aria-label="Avancer de 15 secondes"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeVolume(volume > 0 ? 0 : 1)}
            aria-label={volume > 0 ? "Couper le son" : "Activer le son"}
          >
            {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
            aria-label="Volume"
          />
          <span className="text-sm text-muted-foreground min-w-[3ch]">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={isFavorite ? "text-red-500" : ""}
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              aria-label="Partager"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              aria-label="Télécharger"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            {showLyrics && track.lyrics && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
                aria-label={showTranscript ? "Masquer les paroles" : "Afficher les paroles"}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Paroles
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label="Mode apprentissage médical"
            >
              <Headphones className="h-4 w-4" />
              Mode Étude
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border rounded-lg p-4 bg-background/50">
            <h4 className="font-medium mb-3">Paramètres de lecture</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Vitesse</label>
                <div className="flex gap-1 mt-1">
                  {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
                    <Button
                      key={speed}
                      variant={playbackSpeed === speed ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lyrics Panel */}
        {showTranscript && track.lyrics && (
          <div className="border rounded-lg p-4 bg-background/50 max-h-48 overflow-y-auto">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Paroles médicales
            </h4>
            <div className="space-y-2">
              {track.lyrics.map((line, index) => (
                <p key={index} className="text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Medical Context */}
        {showMedicalContext && track.medicalContext && (
          <div className="border rounded-lg p-4 bg-primary/5">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Contexte médical
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {track.medicalContext.difficulty && (
                <div>
                  <span className="text-muted-foreground">Niveau :</span>
                  <span className="ml-2 capitalize">{track.medicalContext.difficulty}</span>
                </div>
              )}
              {track.medicalContext.keywords && (
                <div>
                  <span className="text-muted-foreground">Mots-clés :</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {track.medicalContext.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Hidden audio element for playback speed control */}
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed;
          }
        }}
        style={{ display: 'none' }}
      />
    </Card>
  );
};