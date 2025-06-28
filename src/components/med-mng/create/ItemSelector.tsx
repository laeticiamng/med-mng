
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemSelectorProps {
  selectedItem: string;
  selectedRang: string;
  onItemChange: (value: string) => void;
  onRangChange: (value: string) => void;
  disabled?: boolean;
}

const ednitems = [
  { code: 'IC1', title: 'Item à Choix Multiples 1' },
  { code: 'IC2', title: 'Item à Choix Multiples 2' },
  { code: 'IC3', title: 'Item à Choix Multiples 3' },
  { code: 'IC4', title: 'Item à Choix Multiples 4' },
  { code: 'IC5', title: 'Item à Choix Multiples 5' },
];

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItem,
  selectedRang,
  onItemChange,
  onRangChange,
  disabled = false
}) => {
  return (
    <>
      <div>
        <Label htmlFor="item">Item EDN</Label>
        <Select value={selectedItem} onValueChange={onItemChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un item" />
          </SelectTrigger>
          <SelectContent>
            {ednitems.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.code} - {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rang">Rang</Label>
        <Select value={selectedRang} onValueChange={onRangChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le rang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Rang A - Colloque singulier</SelectItem>
            <SelectItem value="B">Rang B - Outils pratiques</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
