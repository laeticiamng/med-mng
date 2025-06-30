
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, FileText, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC9Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC9: React.FC<TableauRangAFooterIC9Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="h-6 w-6 text-red-600" />
        <h3 className="text-xl font-bold text-red-800">
          IC-9 : Certificats médicaux dans le cadre des violences
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">
            {lignesCount} concepts médico-légaux
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">
            {colonnesCount} dimensions d'analyse
          </span>
        </div>
        <Badge variant="outline" className="text-red-600 border-red-300 w-fit">
          Expertise judiciaire
        </Badge>
      </div>
      
      <div className="text-sm text-red-700 leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Maîtriser la rédaction des certificats médicaux 
          dans le contexte des violences et comprendre les implications médico-légales.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Description objective des lésions, calcul de l'ITT, 
          respect du cadre déontologique et procédural.
        </p>
        <p>
          <strong>Vigilance :</strong> Ne jamais interpréter les causes, rester dans le domaine 
          médical strict, assurer la traçabilité et la précision des observations.
        </p>
      </div>
    </Card>
  );
};
