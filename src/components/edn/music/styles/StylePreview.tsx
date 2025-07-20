
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Volume2 } from 'lucide-react';
import { allMusicStyles, isPremiumStyle } from './MusicStylesData';

interface StylePreviewProps {
  selectedStyles: string[];
  onPreview?: (styles: string[]) => void;
  showAudioPreview?: boolean;
}

export const StylePreview = ({ selectedStyles, onPreview, showAudioPreview = true }: StylePreviewProps) => {
  if (selectedStyles.length === 0) return null;

  const styles = selectedStyles.map(s => allMusicStyles.find(style => style.value === s)).filter(Boolean);
  const allMoods = [...new Set(styles.flatMap(s => s?.mood || []))];
  const hasPremiumStyles = selectedStyles.some(s => isPremiumStyle(s));

  const generatePreviewDescription = () => {
    if (selectedStyles.length === 1) {
      const style = styles[0];
      return `Création musicale en ${style?.label} - ${style?.description}`;
    }
    
    if (selectedStyles.length === 2) {
      return `Fusion créative entre ${styles[0]?.label} et ${styles[1]?.label}`;
    }
    
    return `Expérience musicale unique combinant ${selectedStyles.length} styles différents`;
  };

  const getEstimatedDuration = () => {
    // Plus de styles = musique plus riche et potentiellement plus longue
    const baseDuration = 240; // 4 minutes
    const additionalTime = (selectedStyles.length - 1) * 30; // 30s par style supplémentaire
    return baseDuration + additionalTime;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`${hasPremiumStyles ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Titre de la composition */}
          <div className="flex items-center gap-2">
            {hasPremiumStyles && <Sparkles className="h-5 w-5 text-purple-600" />}
            <h3 className="font-semibold text-lg">
              {selectedStyles.length === 1 ? 'Style Sélectionné' : 'Composition Personnalisée'}
            </h3>
            {hasPremiumStyles && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Premium
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700">{generatePreviewDescription()}</p>

          {/* Styles utilisés */}
          <div className="flex flex-wrap gap-2">
            {styles.map((style, index) => (
              <Badge
                key={style?.value}
                variant="secondary"
                className={`${
                  isPremiumStyle(style?.value || '') 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200' 
                    : 'bg-blue-100 border-blue-200'
                }`}
              >
                {style?.label}
              </Badge>
            ))}
          </div>

          {/* Ambiances et moods */}
          <div>
            <h4 className="font-medium text-sm mb-2">Ambiances :</h4>
            <div className="flex flex-wrap gap-1">
              {allMoods.slice(0, 6).map((mood) => (
                <Badge key={mood} variant="outline" className="text-xs">
                  {mood}
                </Badge>
              ))}
              {allMoods.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{allMoods.length - 6} autres
                </Badge>
              )}
            </div>
          </div>

          {/* Informations techniques */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-white/50 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Durée estimée :</span>
              <p className="font-medium">{formatDuration(getEstimatedDuration())}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Complexité :</span>
              <p className="font-medium">
                {selectedStyles.length === 1 ? 'Standard' : 
                 selectedStyles.length === 2 ? 'Élevée' : 'Très Élevée'}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          {showAudioPreview && onPreview && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onPreview(selectedStyles)}
                className="flex items-center gap-2"
                disabled={selectedStyles.length === 0}
              >
                <Play className="h-4 w-4" />
                Écouter Aperçu
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={selectedStyles.length === 0}
              >
                <Volume2 className="h-4 w-4" />
                Prévisualisation
              </Button>
            </div>
          )}

          {/* Note premium */}
          {hasPremiumStyles && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-purple-800">
                Cette composition utilise des styles premium pour une expérience musicale exceptionnelle
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
