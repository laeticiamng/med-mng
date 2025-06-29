
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MusicStyleSelectorProps {
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const MusicStyleSelector = ({ selectedStyle, onStyleChange }: MusicStyleSelectorProps) => {
  const musicStyles = [
    { value: 'lofi-piano', label: 'Lo-fi Piano Doux' },
    { value: 'afrobeat', label: 'Afrobeat Énergique' },
    { value: 'jazz-moderne', label: 'Jazz Moderne' },
    { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
    { value: 'soul-rnb', label: 'Soul R&B' },
    { value: 'electro-chill', label: 'Electro Chill' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎼 Style Musical
        </CardTitle>
        <CardDescription>
          Choisissez le style musical pour votre génération
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedStyle} onValueChange={onStyleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez un style musical" />
          </SelectTrigger>
          <SelectContent>
            {musicStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
