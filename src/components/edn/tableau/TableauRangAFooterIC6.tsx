
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
    <Card className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-primary">
          IC-6 : Organisation de l'exercice clinique et sécurisation du parcours patient
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary/80">
            {lignesCount} concepts d'organisation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent/80">
            {colonnesCount} dimensions de sécurisation
          </span>
        </div>
        <Badge variant="outline" className="text-primary border-primary/30 w-fit">
          Coordination interprofessionnelle
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground leading-relaxed">
        <p className="mb-2">
          <strong className="text-foreground">Objectif pédagogique :</strong> Maîtriser l'organisation des soins et la coordination 
          interprofessionnelle pour sécuriser le parcours patient.
        </p>
        <p className="mb-2">
          <strong className="text-foreground">Points clés :</strong> Communication entre professionnels, continuité des soins, 
          protocoles de sécurisation et utilisation des systèmes d'information.
        </p>
        <p>
          <strong className="text-foreground">Vigilance :</strong> Éviter la fragmentation des soins et garantir la transmission 
          effective des informations entre tous les acteurs.
        </p>
      </div>
    </Card>
  );
};
