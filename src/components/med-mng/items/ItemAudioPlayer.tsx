import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    element.volume = volume;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, volume.toString());
    }
  }, [volume]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration]);

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

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Audio</p>
          <h3 className="text-lg font-semibold text-foreground">{audio.title}</h3>
          <p className="text-xs text-muted-foreground">
            {audio.style ?? 'Style non précisé'} • {audio.bpm ? `${audio.bpm} BPM` : 'BPM n/a'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrevious} size="icon" variant="outline" disabled={selectedIndex === 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button onClick={handleToggle} size="icon" variant="outline">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={handleNext} size="icon" variant="outline" disabled={selectedIndex === audios.length - 1}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Select value={String(selectedIndex)} onValueChange={(value) => onSelect(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un rang" />
          </SelectTrigger>
          <SelectContent>
            {audios.map((audioItem, index) => (
              <SelectItem key={audioItem.id} value={String(index)}>
                {audioItem.rang} • {audioItem.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(event) => handleSeek(Number(event.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        {isBuffering && (
          <p className="text-xs text-muted-foreground">Chargement en cours...</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="w-full accent-primary"
        />
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
