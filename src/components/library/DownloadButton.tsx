import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DownloadButtonProps {
  audioUrl: string;
  title: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  audioUrl,
  title,
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState(false);

  const handleDownload = async () => {
    if (!audioUrl) {
      toast.error('URL audio non disponible');
      return;
    }

    setIsDownloading(true);
    setError(false);
    setDownloadComplete(false);

    try {
      // Fetch the audio file
      const response = await fetch(audioUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Sanitize filename
      const sanitizedTitle = title
        .replace(/[^a-zA-Z0-9\s\-àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .substring(0, 100);
      
      a.download = `${sanitizedTitle || 'musique'}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadComplete(true);
      toast.success('Téléchargement terminé !');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setDownloadComplete(false);
      }, 3000);
      
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      setError(true);
      toast.error('Échec du téléchargement. Réessayez.');
      
      // Reset error after 3 seconds
      setTimeout(() => {
        setError(false);
      }, 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={error ? 'destructive' : variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading || !audioUrl}
      className={className}
      title={error ? 'Erreur - Réessayer' : downloadComplete ? 'Téléchargé !' : 'Télécharger MP3'}
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : downloadComplete ? (
        <Check className="h-4 w-4 text-success" />
      ) : error ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {size !== 'icon' && (
        <span className="ml-1.5 hidden sm:inline">
          {isDownloading ? 'Téléchargement...' : downloadComplete ? 'Téléchargé' : 'MP3'}
        </span>
      )}
    </Button>
  );
};
