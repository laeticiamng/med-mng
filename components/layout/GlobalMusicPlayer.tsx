import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  Share,
  ChevronUp,
  ChevronDown,
  Music,
  Clock,
  Headphones
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  category: string;
}

export const GlobalMusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Track exemple pour la démo
  useEffect(() => {
    setCurrentTrack({
      id: "demo-1",
      title: "Insuffisance Cardiaque - Les Bases",
      artist: "MED-MNG IA",
      duration: 180,
      audioUrl: "/demo-track.mp3",
      category: "Cardiologie"
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    // Logique pour piste précédente
    setCurrentTime(0);
  };

  const handleNext = () => {
    // Logique pour piste suivante
    setCurrentTime(0);
  };

  const handleTimeChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Version compacte */}
      <Card className={cn(
        "border-t bg-card/95 backdrop-blur-lg transition-all duration-300",
        isExpanded ? "rounded-none" : "border-x-0 border-b-0"
      )}>
        <div className="p-4">
          {/* Barre compacte */}
          <div className="flex items-center space-x-4">
            {/* Info track */}
            <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                 onClick={() => setIsExpanded(!isExpanded)}>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="truncate">{currentTrack.artist}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {currentTrack.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contrôles principaux */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="h-10 w-10 p-0 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Temps et volume (desktop uniquement) */}
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <div className="w-32">
                <Slider
                  value={[currentTime]}
                  max={currentTrack.duration}
                  step={1}
                  onValueChange={handleTimeChange}
                  className="w-full"
                />
              </div>
              
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(currentTrack.duration)}
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-8 w-8 p-0"
                >
                  {isMuted || volume[0] === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                
                <div className="w-16">
                  <Slider
                    value={isMuted ? [0] : volume}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Toggle expand */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Barre de progression mobile */}
          <div className="md:hidden mt-3">
            <Slider
              value={[currentTime]}
              max={currentTrack.duration}
              step={1}
              onValueChange={handleTimeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>
        </div>

        {/* Version étendue */}
        {isExpanded && (
          <div className="border-t bg-background/50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Informations détaillées */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                      <Music className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1">{currentTrack.title}</h3>
                      <p className="text-muted-foreground mb-2">{currentTrack.artist}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{currentTrack.category}</Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(currentTrack.duration)}</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Headphones className="w-3 h-3" />
                          <span>Haute qualité</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsLiked(!isLiked)}
                      className="flex items-center space-x-2"
                    >
                      <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                      <span>Aimer</span>
                    </Button>
                    
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Share className="w-4 h-4" />
                      <span>Partager</span>
                    </Button>

                    <Button
                      variant={isRepeat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsRepeat(!isRepeat)}
                    >
                      <Repeat className="w-4 h-4" />
                    </Button>

                    <Button
                      variant={isShuffle ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsShuffle(!isShuffle)}
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contrôles avancés */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Égaliseur</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {['60Hz', '170Hz', '310Hz', '600Hz', '1kHz'].map((freq) => (
                        <div key={freq} className="text-center">
                          <div className="h-20 bg-muted rounded-lg mb-2 relative overflow-hidden">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-primary rounded-lg transition-all"
                              style={{ height: `${Math.random() * 80 + 20}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{freq}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Effets audio</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="justify-start">
                        Réverbération
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Amélioration vocale
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Bass boost
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        Mode nuit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};