import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface LyricsLine {
  time: number;
  text: string;
  duration?: number;
}

interface SynchronizedLyricsPlayerProps {
  audioUrl: string;
  lyrics: LyricsLine[];
  title: string;
  waveform?: number[];
  onTimeUpdate?: (currentTime: number) => void;
}

export const SynchronizedLyricsPlayer: React.FC<SynchronizedLyricsPlayerProps> = ({
  audioUrl,
  lyrics,
  title,
  waveform = [],
  onTimeUpdate
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);

  // Initialiser l'audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
      
      // Trouver la ligne de paroles actuelle
      const currentIndex = lyrics.findIndex((lyric, index) => {
        const nextLyric = lyrics[index + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      
      setCurrentLyricIndex(currentIndex);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentLyricIndex(-1);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [lyrics, onTimeUpdate]);

  // Auto-scroll des paroles
  useEffect(() => {
    if (currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const currentElement = container.children[currentLyricIndex] as HTMLElement;
      
      if (currentElement) {
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentLyricIndex]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const volumeValue = newVolume / 100;
    audio.volume = volumeValue;
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
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

  const skipBackward = () => {
    handleSeek(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    handleSeek(Math.min(duration, currentTime + 10));
  };

  const seekToLyric = (time: number) => {
    handleSeek(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    if (!waveform.length) return null;

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div className="relative h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center">
          {waveform.map((amplitude, index) => (
            <div
              key={index}
              className={`w-1 mx-px transition-colors duration-200 ${
                (index / waveform.length) * 100 <= progress
                  ? 'bg-blue-600'
                  : 'bg-blue-300'
              }`}
              style={{ height: `${Math.max(2, amplitude * 60)}px` }}
            />
          ))}
        </div>
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 transition-all duration-100"
          style={{ left: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-purple-800">
          <Play className="h-6 w-6" />
          Paroles Synchronisées - {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Waveform */}
        {renderWaveform()}

        {/* Controls principaux */}
        <div className="flex items-center justify-center gap-4 p-4 bg-white/60 rounded-lg border border-purple-200">
          <Button onClick={skipBackward} variant="outline" size="sm">
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={togglePlayPause}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button onClick={skipForward} variant="outline" size="sm">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-purple-700">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => handleSeek(value)}
            className="w-full"
          />
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-purple-200">
          <Button onClick={toggleMute} variant="outline" size="sm">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => handleVolumeChange(value)}
            className="flex-1"
          />
        </div>

        {/* Lyrics Display */}
        <div 
          ref={lyricsContainerRef}
          className="max-h-80 overflow-y-auto bg-white/80 rounded-lg border border-purple-200 p-4 space-y-2"
        >
          {lyrics.length > 0 ? (
            lyrics.map((lyric, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg transition-all duration-300 cursor-pointer hover:bg-purple-100 ${
                  index === currentLyricIndex
                    ? 'bg-gradient-to-r from-purple-200 to-pink-200 border-l-4 border-purple-500 text-purple-900 font-semibold scale-105'
                    : index < currentLyricIndex
                    ? 'text-gray-500 bg-gray-50'
                    : 'text-gray-700 bg-white hover:bg-purple-50'
                }`}
                onClick={() => seekToLyric(lyric.time)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm">{lyric.text}</span>
                  <span className="text-xs text-purple-600 ml-2">
                    {formatTime(lyric.time)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune parole synchronisée disponible
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {lyrics.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
            <div className="flex justify-between text-sm text-purple-700 mb-2">
              <span>Progression</span>
              <span>{currentLyricIndex + 1} / {lyrics.length}</span>
            </div>
            <Progress 
              value={lyrics.length > 0 ? ((currentLyricIndex + 1) / lyrics.length) * 100 : 0} 
              className="w-full"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};