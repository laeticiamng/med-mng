
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Shield } from 'lucide-react';

interface TableauRangAFooterOIC010Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterOIC010: React.FC<TableauRangAFooterOIC010Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="h-6 w-6 text-accent" />
        <h3 className="text-xl font-bold text-accent-foreground">
          OIC-010-03-B : Impact des maladies sur l'expérience du corps
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent-foreground">
            {lignesCount} impacts psychocorporels
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {colonnesCount} dimensions d'évaluation
          </span>
        </div>
        <Badge variant="outline" className="text-accent border-accent/30 w-fit">
          Approche psychosomatique
        </Badge>
      </div>
      
      <div className="text-sm text-accent-foreground leading-relaxed">
        <p className="mb-2">
          <strong>Objectif pédagogique :</strong> Comprendre et évaluer l'impact des maladies 
          sur l'identité corporelle et l'expérience psychologique du patient.
        </p>
        <p className="mb-2">
          <strong>Points clés :</strong> Changements identitaires, répercussions psychologiques, 
          adaptation sociale et accompagnement multidisciplinaire.
        </p>
        <p>
          <strong>Vigilance :</strong> Ne pas sous-estimer l'impact psychologique, accompagner 
          les changements d'identité corporelle sur le long terme.
        </p>
      </div>
    </Card>
  );
};
