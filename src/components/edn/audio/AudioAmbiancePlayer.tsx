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

// Audio ambiances avec URLs fiables et fallbacks
const AMBIANCE_SOUNDS: Record<string, { url: string; label: string; fallback: string }> = {
  calme: { 
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb85e3f41.mp3', 
    label: 'Ambiance calme',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  },
  concentration: { 
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0ef9b37c2.mp3', 
    label: 'Concentration profonde',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  },
  urgence: { 
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_12ef79e8e3.mp3', 
    label: 'Rythme dynamique',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  },
  meditation: { 
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3', 
    label: 'Méditation',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  },
  nature: { 
    url: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9bd4170e4.mp3', 
    label: 'Sons de la nature',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  },
  default: { 
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', 
    label: 'Ambiance par défaut',
    fallback: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvuz5BJDxJQqeli'
  }
};

export const AudioAmbiancePlayer: React.FC<AudioAmbianceProps> = ({ 
  audioConfig, 
  itemCode 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Déterminer l'ambiance basée sur la config
  const mood = audioConfig?.mood?.toLowerCase() || 'default';
  const ambianceData = AMBIANCE_SOUNDS[mood] || AMBIANCE_SOUNDS[currentMood] || AMBIANCE_SOUNDS.default;
  const ambianceUrl = ambianceData.url;

  useEffect(() => {
    // Créer l'élément audio avec fallback
    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    
    // Try main URL, fallback if error
    audio.src = ambianceUrl;
    audio.onerror = () => {
      const fallbackUrl = ambianceData.fallback;
      if (fallbackUrl && audio.src !== fallbackUrl) {
        audio.src = fallbackUrl;
      }
    };
    
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [ambianceUrl, ambianceData.fallback, volume]);

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
      audioRef.current.play().catch(() => {
        // Audio play blocked - handled silently
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

  // Afficher un fallback si pas de config audio
  if (!audioConfig) {
    return (
      <Card className="bg-gradient-to-r from-muted/30 to-muted/10 border-muted-foreground/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
              <Music2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-muted-foreground text-sm">
                Ambiance audio
              </h4>
              <p className="text-xs text-muted-foreground/70">
                Aucune ambiance disponible pour cet item
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
              aria-label={isPlaying ? "Mettre en pause" : "Lecture"}
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
              aria-label={isMuted || volume === 0 ? "Activer le son" : "Couper le son"}
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

        {/* Mood selector */}
        <div className="mt-3 flex flex-wrap gap-1">
          {Object.entries(AMBIANCE_SOUNDS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                setCurrentMood(key);
                if (isPlaying && audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.src = data.url;
                  audioRef.current.play().catch(() => {});
                }
              }}
              className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                (mood === key || currentMood === key)
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {data.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
