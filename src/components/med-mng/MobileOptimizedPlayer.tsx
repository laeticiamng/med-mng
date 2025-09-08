import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Repeat,
  Shuffle,
  Download,
  Clock,
  Music,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { logger } from '@/utils/logger';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  imageUrl?: string;
  itemCode?: string;
  rang?: 'A' | 'B';
}

interface MobileOptimizedPlayerProps {
  track: Track;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export const MobileOptimizedPlayer: React.FC<MobileOptimizedPlayerProps> = ({
  track,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  className = '',
}) => {
  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
        setIsPlaying(true);
      } else if (onNext) {
        onNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat, onNext]);

  // Player controls
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        logger.userAction('Pause track', undefined, { trackId: track.id });
      } else {
        await audio.play();
        setIsPlaying(true);
        logger.userAction('Play track', undefined, { trackId: track.id });
      }
    } catch (error) {
      logger.error('Audio playback error', 'MobilePlayer', { error, trackId: track.id });
      toast({
        title: 'Erreur de lecture',
        description: 'Impossible de lire ce fichier audio',
        variant: 'destructive',
      });
    }
  };

  const handleSeek = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (values[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    setVolume(values);
    audio.volume = values[0] / 100;
    setIsMuted(values[0] === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      setVolume([75]);
      audio.volume = 0.75;
      setIsMuted(false);
    } else {
      setVolume([0]);
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleFavorite = async () => {
    try {
      await toggleFavorite(track.id);
      logger.userAction('Toggle favorite', undefined, { trackId: track.id });
    } catch (error) {
      logger.error('Toggle favorite error', 'MobilePlayer', { error, trackId: track.id });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: `Écoutez "${track.title}" sur MED-MNG`,
          url: window.location.href,
        });
        logger.userAction('Share track', undefined, { trackId: track.id, method: 'native' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Lien copié',
          description: 'Le lien a été copié dans le presse-papiers',
        });
        logger.userAction('Share track', undefined, { trackId: track.id, method: 'clipboard' });
      }
    } catch (error) {
      logger.error('Share error', 'MobilePlayer', { error, trackId: track.id });
      toast({
        title: 'Erreur de partage',
        description: 'Impossible de partager ce contenu',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Swipe handlers
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      setIsExpanded(false);
    } else if (info.offset.y < -100) {
      setIsExpanded(true);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isExpanded ? 0 : 'calc(100% - 80px)' }}
        exit={{ y: '100%' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={`fixed inset-x-0 bottom-0 z-50 bg-background border-t ${className}`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Compact Player (when collapsed) */}
        {!isExpanded && (
          <div className="flex items-center gap-3 px-4 pb-4">
            {/* Track Image */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center shrink-0">
              {track.imageUrl ? (
                <img 
                  src={track.imageUrl} 
                  alt={track.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Music className="w-6 h-6 text-primary" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{track.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="h-8 w-8 p-0"
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite(track.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded Player */}
        {isExpanded && (
          <div className="p-6 space-y-6 h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <h2 className="text-sm font-medium">En cours de lecture</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Track Image */}
            <div className="aspect-square w-full max-w-sm mx-auto">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center relative overflow-hidden"
              >
                {track.imageUrl ? (
                  <img 
                    src={track.imageUrl} 
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-24 h-24 text-primary" />
                )}
                
                {/* Play/Pause Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isPlaying ? 0 : 1 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Track Info */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">{track.title}</h1>
              <p className="text-lg text-muted-foreground">{track.artist}</p>
              <div className="flex items-center justify-center gap-2">
                {track.itemCode && (
                  <Badge variant="outline">{track.itemCode}</Badge>
                )}
                {track.rang && (
                  <Badge variant={track.rang === 'A' ? 'default' : 'secondary'}>
                    Rang {track.rang}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(duration)}
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`h-12 w-12 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Shuffle className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={onPrevious}
                disabled={!onPrevious}
                className="h-12 w-12"
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={togglePlayPause}
                  className="h-16 w-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </motion.div>

              <Button
                variant="ghost"
                size="lg"
                onClick={onNext}
                disabled={!onNext}
                className="h-12 w-12"
              >
                <SkipForward className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`h-12 w-12 ${isRepeat ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Repeat className="w-5 h-5" />
              </Button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className={isFavorite(track.id) ? 'text-red-500' : 'text-muted-foreground'}
              >
                <Heart className={`w-5 h-5 ${isFavorite(track.id) ? 'fill-current' : ''}`} />
              </Button>

              <div className="flex items-center gap-2 flex-1 max-w-xs mx-4">
                <Button variant="ghost" size="sm" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={track.audioUrl}
              preload="metadata"
              className="hidden"
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileOptimizedPlayer;