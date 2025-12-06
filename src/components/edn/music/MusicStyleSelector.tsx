
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { musicStyles, getStylesByGenre, MusicStyle } from './MusicStylesData';
import { useState } from 'react';

interface MusicStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const MusicStyleSelector = ({ selectedStyle, onStyleChange }: MusicStyleSelectorProps) => {
  const [selectedVoice, setSelectedVoice] = useState<'all' | 'male' | 'female'>('all');
  const [selectedEnergy, setSelectedEnergy] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  const stylesByGenre = getStylesByGenre();

  const getFilteredStyles = (genreStyles: MusicStyle[]) => {
    return genreStyles.filter(style => {
      const voiceMatch = selectedVoice === 'all' || style.voiceType === selectedVoice || style.voiceType === 'both';
      const energyMatch = selectedEnergy === 'all' || style.energy === selectedEnergy;
      return voiceMatch && energyMatch;
    });
  };

  const selectedStyleData = musicStyles.find(style => style.value === selectedStyle);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎼 Style Musical
          {selectedStyle && (
            <Badge variant="outline" className="ml-2">
              {selectedStyleData?.label}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Choisissez le style musical parfait pour votre génération
        </CardDescription>
        {selectedStyleData && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{selectedStyleData.genre}</Badge>
            <Badge variant="outline">
              {selectedStyleData.voiceType === 'male' ? '♂️ Voix masculine' : 
               selectedStyleData.voiceType === 'female' ? '♀️ Voix féminine' : 
               '👥 Mixte'}
            </Badge>
            <Badge variant="outline">
              {selectedStyleData.energy === 'low' ? '🔅 Calme' :
               selectedStyleData.energy === 'medium' ? '🔆 Modéré' :
               '🔥 Énergique'}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection classique pour compatibilité - TOUJOURS VISIBLE */}
        <div className="p-4 border rounded-lg bg-amber-50">
          <label className="text-sm font-medium mb-2 block">✨ Sélection rapide (recommandée) :</label>
          <Select value={selectedStyle} onValueChange={onStyleChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisissez votre style musical" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun style sélectionné</SelectItem>
              {musicStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label} - {style.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedStyle && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Vous devez sélectionner un style pour pouvoir générer de la musique
            </p>
          )}
        </div>

        {/* Filtres avancés */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Voix:</label>
            <Select value={selectedVoice} onValueChange={(value: any) => setSelectedVoice(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="male">♂️ Masculine</SelectItem>
                <SelectItem value="female">♀️ Féminine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Énergie:</label>
            <Select value={selectedEnergy} onValueChange={(value: any) => setSelectedEnergy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="low">🔅 Calme</SelectItem>
                <SelectItem value="medium">🔆 Modéré</SelectItem>
                <SelectItem value="high">🔥 Énergique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sélection par genre */}
        <Tabs defaultValue="Lo-fi" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full text-xs">
            {Object.keys(stylesByGenre).map(genre => (
              <TabsTrigger key={genre} value={genre} className="text-xs">
                {genre}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(stylesByGenre).map(([genre, styles]) => {
            const filteredStyles = getFilteredStyles(styles);
            return (
              <TabsContent key={genre} value={genre} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredStyles.map(style => (
                    <div
                      key={style.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedStyle === style.value 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => onStyleChange(style.value)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm">{style.label}</h4>
                        <div className="flex gap-1">
                          {style.voiceType === 'male' && <span className="text-xs">♂️</span>}
                          {style.voiceType === 'female' && <span className="text-xs">♀️</span>}
                          {style.energy === 'low' && <span className="text-xs">🔅</span>}
                          {style.energy === 'medium' && <span className="text-xs">🔆</span>}
                          {style.energy === 'high' && <span className="text-xs">🔥</span>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </div>
                  ))}
                </div>
                {filteredStyles.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    Aucun style ne correspond aux filtres sélectionnés
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
