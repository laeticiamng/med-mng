/**
 * Bouton de téléchargement batch pour plusieurs pistes
 * ✅ Enrichi: Ajout du téléchargement en parallèle, retry automatique, annulation
 */

import React, { useState, useCallback, useRef } from 'react';
import { Download, Loader2, CheckCircle2, XCircle, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { BatchDownloadTrack } from '@/types/music';

interface BatchDownloadButtonProps {
  tracks: BatchDownloadTrack[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  maxParallel?: number;
  showProgress?: boolean;
}

export const BatchDownloadButton: React.FC<BatchDownloadButtonProps> = ({
  tracks,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  maxParallel = 3,
  showProgress = true
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const abortRef = useRef(false);

  // ✅ Télécharger une piste avec retry
  const downloadTrack = async (track: BatchDownloadTrack, retries = 2): Promise<boolean> => {
    if (abortRef.current) return false;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(track.audio_url, {
          mode: 'cors',
          cache: 'force-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Vérifier que le blob est valide
        if (blob.size === 0) {
          throw new Error('Fichier vide');
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // ✅ Nom de fichier amélioré
        const filename = [
          track.title || track.item_code || 'musique',
          track.rang ? `Rang-${track.rang}` : '',
          track.music_style || ''
        ].filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '') + '.mp3';
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return true;
      } catch (err) {
        console.warn(`Téléchargement ${track.id} - tentative ${attempt + 1}/${retries + 1}:`, err);
        
        if (attempt < retries && !abortRef.current) {
          // Attendre avant retry (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    console.error(`Échec téléchargement ${track.id} après ${retries + 1} tentatives`);
    return false;
  };

  // ✅ Téléchargement parallèle avec concurrence limitée
  const handleBatchDownload = useCallback(async () => {
    if (tracks.length === 0 || isDownloading) return;
    
    abortRef.current = false;
    setIsDownloading(true);
    setProgress(0);
    setDownloadedCount(0);
    setFailedCount(0);

    let successCount = 0;
    let errorCount = 0;
    let completed = 0;

    // ✅ Chunker les téléchargements par groupes de maxParallel
    const chunks: BatchDownloadTrack[][] = [];
    for (let i = 0; i < tracks.length; i += maxParallel) {
      chunks.push(tracks.slice(i, i + maxParallel));
    }

    for (const chunk of chunks) {
      if (abortRef.current) break;
      
      // Télécharger le chunk en parallèle
      const results = await Promise.all(
        chunk.map(track => downloadTrack(track))
      );
      
      // Compter les résultats
      results.forEach(success => {
        completed++;
        if (success) {
          successCount++;
          setDownloadedCount(prev => prev + 1);
        } else {
          errorCount++;
          setFailedCount(prev => prev + 1);
        }
        setProgress(Math.round((completed / tracks.length) * 100));
      });
      
      // Petit délai entre les chunks
      if (chunks.indexOf(chunk) < chunks.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setIsDownloading(false);
    
    if (abortRef.current) {
      toast.info(`Téléchargement annulé (${successCount} réussie(s))`);
    } else if (errorCount === 0) {
      toast.success(`✅ ${successCount} piste(s) téléchargée(s)`);
    } else if (successCount > 0) {
      toast.warning(`⚠️ ${successCount} réussie(s), ${errorCount} échouée(s)`);
    } else {
      toast.error('❌ Échec du téléchargement');
    }
  }, [tracks, isDownloading, maxParallel]);

  // ✅ Annuler le téléchargement
  const handleCancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  if (tracks.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            aria-label="Annuler le téléchargement"
            className="text-destructive hover:text-destructive"
          >
            <StopCircle className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      
      {showProgress && isDownloading && (
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
            <span className="text-muted-foreground/70">
              {progress}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
