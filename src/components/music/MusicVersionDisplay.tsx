import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface MusicVersionDisplayProps {
  rang: 'A' | 'B' | 'AB';
  title: string;
  version1Url?: string;
  version2Url?: string;
  currentTrack?: string;
  isPlaying: boolean;
  onPlayPause: (audioUrl: string, title: string) => void;
  style?: string;
  duration?: number;
}

export const MusicVersionDisplay: React.FC<MusicVersionDisplayProps> = ({
  rang,
  title,
  version1Url,
  version2Url,
  currentTrack,
  isPlaying,
  onPlayPause,
  style,
  duration
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!version1Url && !version2Url) {
    return null;
  }

  const rangColors = {
    A: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    B: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    AB: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800'
  };

  const rangAccents = {
    A: 'text-blue-600 dark:text-blue-400',
    B: 'text-green-600 dark:text-green-400', 
    AB: 'text-purple-600 dark:text-purple-400'
  };

  return (
    <div className={`p-4 border rounded-lg ${rangColors[rang]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className={`h-5 w-5 ${rangAccents[rang]}`} />
        <h3 className={`font-semibold ${rangAccents[rang]}`}>
          {title}
        </h3>
        {style && (
          <span className="text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded">
            {style}
          </span>
        )}
        {duration && (
          <span className="text-sm text-muted-foreground">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Version 1 */}
        {version1Url && (
          <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPlayPause(version1Url, `${title} - Version 1`)}
              className="flex items-center gap-2"
            >
              {currentTrack === version1Url && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Version 1
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentTrack === version1Url && isPlaying ? '🎵 En cours de lecture' : '▶️ Prêt à écouter'}
            </span>
          </div>
        )}

        {/* Version 2 */}
        {version2Url && (
          <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPlayPause(version2Url, `${title} - Version 2`)}
              className="flex items-center gap-2"
            >
              {currentTrack === version2Url && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Version 2
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentTrack === version2Url && isPlaying ? '🎵 En cours de lecture' : '▶️ Prêt à écouter'}
            </span>
          </div>
        )}

        {/* Statut selon documentation Suno */}
        <div className="text-xs text-muted-foreground mt-2 p-2 bg-background/30 rounded">
          📖 <strong>Documentation Suno:</strong> Chaque génération produit exactement 2 versions
          {version1Url && version2Url 
            ? ' ✅ Les 2 versions sont disponibles'
            : ' ⏳ En attente de toutes les versions'
          }
        </div>
      </div>
    </div>
  );
};