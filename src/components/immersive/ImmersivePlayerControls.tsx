import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
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
  Download,
  Share2,
  Brain,
  Headphones,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { MusicWaveform } from './MusicWaveform';

interface ImmersivePlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  trackTitle: string;
  trackSubject: string;
  trackStyle: string;
}

export const ImmersivePlayerControls: React.FC<ImmersivePlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  trackTitle,
  trackSubject,
  trackStyle
}) => {
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [focusLevel, setFocusLevel] = useState(85);
  const [learningProgress, setLearningProgress] = useState(67);

  // Simulation des métriques d'apprentissage en temps réel
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setFocusLevel(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 5)));
        setLearningProgress(prev => Math.min(100, prev + 0.1));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStyleGradient = (style: string) => {
    switch (style.toLowerCase()) {
      case 'trap': return 'from-purple-500 to-pink-500';
      case 'lo-fi': return 'from-blue-400 to-cyan-400';
      case 'pop': return 'from-pink-400 to-rose-400';
      case 'jazz': return 'from-amber-500 to-orange-500';
      case 'afrobeat': return 'from-green-500 to-emerald-500';
      case 'classique': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <Card className="bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Artwork et métadonnées */}
        <div className="flex items-center space-x-6">
          <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getStyleGradient(trackStyle)} flex items-center justify-center relative overflow-hidden`}>
            <Brain className="h-8 w-8 text-white/90" />
            {isPlaying && (
              <div className="absolute inset-0 animate-pulse bg-white/10" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{trackTitle}</h3>
            <p className="text-gray-400 text-sm mb-2">{trackSubject}</p>
            <Badge className="bg-white/10 text-white border-white/20 text-xs">
              {trackStyle}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`${isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-400`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Visualiseur principal */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4">
          <MusicWaveform 
            isPlaying={isPlaying}
            height={60}
            barCount={40}
            color="bg-gradient-to-t from-purple-500/80 to-blue-500/80"
          />
        </div>

        {/* Métriques d'apprentissage */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-xs text-gray-400">Focus</span>
            </div>
            <div className="text-lg font-bold text-green-400">{focusLevel}%</div>
            <Progress value={focusLevel} className="h-1 mt-1" />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-4 w-4 text-blue-400 mr-1" />
              <span className="text-xs text-gray-400">Progression</span>
            </div>
            <div className="text-lg font-bold text-blue-400">{learningProgress.toFixed(0)}%</div>
            <Progress value={learningProgress} className="h-1 mt-1" />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-xs text-gray-400">Rétention</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">94%</div>
            <Progress value={94} className="h-1 mt-1" />
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => onSeek(value[0])}
            className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffle(!isShuffle)}
            className={`${isShuffle ? 'text-purple-400' : 'text-gray-400'} hover:text-white`}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button 
            size="lg"
            onClick={onPlayPause}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
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
            className={`${isRepeat ? 'text-purple-400' : 'text-gray-400'} hover:text-white`}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume et actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 max-w-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMute}
              className="text-gray-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(value) => onVolumeChange(value[0])}
              className="flex-1 [&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
            />
            <span className="text-xs text-gray-400 w-8">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Headphones className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};