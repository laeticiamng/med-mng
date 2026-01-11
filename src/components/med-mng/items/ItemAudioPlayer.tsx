import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, Gauge, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import type { ItemAudio } from '@/types/medMngItems';

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0:00';
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
};

interface ItemAudioPlayerProps {
  audios: ItemAudio[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const VOLUME_STORAGE_KEY = 'med-mng-volume';
const SPEED_STORAGE_KEY = 'med-mng-playback-speed';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const ItemAudioPlayer = ({ audios, selectedIndex, onSelect }: ItemAudioPlayerProps) => {
  const audio = audios[selectedIndex];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio?.durationSeconds ?? 0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => {
    if (typeof window === 'undefined') {
      return 0.8;
    }
    const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    const parsed = stored ? Number(stored) : 0.8;
    return Number.isFinite(parsed) ? parsed : 0.8;
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    if (typeof window === 'undefined') {
      return 1;
    }
    const stored = window.localStorage.getItem(SPEED_STORAGE_KEY);
    const parsed = stored ? Number(stored) : 1;
    return PLAYBACK_SPEEDS.includes(parsed) ? parsed : 1;
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) {
      return;
    }

    const handleTimeUpdate = () => setCurrentTime(element.currentTime);
    const handleLoadedMetadata = () => setDuration(element.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    element.addEventListener('timeupdate', handleTimeUpdate);
    element.addEventListener('loadedmetadata', handleLoadedMetadata);
    element.addEventListener('ended', handleEnded);
    element.addEventListener('waiting', handleWaiting);
    element.addEventListener('canplay', handleCanPlay);

    return () => {
      element.removeEventListener('timeupdate', handleTimeUpdate);
      element.removeEventListener('loadedmetadata', handleLoadedMetadata);
      element.removeEventListener('ended', handleEnded);
      element.removeEventListener('waiting', handleWaiting);
      element.removeEventListener('canplay', handleCanPlay);
    };
  }, [audio?.audioUrl]);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) {
      return;
    }
    element.volume = isMuted ? 0 : volume;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) {
      return;
    }
    element.playbackRate = playbackSpeed;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SPEED_STORAGE_KEY, playbackSpeed.toString());
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.code === 'Space') {
        event.preventDefault();
        handleToggle();
      }
      if (event.code === 'ArrowLeft') {
        handleSeek(Math.max(0, currentTime - 10));
      }
      if (event.code === 'ArrowRight') {
        handleSeek(Math.min(duration, currentTime + 10));
      }
      if (event.code === 'KeyM') {
        setIsMuted(!isMuted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isMuted]);

  const handleToggle = () => {
    const element = audioRef.current;
    if (!element) {
      return;
    }

    if (isPlaying) {
      element.pause();
      setIsPlaying(false);
      return;
    }

    element.play();
    setIsPlaying(true);
  };

  const handleSeek = (value: number) => {
    const element = audioRef.current;
    if (!element) {
      return;
    }

    element.currentTime = value;
    setCurrentTime(value);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < audios.length - 1) {
      onSelect(selectedIndex + 1);
    }
  };

  const handleRestart = () => {
    handleSeek(0);
    if (!isPlaying) {
      handleToggle();
    }
  };

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(audio.durationSeconds ?? 0);
  }, [audio?.audioUrl, audio?.durationSeconds]);

  if (!audio) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="p-4 space-y-4">
      {/* Header avec infos audio */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">Audio</p>
          <h3 className="text-lg font-semibold text-foreground truncate">{audio.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {audio.style ?? 'Style non précisé'}
            </span>
            {audio.bpm && (
              <Badge variant="outline" className="text-xs">
                {audio.bpm} BPM
              </Badge>
            )}
            {audio.rang && (
              <Badge variant="secondary" className="text-xs">
                Rang {audio.rang}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button 
            onClick={handleRestart} 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            title="Recommencer"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handlePrevious} 
            size="icon" 
            variant="outline" 
            disabled={selectedIndex === 0}
            className="h-9 w-9"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleToggle} 
            size="icon" 
            className="h-11 w-11 rounded-full"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          <Button 
            onClick={handleNext} 
            size="icon" 
            variant="outline" 
            disabled={selectedIndex === audios.length - 1}
            className="h-9 w-9"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sélecteur de piste */}
      {audios.length > 1 && (
        <Select value={String(selectedIndex)} onValueChange={(value) => onSelect(Number(value))}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Choisir un rang" />
          </SelectTrigger>
          <SelectContent>
            {audios.map((audioItem, index) => (
              <SelectItem key={audioItem.id} value={String(index)}>
                {audioItem.rang ? `Rang ${audioItem.rang}` : `Piste ${index + 1}`} • {audioItem.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-100 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(event) => handleSeek(Number(event.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>
            {isBuffering ? 'Chargement...' : `-${formatTime(duration - currentTime)}`}
          </span>
        </div>
      </div>

      {/* Contrôles secondaires: Volume + Vitesse */}
      <div className="flex items-center gap-4">
        {/* Volume */}
        <div className="flex items-center gap-2 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 shrink-0"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={5}
            onValueChange={([val]) => {
              setVolume(val / 100);
              if (val > 0) setIsMuted(false);
            }}
            className="flex-1"
          />
        </div>

        {/* Vitesse de lecture */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={String(playbackSpeed)} 
            onValueChange={(val) => setPlaybackSpeed(Number(val))}
          >
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAYBACK_SPEEDS.map((speed) => (
                <SelectItem key={speed} value={String(speed)}>
                  {speed}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Raccourcis clavier */}
      <div className="text-xs text-muted-foreground/60 text-center">
        Raccourcis: Espace (play/pause) • ← → (±10s) • M (mute)
      </div>

      <audio
        ref={audioRef}
        src={audio.streamUrl ?? audio.audioUrl}
        preload="metadata"
        onEnded={() => {
          if (selectedIndex < audios.length - 1) {
            onSelect(selectedIndex + 1);
          }
        }}
      />
    </Card>
  );
};
