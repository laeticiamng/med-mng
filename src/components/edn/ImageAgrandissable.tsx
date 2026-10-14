import { VisionneuseImage } from '@/components/edn/VisionneuseImage';
import { cn } from '@/lib/utils';
import { ZoomIn } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface ImageAgrandissableProps {
  src: string;
  alt: string;
  /** Titre court de l'image : nom du bouton « Agrandir » et titre de la visionneuse. */
  titre: string;
  /** Classes du cadre (arrondis, marges). */
  className?: string;
  /** Appelé à l'ouverture de la visionneuse (ex. arrêter un diaporama). */
  surAgrandissement?: () => void;
}

/**
 * Image affichée EN ENTIER (largeur du cadre, hauteur proportionnelle,
 * `object-contain`, plafonnée à 70 % de la hauteur de l'écran) : jamais de
 * hauteur fixe ni de `object-cover`, qui rognaient les planches (images
 * 1536 × 1024 affichées dans un bandeau de 192 ou 384 px de haut). Un clic, ou
 * Entrée / Espace sur le bouton, ouvre la visionneuse accessible.
 */
export const ImageAgrandissable: React.FC<ImageAgrandissableProps> = ({
  src,
  alt,
  titre,
  className,
  surAgrandissement,
}) => {
  const [ouverte, setOuverte] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <button
        ref={boutonRef}
        type="button"
        onClick={() => {
          surAgrandissement?.();
          setOuverte(true);
        }}
        aria-label={`Agrandir l'image : ${titre}`}
        aria-haspopup="dialog"
        className="group block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="mx-auto block h-auto max-h-[70vh] w-full object-contain"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow ring-1 ring-border"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Agrandir
        </span>
      </button>
      <VisionneuseImage
        open={ouverte}
        onOpenChange={setOuverte}
        src={src}
        alt={alt}
        titre={titre}
        retourFocus={boutonRef}
      />
    </div>
  );
};

export default ImageAgrandissable;
