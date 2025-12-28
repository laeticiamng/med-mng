import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Pause, Music2, Waves } from 'lucide-react';

interface AudioAmbianceProps {
  audioConfig?: {
    style?: string;
    bpm?: number;
    mood?: string;
    instruments?: string[];
    ambiance_type?: string;
    intensity?: string;
  };
  itemCode: string;
}

// Audio ambiances génériques basées sur le mood médical
const AMBIANCE_SOUNDS: Record<string, string> = {
  calme: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb85e3f41.mp3',
  concentration: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0ef9b37c2.mp3',
  urgence: 'https://cdn.pixabay.com/audio/2022/10/25/audio_12ef79e8e3.mp3',
  default: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'
};

export const AudioAmbiancePlayer: React.FC<AudioAmbianceProps> = ({ 
  audioConfig, 
  itemCode 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Déterminer l'ambiance basée sur la config
  const mood = audioConfig?.mood?.toLowerCase() || 'default';
  const ambianceUrl = AMBIANCE_SOUNDS[mood] || AMBIANCE_SOUNDS.default;

  useEffect(() => {
    // Créer l'élément audio
    audioRef.current = new Audio(ambianceUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ambianceUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.log('Audio play blocked:', err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  if (!audioConfig) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              {isPlaying ? (
                <Waves className="h-6 w-6 text-primary animate-pulse" />
              ) : (
                <Music2 className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm">
              Ambiance {audioConfig.style || 'Médicale'}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {audioConfig.mood && `Mood: ${audioConfig.mood}`}
              {audioConfig.bpm && ` • ${audioConfig.bpm} BPM`}
              {audioConfig.intensity && ` • ${audioConfig.intensity}`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-primary" />
              ) : (
                <Play className="h-5 w-5 text-primary ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>

            <div className="w-20 hidden sm:block">
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Instruments tags */}
        {audioConfig.instruments && audioConfig.instruments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {audioConfig.instruments.slice(0, 4).map((instrument, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
              >
                {instrument}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
