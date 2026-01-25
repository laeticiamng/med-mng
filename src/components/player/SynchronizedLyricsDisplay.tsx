import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Music2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface LyricLine {
  time: number; // in seconds
  text: string;
  isSection?: boolean;
}

interface SynchronizedLyricsDisplayProps {
  lyrics: string;
  currentTime: number; // in seconds
  duration: number;
  isPlaying?: boolean;
  onSeek?: (time: number) => void;
}

export const SynchronizedLyricsDisplay: React.FC<SynchronizedLyricsDisplayProps> = ({
  lyrics,
  currentTime,
  duration,
  isPlaying = false,
  onSeek
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Parse lyrics into timed lines
  const parsedLyrics: LyricLine[] = useMemo(() => {
    if (!lyrics) return [];
    
    const lines = lyrics.split('\n').filter(line => line.trim());
    const totalLines = lines.length;
    
    if (totalLines === 0 || duration <= 0) return [];
    
    // Distribute time evenly across lines
    const timePerLine = duration / totalLines;
    
    return lines.map((text, index) => {
      const isSection = text.startsWith('[') || text.startsWith('---') || text.includes('COUPLET') || text.includes('REFRAIN');
      return {
        time: index * timePerLine,
        text: text.trim(),
        isSection
      };
    });
  }, [lyrics, duration]);

  // Find current active line
  const activeLineIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    
    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= parsedLyrics[i].time) {
        return i;
      }
    }
    return 0;
  }, [parsedLyrics, currentTime]);

  // Auto-scroll to active line
  useEffect(() => {
    if (autoScroll && activeLineRef.current && isPlaying) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex, autoScroll, isPlaying]);

  // Handle manual scroll
  const scrollToLine = (direction: 'up' | 'down') => {
    setAutoScroll(false);
    const targetIndex = direction === 'up' 
      ? Math.max(0, activeLineIndex - 5)
      : Math.min(parsedLyrics.length - 1, activeLineIndex + 5);
    
    if (onSeek && parsedLyrics[targetIndex]) {
      onSeek(parsedLyrics[targetIndex].time);
    }
  };

  if (!lyrics || parsedLyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Music2 className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">Paroles non disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="gap-1.5">
          <Music2 className="h-3 w-3" />
          Paroles synchronisées
        </Badge>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollToLine('up')}
            disabled={activeLineIndex <= 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollToLine('down')}
            disabled={activeLineIndex >= parsedLyrics.length - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            variant={autoScroll ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Lyrics display */}
      <ScrollArea className="h-64 rounded-lg border border-border/30 bg-card/50 p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
          {parsedLyrics.map((line, index) => {
            const isActive = index === activeLineIndex;
            const isPast = index < activeLineIndex;
            return (
              <div
                key={index}
                ref={isActive ? activeLineRef : null}
                className={`
                  py-2 px-3 rounded-lg transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'bg-primary/20 border-l-4 border-primary scale-[1.02] shadow-md' 
                    : isPast 
                      ? 'opacity-50 hover:opacity-75' 
                      : 'opacity-70 hover:opacity-90'
                  }
                  ${line.isSection 
                    ? 'font-bold text-primary text-center my-4 bg-primary/5' 
                    : ''
                  }
                `}
                onClick={() => {
                  setAutoScroll(false);
                  onSeek?.(line.time);
                }}
              >
                <p className={`
                  ${isActive 
                    ? 'text-lg font-semibold text-foreground' 
                    : 'text-base text-muted-foreground'
                  }
                  ${line.isSection ? 'text-sm uppercase tracking-wider' : ''}
                `}>
                  {line.text}
                </p>
                {isActive && isPlaying && (
                  <div className="h-0.5 bg-primary mt-2 animate-pulse rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Progress indicator */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>Ligne {activeLineIndex + 1} / {parsedLyrics.length}</span>
        <span>{Math.round((activeLineIndex / parsedLyrics.length) * 100)}% complété</span>
      </div>
    </div>
  );
};
