import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Music,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

interface GlobalMusicPlayerProps {
  className?: string;
}

export const GlobalMusicPlayer = ({ className = '' }: GlobalMusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "La relation médecin-malade",
    artist: "EDN Item IC-1",
    album: "Compétences Médicales"
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          setIsPlaying(true);
          void trackCanonicalEvent({
            type: 'play',
            metadata: {
              title: currentTrack.title,
              artist: currentTrack.artist,
              album: currentTrack.album,
              context: 'global-player',
            },
          });
        })
        .catch((error) => {
          console.warn('[global-player] unable to start playback', error);
        });
      return;
    }

    setIsPlaying(true);
    void trackCanonicalEvent({
      type: 'play',
      metadata: {
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        context: 'global-player',
      },
    });
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <Card className="p-3 bg-background/95 backdrop-blur shadow-lg border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-32">
                {currentTrack.title}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-32">
                {currentTrack.artist}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <Card className="rounded-none border-t border-l-0 border-r-0 border-b-0 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={togglePlay}
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-2 w-full">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  onValueChange={handleTimeChange}
                  max={duration}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2 flex-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 hidden sm:flex"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-20 hidden sm:block"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 ml-2"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Hidden audio element for future functionality */}
      <audio ref={audioRef} />
    </div>
  );
};