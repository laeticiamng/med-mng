import {
  LIBELLES_ENERGIE,
  STYLES_MUSICAUX,
  trouverStyle,
} from '@/config/stylesMusicaux';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React, { useMemo } from 'react';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

/**
 * Choix de l'ambiance : les 13 styles du catalogue partagé avec le serveur
 * (src/config/stylesMusicaux.ts → supabase/functions/_shared/mm-suno-requete.ts),
 * visibles d'un coup d'œil plutôt que cachés dans un menu. Seul le slug est
 * envoyé ; le serveur construit la consigne musicale (tags anglais, interne).
 */
export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  setSelectedStyle,
}) => {
  const styleChoisi = useMemo(
    () => trouverStyle(selectedStyle),
    [selectedStyle]
  );

  return (
    <div
      role="radiogroup"
      aria-label="Ambiance musicale"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
    >
      {STYLES_MUSICAUX.map((style) => {
        const choisi = styleChoisi?.slug === style.slug;
        return (
          <button
            key={style.slug}
            type="button"
            role="radio"
            aria-checked={choisi}
            onClick={() => setSelectedStyle(style.slug)}
            className={cn(
              'relative rounded-xl border px-3 py-2.5 text-left',
              'transition-[border-color,background-color,box-shadow] duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              choisi
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-background/50 hover:border-primary/40 hover:bg-background/80'
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {style.libelle}
              </span>
              {choisi && (
                <Check
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              {style.description}
            </span>
            <span className="mt-1 hidden text-[11px] text-muted-foreground/80 sm:block">
              {LIBELLES_ENERGIE[style.energie]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
