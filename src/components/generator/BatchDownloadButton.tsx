/**
 * Bouton de téléchargement batch pour plusieurs pistes
 */

import React, { useState, useCallback } from 'react';
import { Download, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Track {
  id: string;
  title?: string;
  item_code?: string;
  rang?: string;
  audio_url: string;
}

interface BatchDownloadButtonProps {
  tracks: Track[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const BatchDownloadButton: React.FC<BatchDownloadButtonProps> = ({
  tracks,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const downloadTrack = async (track: Track): Promise<boolean> => {
    try {
      const response = await fetch(track.audio_url);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title || track.item_code || 'track'}-${track.rang || 'A'}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (err) {
      console.error(`Erreur téléchargement ${track.id}:`, err);
      return false;
    }
  };

  const handleBatchDownload = useCallback(async () => {
    if (tracks.length === 0 || isDownloading) return;
    
    setIsDownloading(true);
    setProgress(0);
    setDownloadedCount(0);
    setFailedCount(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < tracks.length; i++) {
      const success = await downloadTrack(tracks[i]);
      
      if (success) {
        successCount++;
        setDownloadedCount(successCount);
      } else {
        errorCount++;
        setFailedCount(errorCount);
      }
      
      setProgress(Math.round(((i + 1) / tracks.length) * 100));
      
      // Petit délai entre les téléchargements pour éviter les problèmes
      if (i < tracks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsDownloading(false);
    
    if (errorCount === 0) {
      toast.success(`✅ ${successCount} piste(s) téléchargée(s)`);
    } else if (successCount > 0) {
      toast.warning(`⚠️ ${successCount} réussie(s), ${errorCount} échouée(s)`);
    } else {
      toast.error('❌ Échec du téléchargement');
    }
  }, [tracks, isDownloading]);

  if (tracks.length === 0) return null;

  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        onClick={handleBatchDownload}
        disabled={disabled || isDownloading || tracks.length === 0}
        aria-label={`Télécharger ${tracks.length} piste(s)`}
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            {downloadedCount}/{tracks.length}
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Télécharger ({tracks.length})
          </>
        )}
      </Button>
      
      {isDownloading && (
        <div className="mt-2 space-y-1">
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" aria-hidden="true" />
              {downloadedCount} OK
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <XCircle className="h-3 w-3" aria-hidden="true" />
                {failedCount} erreur(s)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
