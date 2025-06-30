
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
  { code: 'IC1', title: 'La relation médecin-malade' },
  { code: 'IC2', title: 'Les valeurs professionnelles du médecin' },
  { code: 'IC3', title: 'Raisonnement et décision en médecine' },
  { code: 'IC4', title: 'Qualité et sécurité des soins' },
  { code: 'IC5', title: 'Organisation du système de santé' },
  { code: 'IC6', title: 'Organisation de l\'exercice clinique et sécurisation' },
  { code: 'IC7', title: 'Les discriminations' },
  { code: 'IC8', title: 'Certificats médicaux dans le cadre des violences' },
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
