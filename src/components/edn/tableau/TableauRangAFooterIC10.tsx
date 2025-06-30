
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Globe } from 'lucide-react';

interface TableauRangAFooterIC10Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC10: React.FC<TableauRangAFooterIC10Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-800">
          IC-10 : Approches transversales du corps
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {lignesCount} dimensions corporelles
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">
            {colonnesCount} approches transversales
          </span>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300 w-fit">
          Approche holistique
        </Badge>
      </div>
      
      <div className="text-sm text-purple-700 leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Comprendre les dimensions multiples du corps humain 
          et intégrer les approches transversales dans la pratique médicale.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Dimensions culturelles, sociales et psychologiques du corps, 
          personnalisation des soins selon les spécificités individuelles.
        </p>
        <p>
          <strong>Vigilance :</strong> Éviter le réductionnisme biomédical, respecter les différences 
          culturelles et maintenir une approche intégrative.
        </p>
      </div>
    </Card>
  );
};
