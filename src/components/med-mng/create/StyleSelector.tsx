import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface StyleSelectorProps {
  style: string;
  onStyleChange: (style: string) => void;
  disabled?: boolean;
}

// Styles musicaux regroupés par genre
export const stylesByGenre = {
  'Musique Classique': [
    { value: 'classical-piano', label: 'Piano Classique', description: 'Élégant et structuré' },
    { value: 'orchestral', label: 'Orchestral', description: 'Grandiose et cinématographique' },
    { value: 'chamber-music', label: 'Musique de Chambre', description: 'Intime et raffiné' }
  ],
  'Musique Populaire': [
    { value: 'pop-melodic', label: 'Pop Mélodique', description: 'Accrocheur et mémorable' },
    { value: 'folk-acoustic', label: 'Folk Acoustique', description: 'Chaleureux et authentique' },
    { value: 'singer-songwriter', label: 'Singer-Songwriter', description: 'Personnel et expressif' }
  ],
  'Musique Électronique': [
    { value: 'ambient-electronic', label: 'Électronique Ambient', description: 'Atmosphérique et moderne' },
    { value: 'synthwave', label: 'Synthwave', description: 'Nostalgique et énergique' },
    { value: 'chillout', label: 'Chillout', description: 'Relaxant et contemporain' }
  ],
  'Autres Genres': [
    { value: 'jazz-smooth', label: 'Jazz Smooth', description: 'Sophistiqué et fluide' },
    { value: 'world-fusion', label: 'World Fusion', description: 'Multiculturel et riche' },
    { value: 'minimalist', label: 'Minimaliste', description: 'Épuré et contemplatif' }
  ]
};

// Export pour compatibilité avec les autres composants
export const musicStyles = Object.values(stylesByGenre).flat();

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  style,
  onStyleChange,
  disabled = false
}) => {
  return (
    <Card className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          3. Sélectionnez le style musical
        </CardTitle>
        <CardDescription>
          Choisissez le style musical qui accompagnera votre contenu éducatif
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={style} onValueChange={onStyleChange} disabled={disabled}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Choisissez un style musical..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {Object.entries(stylesByGenre).map(([genre, styles]) => (
              <div key={genre}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50">
                  {genre}
                </div>
                {styles.map((styleOption) => (
                  <SelectItem key={styleOption.value} value={styleOption.value} className="py-3 pl-4">
                    <div>
                      <div className="font-medium">{styleOption.label}</div>
                      <div className="text-sm text-muted-foreground">{styleOption.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};