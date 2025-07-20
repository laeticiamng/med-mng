
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Palette } from 'lucide-react';
import { StyleCombiner } from '@/components/edn/music/styles/StyleCombiner';
import { StylePreview } from '@/components/edn/music/styles/StylePreview';
import { allMusicStyles, musicStylesCategories } from '@/components/edn/music/styles/MusicStylesData';

interface StyleSelectorProps {
  style: string;
  onStyleChange: (value: string) => void;
  disabled?: boolean;
  allowCombinations?: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  style,
  onStyleChange,
  disabled = false,
  allowCombinations = false
}) => {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Styles existants pour la compatibilité
  const legacyStyles = [
    { value: 'lofi-piano', label: 'Lo-Fi Piano' },
    { value: 'afrobeat', label: 'Afrobeat' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul & R&B' },
    { value: 'electro-chill', label: 'Electro Chill' },
  ];

  const handleStyleChange = (value: string) => {
    onStyleChange(value);
    setSelectedStyles([value]);
  };

  const handleCombinationChange = (styles: string[]) => {
    setSelectedStyles(styles);
    // Combiner les styles en une seule valeur pour la compatibilité
    const combinedValue = styles.join('+');
    onStyleChange(combinedValue);
  };

  const getStylesByCategory = (category: string) => {
    return allMusicStyles.filter(s => s.category === category);
  };

  if (allowCombinations && showAdvanced) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="style">Style musical avancé</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(false)}
          >
            Mode Simple
          </Button>
        </div>

        <StyleCombiner
          selectedStyles={selectedStyles}
          onStylesChange={handleCombinationChange}
          maxCombinations={3}
        />

        <StylePreview
          selectedStyles={selectedStyles}
          showAudioPreview={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="style">Style musical</Label>
        {allowCombinations && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(true)}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            Mode Avancé
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {/* Sélecteur simple */}
        <Select value={style} onValueChange={handleStyleChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Choisissez un style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="placeholder" disabled>-- Choisir un style --</SelectItem>
            
            {/* Styles populaires */}
            <SelectItem value="popular" disabled className="font-medium text-xs uppercase tracking-wider text-gray-500">
              🔥 Styles Populaires
            </SelectItem>
            {legacyStyles.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
            
            {/* Styles par catégorie */}
            {Object.entries(musicStylesCategories).map(([categoryKey, categoryLabel]) => {
              const stylesInCategory = getStylesByCategory(categoryKey);
              if (stylesInCategory.length === 0) return null;
              
              return (
                <React.Fragment key={categoryKey}>
                  <SelectItem value={categoryKey} disabled className="font-medium text-xs uppercase tracking-wider text-gray-500">
                    {categoryLabel}
                  </SelectItem>
                  {stylesInCategory.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="pl-4">
                      <div className="flex items-center gap-2">
                        {s.premium && <Sparkles className="h-3 w-3 text-purple-600" />}
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </React.Fragment>
              );
            })}
          </SelectContent>
        </Select>

        {/* Aperçu du style sélectionné */}
        {style && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              {(() => {
                const selectedStyle = allMusicStyles.find(s => s.value === style);
                if (!selectedStyle) return null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{selectedStyle.label}</h4>
                      {selectedStyle.premium && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-purple-600" />
                          <span className="text-xs text-purple-600 font-medium">Premium</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{selectedStyle.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStyle.mood.slice(0, 3).map((mood) => (
                        <span key={mood} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Promotion du mode avancé */}
        {allowCombinations && !showAdvanced && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Créations Musicales Uniques
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 mb-3">
                Combinez plusieurs styles musicaux pour créer des compositions totalement personnalisées !
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(true)}
                className="w-full border-purple-200 hover:bg-purple-50"
              >
                <Palette className="h-4 w-4 mr-2" />
                Découvrir le Mode Créateur
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export { allMusicStyles as musicStyles };
