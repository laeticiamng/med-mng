import { Button } from '@/components/ui/button';
import { Download, Music, Play, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface GenerationToastData {
  title: string;
  style: string;
  rang: string;
  audioUrl: string;
  trackId: string;
  duration?: number;
}

/**
 * Affiche un toast enrichi pour une génération réussie
 */
export const showGenerationSuccessToast = ({
  title,
  style,
  rang,
  audioUrl,
  trackId,
  duration
}: GenerationToastData) => {
  toast.custom(
    (t) => (
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-sm w-full animate-in slide-in-from-top-2 duration-300">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/5 rounded-lg flex items-center justify-center shrink-0">
            <Music className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">
              🎵 Musique générée !
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {title || `${rang} - ${style}`}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium">
            Rang {rang}
          </span>
          <span>•</span>
          <span className="truncate">{style}</span>
          {duration && (
            <>
              <span>•</span>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1 h-8 text-xs"
            onClick={() => {
              // Play audio
              const audio = new Audio(audioUrl);
              audio.play().catch(console.error);
              toast.dismiss(t);
            }}
          >
            <Play className="h-3 w-3 mr-1" />
            Écouter
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={async () => {
              try {
                const response = await fetch(audioUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title || 'music'}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Téléchargement démarré');
              } catch (err) {
                toast.error('Erreur téléchargement');
              }
              toast.dismiss(t);
            }}
            title="Télécharger"
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const shareUrl = `${window.location.origin}/shared-music/${trackId}`;
              navigator.clipboard.writeText(shareUrl);
              toast.success('Lien copié !');
              toast.dismiss(t);
            }}
            title="Copier le lien"
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    ),
    {
      duration: 8000,
      position: 'top-right'
    }
  );
};

/**
 * Affiche un toast de progression
 */
export const showGenerationProgressToast = (rang: string, progress: number) => {
  const toastId = `generation-progress-${rang}`;
  
  toast.loading(
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div>
        <p className="font-medium text-sm">Génération Rang {rang}</p>
        <p className="text-xs text-muted-foreground">{progress}% complété...</p>
      </div>
    </div>,
    {
      id: toastId,
      duration: Infinity
    }
  );
  
  return toastId;
};

/**
 * Ferme un toast de progression
 */
export const dismissProgressToast = (toastId: string) => {
  toast.dismiss(toastId);
};
