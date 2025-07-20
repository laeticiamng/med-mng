import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslatedText } from '@/components/TranslatedText';
import { getStylesByGenre } from '@/components/edn/music/MusicStylesData';

interface StyleSelectorProps {
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  setSelectedStyle
}) => {
  const stylesByGenre = getStylesByGenre();

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900">
        <TranslatedText text="Style musical" />
      </label>
      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
        <SelectTrigger className="h-14 text-base bg-white/50 backdrop-blur-sm border-white/30 shadow-lg">
          <SelectValue placeholder="Choisissez un style musical" />
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl max-h-80 overflow-y-auto">
          {Object.entries(stylesByGenre).map(([genre, styles]: [string, any[]]) => (
            <div key={genre}>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                {genre}
              </div>
              {styles.map((style) => (
                <SelectItem key={style.value} value={style.value} className="text-base py-3 pl-4">
                  {style.label} - {style.description}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};