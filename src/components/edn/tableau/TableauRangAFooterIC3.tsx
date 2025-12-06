
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface TableauRangAFooterIC3Props {
  colonnesCount: number;
  lignesCount: number;
  isRangB?: boolean;
}

export const TableauRangAFooterIC3 = ({ colonnesCount, lignesCount, isRangB = false }: TableauRangAFooterIC3Props) => {
  const expectedCount = isRangB ? 8 : 15;
  const completionRate = Math.round((lignesCount / expectedCount) * 100);
  
  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Synthèse IC-3 - {isRangB ? 'Rang B' : 'Rang A'}
          </h3>
        </div>
        <Badge variant="outline" className="text-primary border-primary/30">
          {lignesCount}/{expectedCount} concepts E-LiSA
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-background rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-primary">{completionRate}%</div>
          <div className="text-sm text-muted-foreground">Conformité E-LiSA</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-accent">{colonnesCount}</div>
          <div className="text-sm text-muted-foreground">Dimensions d'analyse</div>
        </div>
        <div className="text-center p-3 bg-background rounded-lg border border-primary/10">
          <div className="text-2xl font-bold text-accent">{lignesCount}</div>
          <div className="text-sm text-muted-foreground">Concepts maîtrisés</div>
        </div>
      </div>

      {completionRate < 100 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-medium text-warning">Attention</span>
          </div>
          <p className="text-sm text-warning/80">
            {expectedCount - lignesCount} concepts E-LiSA manquants pour une conformité complète du {isRangB ? 'Rang B' : 'Rang A'}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-primary mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {isRangB ? 'Expertise avancée' : 'Fondamentaux essentiels'}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {isRangB ? (
              <>
                <li>• Supports au raisonnement clinique</li>
                <li>• Bases d'information médicale</li>
                <li>• Logique thérapeutique</li>
                <li>• Analyse décisionnelle avancée</li>
              </>
            ) : (
              <>
                <li>• Médecine basée sur les preuves</li>
                <li>• Styles de raisonnement</li>
                <li>• Décision médicale et partagée</li>
                <li>• TICE et aide à la décision</li>
              </>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-accent mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Objectifs pédagogiques
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {isRangB ? (
              <>
                <li>• Maîtriser les outils de raisonnement</li>
                <li>• Analyser les dynamiques décisionnelles</li>
                <li>• Comprendre les architectures SI</li>
                <li>• Gérer les controverses médicales</li>
              </>
            ) : (
              <>
                <li>• Comprendre les principes de l'EBM</li>
                <li>• Maîtriser la démarche clinique</li>
                <li>• Utiliser les outils d'aide à la décision</li>
                <li>• Intégrer préférences patients</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};
