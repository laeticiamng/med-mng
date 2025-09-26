import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  cover?: string;
}

interface GlobalMusicPlayerProps {
  tracks?: Track[];
  currentTrack?: Track | null;
  isPlaying?: boolean;
  className?: string;
}

export const GlobalMusicPlayer: React.FC<GlobalMusicPlayerProps> = ({
  tracks = [],
  currentTrack = null,
  isPlaying = false,
  className
}) => {
  const [internalIsPlaying, setInternalIsPlaying] = useState(isPlaying);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock track for demo
  const mockTrack: Track = {
    id: '1',
    title: 'Relaxation Cardiologie',
    artist: 'MED-MNG',
    duration: 180,
    url: '/audio/demo-track.mp3'
  };

  const activeTrack = currentTrack || mockTrack;
  const duration = activeTrack?.duration || 0;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setInternalIsPlaying(false);
      // Handle repeat/shuffle logic here
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (internalIsPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setInternalIsPlaying(!internalIsPlaying);
  };

  const handleProgressChange = (values: number[]) => {
    if (!audioRef.current) return;
    const newTime = values[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  if (!activeTrack) return null;

  return (
    <Card className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isMinimized && "h-16",
      !isMinimized && "h-24",
      className
    )}>
      <CardContent className="p-0">
        <audio
          ref={audioRef}
          src={activeTrack.url}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setCurrentTime(0);
            }
          }}
        />

        {/* Minimize/Maximize Button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Progress Bar (always visible) */}
        <div className="px-4 pt-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-2">
          {/* Track Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {activeTrack.cover && (
              <img
                src={activeTrack.cover}
                alt={activeTrack.title}
                className="w-10 h-10 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{activeTrack.title}</p>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground truncate">
                  {activeTrack.artist}
                </p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleShuffle}
                  className={cn(
                    "h-8 w-8 p-0",
                    isShuffled && "text-primary"
                  )}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <SkipBack className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={togglePlayPause}
              className="h-8 w-8 p-0"
            >
              {internalIsPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {!isMinimized && (
              <>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleRepeat}
                  className={cn(
                    "h-8 w-8 p-0",
                    repeatMode !== 'none' && "text-primary"
                  )}
                >
                  <Repeat className="h-4 w-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute top-0 right-0 text-xs">1</span>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Time and Volume */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 justify-end">
            {!isMinimized && (
              <>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMusicPlayer;