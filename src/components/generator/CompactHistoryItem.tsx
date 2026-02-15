/**
 * Item compact pour l'historique sur mobile
 * ✅ NOUVEAU: Mode compact pour affichage mobile optimisé
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, Heart, Pause, Play, Trash2 } from 'lucide-react';
import React from 'react';

interface CompactHistoryItemProps {
  _id?: string;
  title?: string;
  item_code: string;
  rang: string;
  music_style: string;
  audio_url: string;
  created_at: string;
  is_favorite?: boolean;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export const CompactHistoryItem: React.FC<CompactHistoryItemProps> = React.memo(function CompactHistoryItem({
  title,
  item_code,
  rang,
  music_style,
  created_at,
  is_favorite,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onToggleFavorite,
  onDownload,
  onDelete
}) {
  const displayTitle = title || `${item_code} - ${music_style}`;
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr });

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        isCurrentTrack ? "bg-primary/10 border border-primary/20" : "bg-muted/30 hover:bg-muted/50"
      )}
    >
      {/* Bouton Play/Pause */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPlay}
        className={cn(
          "h-8 w-8 p-0 rounded-full shrink-0",
          isCurrentTrack && isPlaying && "bg-primary text-primary-foreground"
        )}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Infos principales */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayTitle}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline" className="h-4 px-1 text-[10px]">
            {rang}
          </Badge>
          <span>•</span>
          <span className="truncate">{timeAgo}</span>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className={cn(
            "h-7 w-7 p-0",
            is_favorite && "text-destructive"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", is_favorite && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="h-7 w-7 p-0"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
});
