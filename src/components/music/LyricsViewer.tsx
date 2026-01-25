import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Search, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LyricLine {
  timestamp: number; // en secondes
  text: string;
  type?: 'verse' | 'chorus' | 'bridge' | 'outro';
}

interface LyricsViewerProps {
  lyrics: LyricLine[];
  currentTime: number;
  duration: number;
  _isPlaying?: boolean;
  onSeek: (time: number) => void;
  title?: string;
  artist?: string;
  itemCode?: string;
}

export const LyricsViewer: React.FC<LyricsViewerProps> = ({
  lyrics,
  currentTime,
  duration,
  onSeek,
  title,
  artist,
  itemCode
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [_highlightedIndex, _setHighlightedIndex] = useState(-1);
  const [showSections, _setShowSections] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Trouver la ligne actuelle basée sur le timestamp
  const currentLineIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.timestamp && (!nextLine || currentTime < nextLine.timestamp);
  });

  // Auto-scroll vers la ligne active
  useEffect(() => {
    if (activeLineRef.current && scrollAreaRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  // Recherche dans les paroles
  const filteredLyrics = lyrics.filter(line =>
    line.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionColor = (type?: string) => {
    switch (type) {
      case 'chorus': return 'bg-primary/10 border-primary/20';
      case 'verse': return 'bg-success/10 border-success/20';
      case 'bridge': return 'bg-accent/10 border-accent/20';
      case 'outro': return 'bg-warning/10 border-warning/20';
      default: return 'bg-muted/50 border-border';
    }
  };

  const getSectionLabel = (type?: string) => {
    switch (type) {
      case 'chorus': return 'Refrain';
      case 'verse': return 'Couplet';
      case 'bridge': return 'Pont';
      case 'outro': return 'Outro';
      default: return '';
    }
  };

  const jumpToSection = (type: string) => {
    const sectionLine = lyrics.find(line => line.type === type);
    if (sectionLine) {
      onSeek(sectionLine.timestamp);
    }
  };

  const sections = Array.from(new Set(lyrics.map(line => line.type).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Header avec infos de la chanson */}
      {(title || artist || itemCode) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {title && <h3 className="font-semibold text-lg">{title}</h3>}
                {artist && <p className="text-muted-foreground">{artist}</p>}
              </div>
              {itemCode && <Badge variant="secondary">{itemCode}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contrôles et navigation */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher dans les paroles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            />
          </div>

          {/* Navigation par sections */}
          {sections.length > 0 && showSections && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2">Aller à :</span>
              {sections.map((section) => (
                <Button
                  key={section}
                  variant="outline"
                  size="sm"
                  onClick={() => jumpToSection(section!)}
                  className="text-xs"
                >
                  {getSectionLabel(section)}
                </Button>
              ))}
            </div>
          )}

          {/* Contrôles audio */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => onSeek(Math.max(0, currentTime - 10))}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[80px] text-center">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <Button size="sm" variant="outline" onClick={() => onSeek(Math.min(duration, currentTime + 10))}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                onValueChange={(value) => onSeek(value[0])}
                max={duration}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paroles */}
      <Card>
        <ScrollArea className="h-[400px]" ref={scrollAreaRef}>
          <CardContent className="p-6 space-y-2">
            {(searchTerm ? filteredLyrics : lyrics).map((line, index) => {
              const isActive = index === currentLineIndex && !searchTerm;
              const isPast = currentTime > line.timestamp;
              
              return (
                <div
                  key={index}
                  ref={isActive ? activeLineRef : undefined}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all duration-300",
                    getSectionColor(line.type),
                    isActive && "ring-2 ring-primary ring-offset-2 shadow-lg scale-105",
                    isPast && !isActive && "opacity-60",
                    !isPast && !isActive && "hover:bg-muted/30"
                  )}
                  onClick={() => onSeek(line.timestamp)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {line.type && (
                        <Badge 
                          variant="outline" 
                          className="text-xs mb-1"
                        >
                          {getSectionLabel(line.type)}
                        </Badge>
                      )}
                      <p className={cn(
                        "text-sm leading-relaxed transition-all duration-300",
                        isActive && "text-lg font-medium text-primary",
                        isPast && !isActive && "text-muted-foreground"
                      )}>
                        {line.text}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTime(line.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {lyrics.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune parole disponible pour cette chanson</p>
              </div>
            )}
            
            {searchTerm && filteredLyrics.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun résultat pour "{searchTerm}"</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Légende des sections */}
      {sections.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">Légende :</span>
              {sections.map((section) => (
                <div key={section} className="flex items-center gap-1">
                  <div className={cn("w-3 h-3 rounded-sm border", getSectionColor(section))} />
                  <span>{getSectionLabel(section)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook pour utiliser les paroles avec un player audio
export const useLyricsSync = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const updatePlayState = () => setIsPlaying(!audio.paused);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', updatePlayState);
    audio.addEventListener('pause', updatePlayState);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', updatePlayState);
      audio.removeEventListener('pause', updatePlayState);
    };
  }, [audioRef]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return {
    currentTime,
    duration,
    isPlaying,
    seek
  };
};