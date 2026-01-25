
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import React from 'react';

interface ParolesMusicalesHeaderProps {
  itemCode: string;
}

export const ParolesMusicalesHeader: React.FC<ParolesMusicalesHeaderProps> = ({ itemCode }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6 text-warning" />
          Génération Musicale - {itemCode}
        </CardTitle>
        <CardDescription>
          Créez des chansons pédagogiques personnalisées basées sur les tableaux d'apprentissage
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
