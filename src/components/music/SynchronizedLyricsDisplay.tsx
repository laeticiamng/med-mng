import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { LyricsLine } from '@/hooks/useSynchronizedLyrics';

interface SynchronizedLyricsDisplayProps {
  lyrics: LyricsLine[];
  currentLineIndex: number;
  onLineClick?: (lineIndex: number) => void;
  variant?: 'karaoke' | 'scroll' | 'highlight';
  className?: string;
}

export const SynchronizedLyricsDisplay: React.FC<SynchronizedLyricsDisplayProps> = ({
  lyrics,
  currentLineIndex,
  onLineClick,
  variant = 'scroll',
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current line
  useEffect(() => {
    if (currentLineRef.current && containerRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  if (variant === 'karaoke') {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[200px] p-6", className)}>
        {/* Previous line (faded) */}
        {currentLineIndex > 0 && (
          <p className="text-lg text-muted-foreground/50 mb-2 transition-all duration-300">
            {lyrics[currentLineIndex - 1]?.text}
          </p>
        )}
        
        {/* Current line (highlighted) */}
        <p 
          className="text-2xl md:text-3xl font-bold text-primary animate-pulse transition-all duration-300"
          style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
        >
          {lyrics[currentLineIndex]?.text || '♪ ♫ ♪'}
        </p>
        
        {/* Next line (faded) */}
        {currentLineIndex < lyrics.length - 1 && (
          <p className="text-lg text-muted-foreground/50 mt-2 transition-all duration-300">
            {lyrics[currentLineIndex + 1]?.text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'highlight') {
    return (
      <div className={cn("p-4 space-y-1", className)}>
        {lyrics.map((line, index) => (
          <p
            key={index}
            onClick={() => onLineClick?.(index)}
            className={cn(
              "px-3 py-1 rounded-lg cursor-pointer transition-all duration-300",
              index === currentLineIndex
                ? "bg-primary text-primary-foreground font-medium scale-105"
                : index < currentLineIndex
                ? "text-muted-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            {line.text}
          </p>
        ))}
      </div>
    );
  }

  // Default: scroll variant
  return (
    <div 
      ref={containerRef}
      className={cn("h-[300px] overflow-y-auto p-4 space-y-2", className)}
    >
      {lyrics.map((line, index) => (
        <div
          key={index}
          ref={index === currentLineIndex ? currentLineRef : undefined}
          onClick={() => onLineClick?.(index)}
          className={cn(
            "px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 text-center",
            index === currentLineIndex
              ? "bg-primary/20 text-primary font-semibold text-lg border-l-4 border-primary"
              : index < currentLineIndex
              ? "text-muted-foreground text-sm opacity-60"
              : "text-foreground text-sm hover:bg-muted"
          )}
        >
          <span className="text-xs text-muted-foreground mr-2">
            {formatTime(line.time)}
          </span>
          {line.text}
        </div>
      ))}
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
