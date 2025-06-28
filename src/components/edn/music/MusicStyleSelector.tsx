
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Sparkles } from 'lucide-react';
import { allMusicStyles, musicStylesCategories } from './styles/MusicStylesData';

interface MusicStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const MusicStyleSelector = ({ selectedStyle, onStyleChange }: MusicStyleSelectorProps) => {
  const getStylesByCategory = (category: string) => {
    return allMusicStyles.filter(s => s.category === category);
  };

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Settings className="h-5 w-5 text-amber-600" />
        <span className="font-medium text-amber-800">Style Musical Premium</span>
      </div>
      <Select value={selectedStyle} onValueChange={onStyleChange}>
        <SelectTrigger className="border-amber-300 focus:border-amber-500">
          <SelectValue placeholder="Choisissez votre style musical" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {/* Styles populaires en premier */}
          <SelectItem value="" disabled className="font-medium text-xs uppercase tracking-wider text-gray-500">
            🔥 Styles Populaires
          </SelectItem>
          <SelectItem value="lofi-piano">Lo-Fi Piano</SelectItem>
          <SelectItem value="jazz-moderne">Jazz Moderne</SelectItem>
          <SelectItem value="electro-chill">Electro Chill</SelectItem>
          <SelectItem value="afrobeat">Afrobeat</SelectItem>
          
          {/* Styles par catégorie */}
          {Object.entries(musicStylesCategories).map(([categoryKey, categoryLabel]) => {
            const stylesInCategory = getStylesByCategory(categoryKey);
            if (stylesInCategory.length === 0) return null;
            
            return (
              <div key={categoryKey}>
                <SelectItem value={categoryKey} disabled className="font-medium text-xs uppercase tracking-wider text-gray-500 mt-2">
                  {categoryLabel}
                </SelectItem>
                {stylesInCategory.map((style) => (
                  <SelectItem key={style.value} value={style.value} className="pl-4">
                    <div className="flex items-center gap-2 w-full">
                      <span>{style.label}</span>
                      {style.premium && <Sparkles className="h-3 w-3 text-purple-600 ml-auto" />}
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Aperçu du style sélectionné */}
      {selectedStyle && (() => {
        const style = allMusicStyles.find(s => s.value === selectedStyle);
        if (!style) return null;
        
        return (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-amber-800">{style.label}</span>
              {style.premium && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">Premium</span>
                </div>
              )}
            </div>
            <p className="text-sm text-amber-700 mb-2">{style.description}</p>
            <div className="flex flex-wrap gap-1">
              {style.mood.slice(0, 3).map((mood) => (
                <span key={mood} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {mood}
                </span>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
