import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  Share2,
  Download,
  Settings,
  Maximize,
  Minimize,
  Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { KaraokePlayer } from '@/components/lyrics/KaraokePlayer';
import { useActivityTracking } from '@/hooks/useActivityTracking';

interface AdvancedMusicPlayerProps {
  songId: string;
  audioUrl: string;
  title: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  onAddToPlaylist?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const AdvancedMusicPlayer: React.FC<AdvancedMusicPlayerProps> = ({
  songId,
  audioUrl,
  title,
  artist = "MED-MNG",
  album = "Collection Médicale",
  coverUrl,
  onAddToPlaylist,
  onShare,
  onDownload,
  className = ""
}) => {
  // États audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // États UI
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [showLyrics, setShowLyrics] = useState(true);
  
  // Analytics
  const [playCount, setPlayCount] = useState(0);
  const [totalListenTime, setTotalListenTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  // Initialisation audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      }
      // Analytics: chanson terminée
      trackListeningSession();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeatMode]);

  // Visualiseur audio
  useEffect(() => {
    if (showVisualizer && audioRef.current && canvasRef.current) {
      initializeVisualizer();
    }
  }, [showVisualizer]);

  const initializeVisualizer = () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      analyzerRef.current = analyzer;
      drawVisualizer();
    } catch (error) {
      console.error('Erreur initialisation visualiseur:', error);
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyzer = analyzerRef.current;
    if (!canvas || !analyzer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      
      analyzer.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(var(--primary))');
        gradient.addColorStop(1, 'hsl(var(--accent))');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  // Contrôles audio
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Erreur lecture:', error);
        toast({
          title: "Erreur",
          description: "Impossible de lire le fichier audio",
          variant: "destructive",
        });
      });
      // Analytics: nouvelle lecture
      setPlayCount(prev => prev + 1);
      logActivity({ activity_type: 'study', metadata: { action: 'play_music', songId, title } });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = value[0] / 100;
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (direction: 'forward' | 'backward') => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const skipTime = direction === 'forward' ? 15 : -15;
    const newTime = Math.max(0, Math.min(duration, currentTime + skipTime));
    audio.currentTime = newTime;
  };

  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    toast({
      title: "Mode répétition",
      description: nextMode === 'none' ? 'Désactivé' : 
                   nextMode === 'one' ? 'Répéter la chanson' : 
                   'Répéter la playlist',
    });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "💔 Retiré des favoris" : "❤️ Ajouté aux favoris",
      description: title,
    });
  };

  // Analytics
  const trackListeningSession = () => {
    setTotalListenTime(prev => prev + duration);
    logActivity({ activity_type: 'study', metadata: { action: 'complete_song', songId, title, duration_seconds: Math.round(duration) } });
  };

  // Formatage du temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`}>
      <audio ref={audioRef} src={audioUrl} />
      
      <Card className={`${isFullscreen ? 'h-full border-0 rounded-none' : ''} overflow-hidden`}>
        {/* Header avec métadonnées */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Cover art */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                {coverUrl ? (
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Radio className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              
              {/* Métadonnées */}
              <div>
                <CardTitle className="text-xl font-bold truncate max-w-xs">
                  {title}
                </CardTitle>
                <p className="text-muted-foreground">{artist}</p>
                <p className="text-sm text-muted-foreground">{album}</p>
              </div>
            </div>
            
            {/* Analytics & Actions */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {playCount} écoute{playCount > 1 ? 's' : ''}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLike}
                aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-destructive text-destructive' : ''}`} />
              </Button>
              
              {onAddToPlaylist && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onAddToPlaylist}
                  aria-label="Ajouter à une playlist"
                >
                  <TranslatedText text="+ Playlist" />
                </Button>
              )}
              
              {onShare && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onShare}
                  aria-label="Partager cette musique"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={isFullscreen ? "Quitter le mode plein écran" : "Mode plein écran"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Visualiseur audio (mode plein écran) */}
          {isFullscreen && showVisualizer && (
            <div className="h-32 w-full">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full bg-gradient-to-r from-muted to-muted/80 rounded-lg"
                width="800" 
                height="200"
              />
            </div>
          )}

          {/* Barre de progression */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => handleSeek(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Contrôles principaux */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsShuffled(!isShuffled)}
              className={isShuffled ? 'text-primary' : ''}
              aria-label={isShuffled ? "Désactiver le mode aléatoire" : "Activer le mode aléatoire"}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => skip('backward')}
              aria-label="Reculer de 15 secondes"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => skip('forward')}
              aria-label="Avancer de 15 secondes"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleRepeat}
              className={repeatMode !== 'none' ? 'text-primary' : ''}
              aria-label={`Mode répétition: ${repeatMode === 'none' ? 'désactivé' : repeatMode === 'one' ? 'répéter une chanson' : 'répéter la playlist'}`}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && <span className="text-xs ml-1">1</span>}
            </Button>
          </div>

          {/* Contrôles volume & options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMute}
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24"
                aria-label="Contrôle du volume"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVisualizer(!showVisualizer)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLyrics(!showLyrics)}
              >
                <TranslatedText text="Paroles" />
              </Button>
              
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Paroles synchronisées */}
          {showLyrics && (
            <KaraokePlayer
              songId={songId}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
