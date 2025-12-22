import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SoberSongCardProps {
  song: {
    id: string;
    title: string;
    item_code?: string;
    specialty?: string;
    rang?: string;
    duration?: number;
    is_liked?: boolean;
    cover_url?: string;
  };
  onPlay: () => void;
  onToggleLike?: () => void;
  onRemove?: () => void;
  onAddToPlaylist?: () => void;
}

export const SoberSongCard: React.FC<SoberSongCardProps> = ({
  song,
  onPlay,
  onToggleLike,
  onRemove,
  onAddToPlaylist,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group p-4 bg-card hover:bg-secondary/30 border-border/40 hover:border-border/60 transition-all duration-200 hover:shadow-soft">
      <div className="flex items-start gap-3">
        {/* Play Button / Cover */}
        <button
          onClick={onPlay}
          className="relative w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
        >
          <Play className="h-6 w-6 text-primary" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-medium text-foreground truncate text-sm leading-tight">
            {song.title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {song.item_code && (
              <span className="font-mono">{song.item_code}</span>
            )}
            {song.specialty && (
              <>
                <span>•</span>
                <span className="truncate">{song.specialty}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {song.rang && (
              <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                Rang {song.rang}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDuration(song.duration)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleLike && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
            >
              <Heart 
                className={`h-4 w-4 ${song.is_liked ? 'fill-current text-destructive' : 'text-muted-foreground'}`} 
              />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAddToPlaylist && (
                <DropdownMenuItem onClick={onAddToPlaylist}>
                  Ajouter à une playlist
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  Retirer de la bibliothèque
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default SoberSongCard;
