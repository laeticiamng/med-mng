import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface ItemSelectorProps {
  selectedItem: string;
  onItemSelect: (item: string) => void;
  disabled?: boolean;
}

// Items EDN simulés (à remplacer par votre vraie source de données)
const ednitems = [
  { code: 'IC1', title: 'Item à Choix Multiples 1 - Cardiologie' },
  { code: 'IC2', title: 'Item à Choix Multiples 2 - Pneumologie' },
  { code: 'IC3', title: 'Item à Choix Multiples 3 - Gastroentérologie' },
  { code: 'IC4', title: 'Item à Choix Multiples 4 - Neurologie' },
  { code: 'IC5', title: 'Item à Choix Multiples 5 - Endocrinologie' },
  { code: 'IC6', title: 'Item à Choix Multiples 6 - Dermatologie' },
  { code: 'IC7', title: 'Item à Choix Multiples 7 - Rhumatologie' },
  { code: 'IC8', title: 'Item à Choix Multiples 8 - Hématologie' },
  { code: 'IC9', title: 'Item à Choix Multiples 9 - Néphrologie' },
  { code: 'IC10', title: 'Item à Choix Multiples 10 - Urologie' },
];

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItem,
  onItemSelect,
  disabled = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          1. Sélectionnez un item EDN
        </CardTitle>
        <CardDescription>
          Choisissez l'item médical sur lequel vous souhaitez générer une chanson
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedItem} onValueChange={onItemSelect} disabled={disabled}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Sélectionnez un item EDN..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {ednitems.map((item) => (
              <SelectItem key={item.code} value={item.code} className="py-3">
                <div>
                  <div className="font-medium">{item.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};