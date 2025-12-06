
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Shield } from 'lucide-react';

interface TableauRangAFooterIC8Props {
  colonnesCount: number;
  lignesCount: number;
}

export const TableauRangAFooterIC8: React.FC<TableauRangAFooterIC8Props> = ({
  colonnesCount,
  lignesCount
}) => {
  return (
    <Card className="mt-6 p-6 bg-gradient-to-r from-warning/5 to-destructive/5 border-warning/20">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-warning" />
        <h3 className="text-xl font-bold text-warning">
          IC-8 : Les discriminations
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-warning" />
          <span className="text-sm font-medium text-warning/80">
            {lignesCount} formes de discrimination
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive/80">
            {colonnesCount} stratégies de prévention
          </span>
        </div>
        <Badge variant="outline" className="text-warning border-warning/30 w-fit">
          Égalité des soins
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground leading-relaxed">
        <p className="mb-2">
          <strong className="text-foreground">Objectif pédagogique :</strong> Identifier, prévenir et lutter activement 
          contre toutes les formes de discrimination en santé.
        </p>
        <p className="mb-2">
          <strong className="text-foreground">Points clés :</strong> Reconnaissance des biais discriminatoires, protocoles 
          de prévention, intervention anti-discriminatoire et protection des victimes.
        </p>
        <p>
          <strong className="text-foreground">Vigilance :</strong> Examiner ses propres pratiques, surveiller les indicateurs 
          de disparités et ne pas rester passif face aux discriminations observées.
        </p>
      </div>
    </Card>
  );
};
