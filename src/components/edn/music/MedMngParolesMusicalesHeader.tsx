
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';

interface MedMngParolesMusicalesHeaderProps {
  itemCode: string;
  currentLanguage: string;
}

export const MedMngParolesMusicalesHeader: React.FC<MedMngParolesMusicalesHeaderProps> = ({
  itemCode,
  currentLanguage
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Music className="h-6 w-6 text-amber-600" />
        Génération Musicale MED-MNG - {itemCode}
      </CardTitle>
      <CardDescription>
        Génération sécurisée avec streaming via MED-MNG en {currentLanguage}
      </CardDescription>
    </CardHeader>
  );
};
