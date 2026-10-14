import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

/** Paliers de zoom : 1 = image entière dans l'écran, au-delà elle défile dans la visionneuse. */
const PALIERS_ZOOM = [1, 1.5, 2, 3, 4] as const;

interface VisionneuseImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  /** Description de l'image (texte alternatif). */
  alt: string;
  /** Titre court, annoncé à l'ouverture (« Planche 3 — … »). */
  titre: string;
  /** Élément qui reçoit le focus à la fermeture (le bouton qui a ouvert la visionneuse). */
  retourFocus?: React.RefObject<HTMLElement>;
}

/**
 * Visionneuse d'une image en grand : image entière à l'ouverture (jamais
 * recadrée), puis zoom par boutons ou touches (+, −, 0) ; au-delà de 100 %,
 * on fait défiler l'image (doigt, molette, flèches) ou on pince l'écran sur
 * mobile (`touch-action: pinch-zoom` conservé). Boîte de dialogue Radix :
 * focus piégé, Échap et bouton « Fermer » rendent le focus au bouton qui l'a
 * ouverte.
 */
export const VisionneuseImage: React.FC<VisionneuseImageProps> = ({
  open,
  onOpenChange,
  src,
  alt,
  titre,
  retourFocus,
}) => {
  const [palier, setPalier] = useState(0);
  const zoom = PALIERS_ZOOM[palier];

  // Chaque ouverture repart sur l'image entière.
  useEffect(() => {
    if (open) setPalier(0);
  }, [open, src]);

  const zoomer = useCallback(
    () => setPalier((p) => Math.min(p + 1, PALIERS_ZOOM.length - 1)),
    []
  );
  const dezoomer = useCallback(() => setPalier((p) => Math.max(p - 1, 0)), []);
  const ajuster = useCallback(() => setPalier(0), []);

  const surTouche = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomer();
    } else if (e.key === '-') {
      e.preventDefault();
      dezoomer();
    } else if (e.key === '0') {
      e.preventDefault();
      ajuster();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-visionneuse=""
        // Échap ferme seulement la visionneuse : la page de l'item écoute aussi Échap (retour à la liste).
        onEscapeKeyDown={(e) => e.stopPropagation()}
        onKeyDown={surTouche}
        // Sans <DialogTrigger>, Radix ne sait pas où rendre le focus : on le lui indique.
        onCloseAutoFocus={(e) => {
          if (retourFocus?.current) {
            e.preventDefault();
            retourFocus.current.focus();
          }
        }}
        className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:h-[90vh] sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-5xl sm:rounded-lg"
      >
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 pr-14">
          <div className="min-w-0 flex-1 basis-48">
            <DialogTitle className="truncate text-base leading-tight">
              {titre}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Image agrandie. Les boutons de zoom, ou les touches plus, moins et
              zéro, règlent la taille ; faites défiler l'image pour la
              parcourir.
            </DialogDescription>
          </div>
          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Zoom"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={dezoomer}
              disabled={palier === 0}
              aria-label="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span
              className="min-w-[3.25rem] text-center text-sm tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              {Math.round(zoom * 100)} %
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={zoomer}
              disabled={palier === PALIERS_ZOOM.length - 1}
              aria-label="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={ajuster}
              disabled={palier === 0}
              aria-label="Ajuster à l'écran"
            >
              {palier === 0 ? (
                <Maximize className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Minimize className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Zone défilante, focusable au clavier (flèches, Pg↑/Pg↓) ; pincer reste possible au doigt. */}
        <div
          role="region"
          aria-label="Image agrandie : faites défiler pour la parcourir"
          tabIndex={0}
          className="min-h-0 flex-1 touch-pan-x touch-pan-y touch-pinch-zoom overflow-auto bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            data-zoom={zoom}
            className={
              palier === 0
                ? 'mx-auto block h-full w-full object-contain'
                : 'mx-auto block h-auto max-w-none'
            }
            style={palier === 0 ? undefined : { width: `${zoom * 100}%` }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisionneuseImage;
