
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText, Shield } from 'lucide-react';
import React from 'react';

interface TableauRangAFooterIC9Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC9: React.FC<TableauRangAFooterIC9Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-accent/5 to-accent/10 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-6 w-6 text-accent" />
        <h3 className="text-xl font-bold text-accent">
          IC-9 : Certificats médicaux dans le cadre des violences
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent/80">
            {lignesCount} aspects médico-légaux
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary/80">
            {colonnesCount} mesures de protection
          </span>
        </div>
        <Badge variant="outline" className="text-accent border-accent/30 w-fit">
          Expertise médico-légale
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground leading-relaxed">
        <p className="mb-2">
          <strong className="text-foreground">Objectif pédagogique :</strong> Maîtriser la rédaction des certificats médicaux 
          et l'accompagnement des victimes de violences.
        </p>
        <p className="mb-2">
          <strong className="text-foreground">Points clés :</strong> Rédaction objective et factuelle, respect du secret médical, 
          accompagnement global des victimes et expertise médico-légale.
        </p>
        <p>
          <strong className="text-foreground">Vigilance :</strong> Ne pas interpréter les causes, respecter l'autonomie de la victime 
          et connaître les limites de ses compétences.
        </p>
      </div>
    </Card>
  );
};
