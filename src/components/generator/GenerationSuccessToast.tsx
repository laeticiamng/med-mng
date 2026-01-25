/**
 * Toast de succès de génération avec actions
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Heart, Music, Play, Share2 } from 'lucide-react';
import React from 'react';

interface GenerationSuccessToastProps {
  title: string;
  _audioUrl?: string;
  rang?: string;
  onPlay: () => void;
  onDownload: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  className?: string;
}

export const GenerationSuccessToast: React.FC<GenerationSuccessToastProps> = ({
  title,
  rang,
  onPlay,
  onDownload,
  onFavorite,
  onShare,
  className
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
          <Music className="h-4 w-4 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          {rang && (
            <p className="text-xs text-muted-foreground">
              Rang {rang} • Prêt à écouter
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="default"
          className="h-7 text-xs gap-1"
          onClick={onPlay}
        >
          <Play className="h-3 w-3" />
          Écouter
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1"
          onClick={onDownload}
        >
          <Download className="h-3 w-3" />
        </Button>
        
        {onFavorite && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onFavorite}
          >
            <Heart className="h-3 w-3" />
          </Button>
        )}
        
        {onShare && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onShare}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Helper pour afficher le toast de succès
 */
export const showGenerationSuccessToast = (
  toast: any, // Type from sonner
  options: Omit<GenerationSuccessToastProps, 'className'>
) => {
  toast.custom(
    (_t: any) => (
      <div className="bg-card border rounded-lg shadow-lg p-3 max-w-sm">
        <GenerationSuccessToast {...options} />
      </div>
    ),
    {
      duration: 8000,
      position: 'bottom-right'
    }
  );
};
