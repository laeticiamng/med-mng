
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Users } from 'lucide-react';

interface TableauRangAFooterIC9Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC9: React.FC<TableauRangAFooterIC9Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-800">
          IC-9 : Certificats médicaux dans le cadre des violences
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">
            {lignesCount} aspects médico-légaux
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-pink-600" />
          <span className="text-sm font-medium text-pink-700">
            {colonnesCount} mesures de protection
          </span>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300 w-fit">
          Expertise médico-légale
        </Badge>
      </div>
      
      <div className="text-sm text-purple-700 leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Maîtriser la rédaction des certificats médicaux 
          et l'accompagnement des victimes de violences.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Rédaction objective et factuelle, respect du secret médical, 
          accompagnement global des victimes et expertise médico-légale.
        </p>
        <p>
          <strong>Vigilance :</strong> Ne pas interpréter les causes, respecter l'autonomie de la victime 
          et connaître les limites de ses compétences.
        </p>
      </div>
    </Card>
  );
};
