
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Network } from 'lucide-react';

interface TableauRangAFooterIC6Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC6: React.FC<TableauRangAFooterIC6Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-blue-800">
          IC-6 : Organisation de l'exercice clinique et sécurisation du parcours patient
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {lignesCount} concepts d'organisation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">
            {colonnesCount} dimensions de sécurisation
          </span>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-300 w-fit">
          Coordination interprofessionnelle
        </Badge>
      </div>
      
      <div className="text-sm text-blue-700 leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Maîtriser l'organisation des soins et la coordination 
          interprofessionnelle pour sécuriser le parcours patient.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Communication entre professionnels, continuité des soins, 
          protocoles de sécurisation et utilisation des systèmes d'information.
        </p>
        <p>
          <strong>Vigilance :</strong> Éviter la fragmentation des soins et garantir la transmission 
          effective des informations entre tous les acteurs.
        </p>
      </div>
    </Card>
  );
};
