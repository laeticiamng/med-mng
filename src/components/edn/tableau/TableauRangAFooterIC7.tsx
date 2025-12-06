
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, Heart } from 'lucide-react';

interface TableauRangAFooterIC7Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC7: React.FC<TableauRangAFooterIC7Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-success/5 to-success/10 border-success/20">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="h-6 w-6 text-success" />
        <h3 className="text-xl font-bold text-success">
          IC-7 : Les droits individuels et collectifs du patient
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">
            {lignesCount} droits fondamentaux
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">
            {colonnesCount} aspects de protection
          </span>
        </div>
        <Badge variant="outline" className="text-success border-success/30 w-fit">
          Respect et dignité
        </Badge>
      </div>
      
      <div className="text-sm text-success leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Comprendre et respecter les droits fondamentaux 
          des patients dans leur dimension individuelle et collective.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Consentement éclairé, respect de la vie privée, 
          droits collectifs en santé publique et médiation sanitaire.
        </p>
        <p>
          <strong>Vigilance :</strong> Équilibrer l'autonomie du patient avec la responsabilité 
          médicale, concilier intérêts individuels et collectifs.
        </p>
      </div>
    </Card>
  );
};
