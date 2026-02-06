import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Loader2, Trash2 } from 'lucide-react';

interface OfflineDownloadButtonProps {
  itemCode: string;
  item: any;
  isDownloaded: boolean;
  isDownloading: boolean;
  onDownload: (item: any) => void;
  onRemove: (itemCode: string) => void;
  compact?: boolean;
}

export const OfflineDownloadButton: React.FC<OfflineDownloadButtonProps> = ({
  itemCode,
  item,
  isDownloaded,
  isDownloading,
  onDownload,
  onRemove,
  compact = false,
}) => {
  if (isDownloading) {
    return (
      <Button
        variant="outline"
        size={compact ? 'icon' : 'sm'}
        disabled
        className="border-primary/30"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact && <span className="ml-1">Téléchargement...</span>}
      </Button>
    );
  }

  if (isDownloaded) {
    return (
      <Button
        variant="outline"
        size={compact ? 'icon' : 'sm'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(itemCode);
        }}
        className="border-success/30 text-success hover:text-destructive hover:border-destructive/30 group"
        title="Disponible hors-ligne — cliquer pour supprimer"
      >
        <span className="group-hover:hidden flex items-center gap-1">
          <Check className="h-4 w-4" />
          {!compact && 'Hors-ligne'}
        </span>
        <span className="hidden group-hover:flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          {!compact && 'Retirer'}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={compact ? 'icon' : 'sm'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDownload(item);
      }}
      className="border-muted-foreground/30 hover:border-primary/50 hover:text-primary"
      title="Télécharger pour révision hors-ligne"
    >
      <Download className="h-4 w-4" />
      {!compact && <span className="ml-1">Hors-ligne</span>}
    </Button>
  );
};
