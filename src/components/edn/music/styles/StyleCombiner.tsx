
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Sparkles, Shuffle } from 'lucide-react';
import { allMusicStyles, getCompatibleStyles, isPremiumStyle, musicStylesCategories } from './MusicStylesData';

interface StyleCombinerProps {
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  maxCombinations?: number;
}

export const StyleCombiner = ({ 
  selectedStyles, 
  onStylesChange, 
  maxCombinations = 3 
}: StyleCombinerProps) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  const addStyle = (styleValue: string) => {
    if (selectedStyles.length >= maxCombinations) return;
    if (!selectedStyles.includes(styleValue)) {
      onStylesChange([...selectedStyles, styleValue]);
    }
  };

  const removeStyle = (styleValue: string) => {
    onStylesChange(selectedStyles.filter(s => s !== styleValue));
  };

  const getRandomCombination = () => {
    const availableStyles = allMusicStyles.filter(s => !selectedStyles.includes(s.value));
    const shuffled = availableStyles.sort(() => 0.5 - Math.random());
    const combination = shuffled.slice(0, Math.min(3, maxCombinations));
    onStylesChange(combination.map(s => s.value));
  };

  const getSuggestedStyles = () => {
    if (selectedStyles.length === 0) return [];
    
    const lastSelectedStyle = selectedStyles[selectedStyles.length - 1];
    const compatible = getCompatibleStyles(lastSelectedStyle || '');
    return compatible.filter(s => !selectedStyles.includes(s.value)).slice(0, 4);
  };

  const getStyleLabel = (value: string) => {
    return allMusicStyles.find(s => s.value === value)?.label || value;
  };

  const getCombinationDescription = () => {
    if (selectedStyles.length < 2) return '';
    
    const styles = selectedStyles.map(s => allMusicStyles.find(style => style.value === s));
    const moods = [...new Set(styles.flatMap(s => s?.mood || []))];
    
    return `Fusion créative : ${moods.slice(0, 3).join(', ')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Combinaison de Styles Musicaux
        </CardTitle>
        <p className="text-sm text-gray-600">
          Combinez jusqu'à {maxCombinations} styles pour créer une expérience musicale unique
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Styles sélectionnés */}
        <div>
          <h4 className="font-medium mb-3">Styles Sélectionnés ({selectedStyles.length}/{maxCombinations})</h4>
          {selectedStyles.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedStyles.map((styleValue) => {
                  const style = allMusicStyles.find(s => s.value === styleValue);
                  return (
                    <Badge
                      key={styleValue}
                      variant="secondary"
                      className={`px-3 py-1 flex items-center gap-2 ${
                        isPremiumStyle(styleValue) ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200' : ''
                      }`}
                    >
                      {isPremiumStyle(styleValue) && <Sparkles className="h-3 w-3 text-purple-600" />}
                      {style?.label}
                      <button
                        onClick={() => removeStyle(styleValue)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              
              {selectedStyles.length >= 2 && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-800">
                    {getCombinationDescription()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun style sélectionné</p>
          )}
        </div>

        <Separator />

        {/* Suggestions intelligentes */}
        {getSuggestedStyles().length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Suggestions Compatibles
            </h4>
            <div className="flex flex-wrap gap-2">
              {getSuggestedStyles().map((style) => (
                <Button
                  key={style.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addStyle(style.value)}
                  disabled={selectedStyles.length >= maxCombinations}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {style.label}
                  {isPremiumStyle(style.value) && <Sparkles className="h-3 w-3 ml-1 text-purple-600" />}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getRandomCombination}
            className="flex items-center gap-2"
          >
            <Shuffle className="h-4 w-4" />
            Combinaison Aléatoire
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllStyles(!showAllStyles)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showAllStyles ? 'Masquer' : 'Voir Tous les Styles'}
          </Button>
        </div>

        {/* Catalogue complet des styles */}
        {showAllStyles && (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium">Catalogue Complet</h4>
            
            {Object.entries(musicStylesCategories).map(([categoryKey, categoryLabel]) => {
              const stylesInCategory = allMusicStyles.filter(s => s.category === categoryKey);
              if (stylesInCategory.length === 0) return null;
              
              return (
                <div key={categoryKey} className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">{categoryLabel}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {stylesInCategory.map((style) => (
                      <Card
                        key={style.value}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedStyles.includes(style.value) 
                            ? 'ring-2 ring-purple-500 bg-purple-50' 
                            : 'hover:bg-gray-50'
                        } ${
                          selectedStyles.length >= maxCombinations && !selectedStyles.includes(style.value)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        onClick={() => {
                          if (selectedStyles.includes(style.value)) {
                            removeStyle(style.value);
                          } else if (selectedStyles.length < maxCombinations) {
                            addStyle(style.value);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-sm flex items-center gap-1">
                            {style.label}
                            {isPremiumStyle(style.value) && (
                              <Sparkles className="h-3 w-3 text-purple-600" />
                            )}
                          </h6>
                          {selectedStyles.includes(style.value) && (
                            <Badge variant="secondary" className="text-xs">Sélectionné</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{style.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {style.mood.slice(0, 2).map((mood) => (
                            <Badge key={mood} variant="outline" className="text-xs">
                              {mood}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
