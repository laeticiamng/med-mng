import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { getStylesByGenre } from '@/components/edn/music/MusicStylesData';
import { Badge } from '@/components/ui/badge';
import { Palette, Music2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  setSelectedStyle
}) => {
  const stylesByGenre = getStylesByGenre();
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Trouver le style sélectionné pour l'aperçu
  const selectedStyleData = useMemo(() => {
    for (const [genre, styles] of Object.entries(stylesByGenre)) {
      const found = (styles as any[]).find(s => s.value === selectedStyle);
      if (found) return { ...found, genre };
    }
    return null;
  }, [stylesByGenre, selectedStyle]);

  // Compter le nombre total de styles
  const totalStyles = useMemo(() => {
    return Object.values(stylesByGenre).reduce((acc, styles) => acc + (styles as any[]).length, 0);
  }, [stylesByGenre]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-5 w-5 text-accent" />
          <TranslatedText text="Style musical" />
        </label>
        <Badge variant="secondary" className="text-xs">
          {totalStyles} styles
        </Badge>
      </div>
      
      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
        <SelectTrigger className="h-14 text-base bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
          <SelectValue placeholder="Choisissez un style musical" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/30 shadow-2xl max-h-80 overflow-y-auto">
          {Object.entries(stylesByGenre).map(([genre, styles]: [string, any[]]) => (
            <div key={genre}>
              <div className="px-3 py-2 text-xs font-bold text-primary bg-primary/10 sticky top-0 flex items-center gap-2">
                <Music2 className="h-3 w-3" />
                {genre}
                <Badge variant="outline" className="text-xs ml-auto">
                  {styles.length}
                </Badge>
              </div>
              {styles.map((style) => (
                <SelectItem 
                  key={style.value} 
                  value={style.value} 
                  className="text-base py-3 pl-4 hover:bg-accent/10"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{style.label}</span>
                    <span className="text-muted-foreground text-sm">- {style.description}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      
      {/* Aperçu du style sélectionné avec info enrichie */}
      {selectedStyleData && (
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-accent/10 rounded-xl flex items-center justify-center shadow-inner">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-foreground text-lg">{selectedStyleData.label}</span>
                <Badge variant="outline" className="text-xs">{selectedStyleData.genre}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedStyleData.description}</p>
            </div>
            
            {/* Indicateur visuel de qualité */}
            <div className="flex flex-col items-center gap-1 px-3 py-2 bg-background/50 rounded-lg border border-border/30">
              <span className="text-xs text-muted-foreground">Qualité</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star} 
                    className={`w-2 h-2 rounded-full ${star <= 4 ? 'bg-warning' : 'bg-muted'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};