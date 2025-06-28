
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StyleSelectorProps {
  style: string;
  onStyleChange: (value: string) => void;
  disabled?: boolean;
}

const musicStyles = [
  { value: 'lofi-piano', label: 'Lo-Fi Piano' },
  { value: 'afrobeat', label: 'Afrobeat' },
  { value: 'jazz-moderne', label: 'Jazz Moderne' },
  { value: 'hip-hop-conscient', label: 'Hip-Hop Conscient' },
  { value: 'soul-rnb', label: 'Soul & R&B' },
  { value: 'electro-chill', label: 'Electro Chill' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  style,
  onStyleChange,
  disabled = false
}) => {
  return (
    <div>
      <Label htmlFor="style">Style musical</Label>
      <Select value={style} onValueChange={onStyleChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Choisissez un style" />
        </SelectTrigger>
        <SelectContent>
          {musicStyles.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { musicStyles };
