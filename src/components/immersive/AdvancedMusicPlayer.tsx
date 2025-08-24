import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Heart, 
  Repeat,
  Shuffle,
  Music,
  Waves,
  Brain
} from 'lucide-react';
import { MusicWaveform } from './MusicWaveform';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  style: string;
  subject: string;
}

export const AdvancedMusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isLiked, setIsLiked] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const currentTrack: Track = {
    id: '1',
    title: 'Physiologie Cardiaque',
    artist: 'MED MNG AI',
    duration: 245,
    style: 'Lo-Fi Medical',
    subject: 'Cardiologie'
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= currentTrack.duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / currentTrack.duration) * 100;

  return (
    <Card className="w-full max-w-md mx-auto bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardContent className="p-0">
        {/* Album Art */}
        <div className="relative h-64 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated background */}
          <div className="absolute inset-0">
            {isPlaying && (
              <div className="absolute inset-0 animate-pulse">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-45" />
              </div>
            )}
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mb-4">
              <Brain className="h-16 w-16 text-white/90 mx-auto" />
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
              {currentTrack.style}
            </Badge>
          </div>

          {/* Waveform overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <MusicWaveform 
              isPlaying={isPlaying} 
              height={30} 
              barCount={24}
              color="bg-gradient-to-t from-white/40 to-white/60"
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Track Info */}
          <div className="text-center">
            <h3 className="text-white font-semibold text-lg mb-1">
              {currentTrack.title}
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              {currentTrack.artist}
            </p>
            <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/50">
              {currentTrack.subject}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={currentTrack.duration}
              onValueChange={(value) => setCurrentTime(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`text-gray-400 hover:text-white ${isShuffle ? 'text-purple-400' : ''}`}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`text-gray-400 hover:text-white ${isRepeat ? 'text-purple-400' : ''}`}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`${isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="flex items-center space-x-2 flex-1 max-w-24">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Slider
                value={[volume]}
                max={100}
                onValueChange={(value) => setVolume(value[0])}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};