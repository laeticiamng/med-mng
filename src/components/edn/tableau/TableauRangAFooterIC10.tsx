
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
    <Card className="mt-6 p-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="h-6 w-6 text-accent" />
        <h3 className="text-xl font-bold text-accent">
          IC-10 : Approches transversales du corps
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-accent/80">
            {lignesCount} dimensions corporelles
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary/80">
            {colonnesCount} approches transversales
          </span>
        </div>
        <Badge variant="outline" className="text-accent border-accent/30 w-fit">
          Approche holistique
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground leading-relaxed">
        <p className="mb-2">
          <strong className="text-foreground">Objectif pédagogique :</strong> Comprendre les dimensions multiples du corps humain 
          et intégrer les approches transversales dans la pratique médicale.
        </p>
        <p className="mb-2">
          <strong className="text-foreground">Points clés :</strong> Dimensions culturelles, sociales et psychologiques du corps, 
          personnalisation des soins selon les spécificités individuelles.
        </p>
        <p>
          <strong className="text-foreground">Vigilance :</strong> Éviter le réductionnisme biomédical, respecter les différences 
          culturelles et maintenir une approche intégrative.
        </p>
      </div>
    </Card>
  );
};
