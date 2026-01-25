
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info, Target } from 'lucide-react';

export const AuditIC5 = () => {
  const auditResults = {
    conformiteELisa: {
      status: 'insuffisant',
      score: 67,
      details: [
        'Rang A: 10/15 concepts LiSA manquants (67% couverture)',
        'Pas de concepts Rang B selon LiSA',
        'Responsabilités médicales partielles',
        'Gestion erreurs et EIAS incomplètes'
      ]
    },
    completude: {
      status: 'insuffisant',
      score: 65,
      details: [
        'Responsabilité pénale/civile: définitions manquantes',
        'Différences faute/erreur/accident médical floues',
        'Aléa thérapeutique mal défini',
        'Culture positive erreur absente'
      ]
    },
    pedagogie: {
      status: 'ameliorer',
      score: 72,
      details: [
        'Cas cliniques responsabilité médicale',
        'Simulations gestion erreurs',
        'Ateliers analyse facteurs humains',
        'Formation culture sécurité'
      ]
    },
    actualite: {
      status: 'ameliorer',
      score: 68,
      details: [
        'Évolution jurisprudence médicale',
        'Nouveaux contentieux post-COVID',
        'Télémédecine et responsabilités',
        'IA médicale et responsabilité'
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-success/10 text-success border-success/30';
      case 'bon': return 'bg-primary/10 text-primary border-primary/30';
      case 'ameliorer': return 'bg-warning/10 text-warning border-warning/30';
      case 'insuffisant': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'bon': return <Info className="h-5 w-5 text-primary" />;
      case 'ameliorer': return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'insuffisant': return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const scoreGlobal = Math.round(
    (auditResults.conformiteELisa.score + 
     auditResults.completude.score + 
     auditResults.pedagogie.score + 
     auditResults.actualite.score) / 4
  );

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Target className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-bold text-foreground">Audit IC-5 : Responsabilités médicale et gestion des erreurs</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-destructive">{scoreGlobal}%</div>
            <div className="text-sm text-muted-foreground">Score global</div>
          </div>
          <Badge className="bg-destructive/10 text-destructive text-lg px-4 py-2">
            ❌ 15 Rang A LiSA - 0 Rang B
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(auditResults).map(([key, result]) => (
          <Card key={key} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(result.status)}
                <h3 className="font-semibold text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">{result.score}%</div>
                <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                  {result.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {result.details.map((detail, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-destructive/5 to-warning/5">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Plan rattrapage IC-5 selon LiSA</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-destructive mb-2">🚨 Concepts Rang A manquants (5/15)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Définition responsabilité administrative</li>
              <li>• Définition responsabilité disciplinaire</li>
              <li>• Définition responsabilité sans faute</li>
              <li>• Facteurs conduisant contentieux</li>
              <li>• Culture positive de l'erreur</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-success mb-2">✅ Concepts LiSA acquis (10/15)</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Responsabilité pénale/civile</li>
              <li>• Faute vs erreur médicale</li>
              <li>• Accident médical/iatrogène</li>
              <li>• Infection nosocomiale</li>
              <li>• Aléa thérapeutique</li>
              <li>• Erreur humaine/facteurs/prévention</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
