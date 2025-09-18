import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { LyricsLine } from '@/hooks/useSynchronizedLyrics';
import { trackCanonicalEvent } from '@/services/CanonicalAnalyticsTracker';

interface KaraokeViewProps {
  segments: LyricsLine[];
  activeIndex: number;
  onSeek: (timeInSeconds: number) => void;
  className?: string;
  height?: number | string;
  highlightedIndexes?: number[];
  contentId?: string | null;
}

export const KaraokeView = ({
  segments,
  activeIndex,
  onSeek,
  className,
  height = 320,
  highlightedIndexes = [],
  contentId,
}: KaraokeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex < 0 || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const activeElement = container.querySelector<HTMLElement>(`[data-lyrics-index="${activeIndex}"]`);
    if (!activeElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            container.scrollTo({
              top: activeElement.offsetTop - container.clientHeight / 2 + activeElement.clientHeight / 2,
              behavior: 'smooth',
            });
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      },
    );

    observer.observe(activeElement);

    return () => {
      observer.disconnect();
    };
  }, [activeIndex]);

  const formatTime = (startMs: number) => {
    const totalSeconds = Math.floor(startMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (segment: LyricsLine, index: number) => {
    onSeek(segment.startMs / 1000);
    void trackCanonicalEvent({
      type: 'seek_segment',
      contentId: contentId ?? undefined,
      metadata: {
        segmentIndex: index,
        startMs: segment.startMs,
        endMs: segment.endMs,
        preview: segment.text?.slice(0, 120) ?? null,
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-y-auto rounded-lg border border-purple-500/40 bg-gradient-to-b from-purple-950/80 via-indigo-950/60 to-purple-900/50 p-4 text-white shadow-inner',
        className,
      )}
      style={{ height }}
    >
      {segments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Aucune parole synchronisée disponible</p>
      ) : (
        <div className="space-y-2">
          {segments.map((segment, index) => {
            const isActive = index === activeIndex;
            const isHighlighted = highlightedIndexes.includes(index);
            return (
              <button
                key={`${segment.startMs}-${index}`}
                data-lyrics-index={index}
                type="button"
                onClick={() => handleSeek(segment, index)}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/70',
                  isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-purple-900/40 backdrop-blur-sm'
                    : 'bg-white/5 text-white/80 hover:bg-white/10',
                  isHighlighted ? 'ring-2 ring-yellow-400/70' : null,
                )}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                  <span className="font-mono text-[11px]">{formatTime(segment.startMs)}</span>
                  {segment.role ? <span className="text-[10px] text-purple-200">{segment.role}</span> : null}
                </div>
                <p className={cn('mt-1 text-sm font-medium', isActive ? 'text-white' : 'text-white/80')}>{segment.text}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
