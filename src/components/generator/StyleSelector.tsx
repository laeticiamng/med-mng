import { TranslatedText } from '@/components/TranslatedText';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIBELLES_ENERGIE, STYLES_MUSICAUX, trouverStyle } from '@/config/stylesMusicaux';
import { Palette, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

/**
 * Choix du style musical : la liste vient du catalogue partagé avec le serveur
 * (src/config/stylesMusicaux.ts → supabase/functions/_shared/mm-suno-requete.ts).
 * Seul le slug est envoyé ; le serveur construit le style Suno.
 */
export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  setSelectedStyle
}) => {
  const styleChoisi = useMemo(() => trouverStyle(selectedStyle), [selectedStyle]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
          <TranslatedText text="Style musical" />
        </label>
        <Badge variant="secondary" className="text-xs">
          {STYLES_MUSICAUX.length} styles
        </Badge>
      </div>

      <Select value={styleChoisi?.slug ?? ''} onValueChange={setSelectedStyle}>
        <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base bg-card/50 backdrop-blur-sm border-border/30 shadow-lg" aria-label="Style musical">
          <SelectValue placeholder="Choisissez un style" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl max-h-72 sm:max-h-80 overflow-y-auto">
          {STYLES_MUSICAUX.map((style) => (
            <SelectItem
              key={style.slug}
              value={style.slug}
              className="text-sm sm:text-base py-2.5 sm:py-3 pl-4 hover:bg-accent/10"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{style.libelle}</span>
                <span className="text-muted-foreground text-xs sm:text-sm hidden sm:inline">– {style.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {styleChoisi && (
        <div className="p-3 sm:p-4 bg-accent/5 border border-accent/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="font-bold text-foreground text-sm sm:text-lg truncate">{styleChoisi.libelle}</span>
                <Badge variant="outline" className="text-xs shrink-0">{LIBELLES_ENERGIE[styleChoisi.energie]}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{styleChoisi.description}</p>
              <p className="text-xs text-muted-foreground/80 mt-1 hidden sm:block" title="Consigne envoyée au service de génération">
                {styleChoisi.prompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
